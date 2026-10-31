from rest_framework import viewsets, status
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from django.db.models import Q
from datetime import datetime, timezone
import re

from .models import Service, Provider, Rating, InteractionEvent
from .serializers import (
    ServiceSerializer,
    ProviderSerializer,
    RatingSerializer,
    InteractionEventSerializer,
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
            qs = qs.filter(provider_id=provider_id)
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
    Registers or logs in a resident or provider user, persisting their profile
    in Google Cloud Firestore ('users' collection).
    """
    data = request.data
    name = data.get("name", "").strip() or "Community Resident"
    email = data.get("email", "").strip().lower()
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
        "name": name,
        "email": email,
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
                # Preserve existing interests if not explicitly provided
                if not interests and existing_data.get("interests"):
                    user_payload["interests"] = existing_data["interests"]
                if existing_data.get("savedServices"):
                    user_payload["savedServices"] = existing_data["savedServices"]
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
        Provider.objects.get_or_create(
            provider_id=doc_id,
            defaults={
                "name": name,
                "email": email,
                "settlement": settlement,
                "verified": True,
            },
        )

    return Response({
        "status": "success",
        "stored_in_firestore": stored_in_firestore,
        "user": user_payload,
    }, status=status.HTTP_200_OK if stored_in_firestore else status.HTTP_201_CREATED)


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
