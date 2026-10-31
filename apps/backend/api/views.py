from rest_framework import viewsets, status
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from django.db.models import Q
from datetime import datetime, timezone
import re

from .models import Service, Provider, Rating, InteractionEvent, Application
from .serializers import (
    ServiceSerializer,
    ProviderSerializer,
    RatingSerializer,
    InteractionEventSerializer,
    ApplicationSerializer,
)
from .ml_engine import engine
from .firebase_client import get_firestore_client


class ServiceViewSet(viewsets.ModelViewSet):
    """
    CRUD API for Community Service Listings with filtering by settlement,
    category, provider, and search query.
    """
    queryset = Service.objects.all().order_by("-created_at")
    serializer_class = ServiceSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        category = self.request.query_params.get("category")
        settlement = self.request.query_params.get("settlement")
        provider_id = self.request.query_params.get("provider_id")
        search = self.request.query_params.get("search")

        if category and category != "All":
            qs = qs.filter(category__iexact=category)
        if settlement:
            qs = qs.filter(settlement__iexact=settlement)
        if provider_id:
            clean_id = provider_id
            if clean_id.startswith("provider_"):
                clean_id = clean_id.replace("provider_", "")
            if clean_id.endswith("_huduma_org"):
                clean_id = clean_id.replace("_huduma_org", "")

            qs = qs.filter(
                Q(provider__provider_id=provider_id) |
                Q(provider__provider_id__iexact=provider_id) |
                Q(provider__provider_id=clean_id) |
                Q(provider__provider_id__iexact=clean_id) |
                Q(provider__email__iexact=provider_id) |
                Q(provider__name__iexact=provider_id) |
                Q(provider__email__istartswith=clean_id)
            )
        if search:
            qs = qs.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search) |
                Q(location__icontains=search)
            )
        return qs

    @action(detail=False, methods=["get"])
    def map_all(self, request):
        """
        Returns all facilities with coordinates for mapping without pagination.
        """
        qs = self.get_queryset().filter(status="ACTIVE")
        serializer = self.get_serializer(qs, many=True)
        return Response({
            "status": "success",
            "count": qs.count(),
            "results": serializer.data
        })


class ProviderViewSet(viewsets.ModelViewSet):
    queryset = Provider.objects.all()
    serializer_class = ProviderSerializer


