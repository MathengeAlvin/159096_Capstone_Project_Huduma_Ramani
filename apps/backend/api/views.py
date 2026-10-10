from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Q

from .models import Service, Provider, Rating, InteractionEvent
from .serializers import (
    ServiceSerializer,
    ProviderSerializer,
    RatingSerializer,
    InteractionEventSerializer,
)
from .ml_engine import engine


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
