from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ServiceViewSet,
    ProviderViewSet,
    recommend_services_view,
    submit_rating_view,
    health_check_view,
)

router = DefaultRouter()
router.register(r"services", ServiceViewSet, basename="service")
router.register(r"providers", ProviderViewSet, basename="provider")

urlpatterns = [
    path("", include(router.urls)),
    path("recommendations/", recommend_services_view, name="recommendations"),
    path("ratings/", submit_rating_view, name="ratings"),
    path("health/", health_check_view, name="health_check"),
]