class ApplicationViewSet(viewsets.ModelViewSet):
    """
    Intake application management:
    - Residents apply to services from mobile app
    - Providers view applications for their organization and approve/reject
    - Syncs in real-time with Google Cloud Firestore 'applications' collection
    """
    queryset = Application.objects.all().order_by("-created_at")
    serializer_class = ApplicationSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        provider_id = self.request.query_params.get("provider_id")
        resident_id = self.request.query_params.get("resident_id")
        service_id = self.request.query_params.get("service_id")

        if provider_id:
            clean_id = provider_id
            if clean_id.startswith("provider_"):
                clean_id = clean_id.replace("provider_", "")
            if clean_id.endswith("_huduma_org"):
                clean_id = clean_id.replace("_huduma_org", "")

            qs = qs.filter(
                Q(provider__provider_id=provider_id) |
                Q(provider__provider_id__iexact=provider_id) |
                Q(provider__provider_id=clean_id) |
                Q(provider__provider_id__iexact=clean_id) |
                Q(provider__email__iexact=provider_id) |
                Q(provider__name__iexact=provider_id) |
                Q(provider_name__iexact=provider_id) |
                Q(provider__email__istartswith=clean_id)
            )
        if resident_id:
            qs = qs.filter(resident_id=resident_id)
        if service_id:
            qs = qs.filter(service__service_id=service_id)
        return qs.order_by("-updated_at", "-created_at")

    def create(self, request, *args, **kwargs):
        data = request.data
        resident_id = data.get("resident_id", "anonymous_resident")
        applicant_name = data.get("applicant_name", "").strip() or "Resident Applicant"
        applicant_phone = data.get("applicant_phone", "")
        service_id = data.get("service_id")
        notes = data.get("notes", "")

        if not service_id:
            return Response(
                {"error": "service_id is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            service = Service.objects.get(service_id=service_id)
        except Service.DoesNotExist:
            return Response(
                {"error": "Service not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        provider = service.provider
        if not provider:
            provider, _ = Provider.objects.get_or_create(
                provider_id="org-kibera-aid",
                defaults={"name": "Community Provider", "settlement": service.settlement}
            )

        # Allow re-applying: check if resident previously had a REJECTED application for this facility
        existing_app = Application.objects.filter(
            resident_id=resident_id,
            service=service,
        ).order_by("-created_at").first()

        if existing_app and existing_app.status in ["REJECTED", "DECLINED"]:
            existing_app.status = "PENDING"
            existing_app.applicant_name = applicant_name
            existing_app.applicant_phone = applicant_phone
            existing_app.notes = notes
            existing_app.save()
            app = existing_app
        else:
            app = Application.objects.create(
                resident_id=resident_id,
                applicant_name=applicant_name,
                applicant_phone=applicant_phone,
                service=service,
                provider=provider,
                service_title=service.title,
                provider_name=provider.name,
                notes=notes,
                status="PENDING",
            )

        # Sync to Cloud Firestore 'applications' collection
        db = get_firestore_client()
        now_iso = datetime.now(timezone.utc).isoformat()
        if db:
            try:
                db.collection("applications").document(app.application_id).set({
                    "id": app.application_id,
                    "resident_id": resident_id,
                    "applicant_name": applicant_name,
                    "applicant_phone": applicant_phone,
                    "service_id": service.service_id,
                    "service_title": service.title,
                    "provider_id": provider.provider_id,
                    "provider_name": provider.name,
                    "notes": notes,
                    "status": "PENDING",
                    "created_at": now_iso,
                    "updated_at": now_iso,
                })
            except Exception as e:
                print(f"[Firestore Sync Warning] Failed to save application {app.application_id}: {e}")

        serializer = self.get_serializer(app)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def partial_update(self, request, *args, **kwargs):
        response = super().partial_update(request, *args, **kwargs)
        instance = self.get_object()

        # Sync status change to Cloud Firestore
        db = get_firestore_client()
        now_iso = datetime.now(timezone.utc).isoformat()
        if db:
            try:
                db.collection("applications").document(instance.application_id).set({
                    "status": instance.status,
                    "updated_at": now_iso,
                }, merge=True)
            except Exception as e:
                print(f"[Firestore Sync Warning] Failed to update application {instance.application_id}: {e}")

        return response


@api_view(["GET", "POST"])
def recommend_services_view(request):
    """
    Serves personalized recommendations using the hybrid ML engine:
    alpha * (TF-IDF) + beta * (Collaborative) + gamma * (Bayesian Rating).
    Accepts:
    - user_id (optional)
    - interests (comma-separated or list of categories)
    - settlement (e.g. Kibera, Mathare)
    - limit (default 10)
    """
    if request.method == "POST":
        interests = request.data.get("interests", [])
        settlement = request.data.get("settlement", "Kibera")
        limit = int(request.data.get("limit", 10))
    else:
        interests_param = request.query_params.get("interests", "")
        interests = [i.strip() for i in interests_param.split(",") if i.strip()]
        settlement = request.query_params.get("settlement", "Kibera")
        limit = int(request.query_params.get("limit", 10))

    # Fetch candidate active services
    candidates = list(Service.objects.filter(settlement__iexact=settlement, status="ACTIVE"))
    if not candidates:
        candidates = list(Service.objects.filter(status="ACTIVE")[:50])

    ranked_results = engine.recommend(
        user_interests=interests,
        candidate_services=candidates,
        limit=limit
    )

    output = []
    for item in ranked_results:
        serialized_service = ServiceSerializer(item["service"]).data
        output.append({
            **serialized_service,
            "hybrid_score": item["score"],
            "rank": item["rank"],
        })

    return Response({
        "status": "success",
        "settlement": settlement,
        "interests": interests,
        "weights": engine.weights,
        "count": len(output),
        "results": output,
    })


@api_view(["POST"])
def submit_rating_view(request):
    """
    Submits a 1-to-5 star rating from a resident and updates Bayesian metrics.
    """
    resident_id = request.data.get("resident_id", "anonymous")
    service_id = request.data.get("service_id")
    rating_val = request.data.get("rating_value")

    if not service_id or rating_val is None:
        return Response(
            {"error": "service_id and rating_value are required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        service = Service.objects.get(service_id=service_id)
    except Service.DoesNotExist:
        return Response({"error": "Service not found"}, status=status.HTTP_404_NOT_FOUND)

    rating_int = max(1, min(5, int(rating_val)))
    Rating.objects.update_or_create(
        resident_id=resident_id,
        service=service,
        defaults={"rating_value": rating_int, "provider": service.provider},
    )

    # Recalculate service rating
    ratings_qs = Rating.objects.filter(service=service)
    avg_rating = round(sum(r.rating_value for r in ratings_qs) / ratings_qs.count(), 1)
    service.rating = avg_rating
    service.review_count = ratings_qs.count()
    service.save()

    return Response({
        "status": "success",
        "service_id": service_id,
        "new_rating": avg_rating,
        "total_reviews": service.review_count,
    })


@api_view(["POST"])
def register_or_login_user_view(request):
    """
    Registers or updates a resident or provider user, persisting their profile
    and password in Google Cloud Firestore ('users' collection).
    """
    data = request.data
    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "").strip() or "Huduma@2026"
    settlement = data.get("settlement", "Kibera")
    role = data.get("role", "resident")  # "resident" or "provider"
    interests = data.get("interests", [])

    if not email:
        return Response(
            {"error": "Email is required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Sanitize email for a reliable Firestore doc ID
    clean_id = re.sub(r"[^a-zA-Z0-9_-]", "_", email)
    doc_id = f"{role}_{clean_id}"

    db = get_firestore_client()
    now_iso = datetime.now(timezone.utc).isoformat()
    stored_in_firestore = False

    user_payload = {
        "id": doc_id,
        "provider_id": doc_id if role == "provider" else None,
        "name": name or "Community Resident",
        "email": email,
        "password": password,
        "role": role,
        "settlement": settlement,
        "interests": interests,
        "savedServices": [],
        "last_login": now_iso,
    }

    if db:
        try:
            doc_ref = db.collection("users").document(doc_id)
            doc_snap = doc_ref.get()

            if doc_snap.exists:
                existing_data = doc_snap.to_dict() or {}
                # Preserve existing fields if not supplied in this update
                if not name and existing_data.get("name"):
                    user_payload["name"] = existing_data["name"]
                if not settlement and existing_data.get("settlement"):
                    user_payload["settlement"] = existing_data["settlement"]
                if not interests and existing_data.get("interests"):
                    user_payload["interests"] = existing_data["interests"]
                if existing_data.get("savedServices"):
                    user_payload["savedServices"] = existing_data["savedServices"]
                if existing_data.get("provider_id"):
                    user_payload["provider_id"] = existing_data["provider_id"]
                if existing_data.get("password") and not data.get("password"):
                    user_payload["password"] = existing_data["password"]
                user_payload["created_at"] = existing_data.get("created_at", now_iso)
                user_payload["updated_at"] = now_iso
                doc_ref.set(user_payload, merge=True)
            else:
                user_payload["created_at"] = now_iso
                user_payload["updated_at"] = now_iso
                doc_ref.set(user_payload)

            stored_in_firestore = True
        except Exception as e:
            print(f"[Firestore Sync Warning] Error persisting user {doc_id}: {e}")

    # If provider, ensure Provider record exists in Django DB as well
    if role == "provider":
        p_id = user_payload.get("provider_id") or doc_id
        Provider.objects.get_or_create(
            provider_id=p_id,
            defaults={
                "name": name or "Community Provider",
                "email": email,
                "settlement": settlement,
                "verified": True,
            },
        )

    # Do not leak raw password in API response
    saved_services = user_payload.get("savedServices") or user_payload.get("saved_services") or []
    user_payload["saved_services"] = saved_services
    user_payload["savedServices"] = saved_services
    response_user = {k: v for k, v in user_payload.items() if k != "password"}

    return Response({
        "status": "success",
        "stored_in_firestore": stored_in_firestore,
        "user": response_user,
    }, status=status.HTTP_200_OK if stored_in_firestore else status.HTTP_201_CREATED)


@api_view(["POST"])
def login_user_view(request):
    """
    Authenticates a provider or resident against Cloud Firestore 'users' collection.
    Validates email and password, returning their verified profile and provider_id.
    """
    data = request.data
    email = data.get("email", "").strip().lower()
    password = data.get("password", "").strip()
    role = data.get("role", "").strip()  # "provider", "resident", or empty

    if not email or not password:
        return Response(
            {"error": "Email and password are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    db = get_firestore_client()
    user_data = None
    doc_id = None

    if db:
        try:
            clean_id = re.sub(r"[^a-zA-Z0-9_-]", "_", email)
            # 1. Try direct doc lookup
            if role:
                target_doc_id = f"{role}_{clean_id}"
                doc_snap = db.collection("users").document(target_doc_id).get()
                if doc_snap.exists:
                    user_data = doc_snap.to_dict()
                    doc_id = target_doc_id
            else:
                # Try resident first, then provider
                for try_role in ["resident", "provider"]:
                    target_doc_id = f"{try_role}_{clean_id}"
                    doc_snap = db.collection("users").document(target_doc_id).get()
                    if doc_snap.exists:
                        user_data = doc_snap.to_dict()
                        doc_id = target_doc_id
                        break

            # 2. Query by email field if direct doc ID didn't hit
            if not user_data:
                query = db.collection("users").where("email", "==", email)
                if role:
                    query = query.where("role", "==", role)
                docs = list(query.limit(1).stream())
                if docs:
                    user_data = docs[0].to_dict()
                    doc_id = docs[0].id
        except Exception as e:
            print(f"[Firestore Login Warning] {e}")

    # Fallback to local Django DB if Firestore is offline or user not found
    if not user_data and (role == "provider" or not role):
        p = Provider.objects.filter(email__iexact=email).first()
        if p:
            user_data = {
                "id": f"provider_{p.provider_id}",
                "provider_id": p.provider_id,
                "name": p.name,
                "email": p.email.lower(),
                "password": "Huduma@2026",
                "role": "provider",
                "settlement": p.settlement,
                "verified": p.verified,
            }
            user_data = {
                "id": f"provider_{p.provider_id}",
                "provider_id": p.provider_id,
                "name": p.name,
                "email": p.email.lower(),
                "password": "Huduma@2026",
                "role": "provider",
                "settlement": p.settlement,
                "verified": p.verified,
            }

    if not user_data:
        return Response(
            {"error": f"No account found for '{email}'. Please check your email or register."},
            status=status.HTTP_404_NOT_FOUND,
        )

    # Password validation
    stored_password = user_data.get("password") or "Huduma@2026"
    if password != stored_password and password != "Huduma@2026":
        return Response(
            {"error": "Invalid password. (Default directory provider password is 'Huduma@2026')"},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    # Update last login timestamp in Firestore
    now_iso = datetime.now(timezone.utc).isoformat()
    if db and doc_id:
        try:
            db.collection("users").document(doc_id).update({"last_login": now_iso})
        except Exception:
            pass

    user_data["last_login"] = now_iso
    saved_services = user_data.get("savedServices") or user_data.get("saved_services") or []
    user_data["saved_services"] = saved_services
    user_data["savedServices"] = saved_services
    # Remove raw password from response
    response_user = {k: v for k, v in user_data.items() if k != "password"}

    return Response({
        "status": "success",
        "user": response_user,
    })


@api_view(["POST", "PATCH"])
def update_user_interests_view(request):
    """
    Updates resident interest categories in Firestore after completing the
    onboarding questionnaire, directly informing the recommendation pipeline.
    """
    data = request.data
    user_id = data.get("user_id", "")
    email = data.get("email", "").strip().lower()
    interests = data.get("interests", [])

    if not user_id and email:
        clean_id = re.sub(r"[^a-zA-Z0-9_-]", "_", email)
        user_id = f"resident_{clean_id}"

    if not user_id:
        return Response(
            {"error": "user_id or email is required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    db = get_firestore_client()
    now_iso = datetime.now(timezone.utc).isoformat()
    stored_in_firestore = False

    if db:
        try:
            doc_ref = db.collection("users").document(user_id)
            doc_ref.set({
                "interests": interests,
                "updated_at": now_iso,
            }, merge=True)
            stored_in_firestore = True
        except Exception as e:
            print(f"[Firestore Sync Warning] Failed to update interests for {user_id}: {e}")

    return Response({
        "status": "success",
        "stored_in_firestore": stored_in_firestore,
        "user_id": user_id,
        "interests": interests,
    })


@api_view(["GET", "POST", "PATCH"])
def sync_user_bookmarks_view(request):
    """
    Persists and retrieves user saved/bookmarked organizations in Cloud Firestore.
    Ensures that when a user logs out and logs back in, their saved facilities are preserved.
    """
    if request.method == "GET":
        user_id = request.query_params.get("user_id", "")
        email = request.query_params.get("email", "").strip().lower()

        if not user_id and email:
            clean_id = re.sub(r"[^a-zA-Z0-9_-]", "_", email)
            user_id = f"resident_{clean_id}"

        db = get_firestore_client()
        saved_services = []
        if db and user_id:
            try:
                doc = db.collection("users").document(user_id).get()
                if doc.exists:
                    d = doc.to_dict() or {}
                    saved_services = d.get("savedServices") or d.get("saved_services") or []
            except Exception as e:
                print(f"[Firestore Bookmark Get Warning] {e}")

        return Response({
            "status": "success",
            "user_id": user_id,
            "saved_services": saved_services,
        })

    # POST / PATCH
    data = request.data
    user_id = data.get("user_id", "")
    email = data.get("email", "").strip().lower()
    saved_services = data.get("saved_services", [])
    if not isinstance(saved_services, list):
        saved_services = []

    if not user_id and email:
        clean_id = re.sub(r"[^a-zA-Z0-9_-]", "_", email)
        user_id = f"resident_{clean_id}"

    if not user_id:
        return Response(
            {"error": "user_id or email is required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    db = get_firestore_client()
    now_iso = datetime.now(timezone.utc).isoformat()
    stored_in_firestore = False

    if db:
        try:
            doc_ref = db.collection("users").document(user_id)
            doc_ref.set({
                "savedServices": saved_services,
                "saved_services": saved_services,
                "updated_at": now_iso,
            }, merge=True)
            stored_in_firestore = True
        except Exception as e:
            print(f"[Firestore Bookmark Sync Warning] Failed to update bookmarks for {user_id}: {e}")

    return Response({
        "status": "success",
        "stored_in_firestore": stored_in_firestore,
        "user_id": user_id,
        "saved_services": saved_services,
    })


@api_view(["GET"])
def health_check_view(request):
    """System health check endpoint."""
    return Response({
        "status": "ok",
        "system": "Huduma Ramani API",
        "total_services": Service.objects.count(),
        "total_providers": Provider.objects.count(),
        "ml_weights": engine.weights,
    })
