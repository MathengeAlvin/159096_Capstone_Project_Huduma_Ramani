from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ServiceViewSet,
    ProviderViewSet,
    ApplicationViewSet,
    recommend_services_view,
    submit_rating_view,
    health_check_view,
    register_or_login_user_view,
    login_user_view,
    update_user_interests_view,
    sync_user_bookmarks_view,
)

router = DefaultRouter()
router.register(r"services", ServiceViewSet, basename="service")
router.register(r"providers", ProviderViewSet, basename="provider")
router.register(r"applications", ApplicationViewSet, basename="application")

urlpatterns = [
    path("", include(router.urls)),
    path("auth/register/", register_or_login_user_view, name="auth_register"),
    path("auth/login/", login_user_view, name="auth_login"),
    path("auth/interests/", update_user_interests_view, name="auth_interests"),
    path("auth/bookmarks/", sync_user_bookmarks_view, name="auth_bookmarks"),
    path("recommendations/", recommend_services_view, name="recommendations"),
    path("ratings/", submit_rating_view, name="ratings"),
    path("health/", health_check_view, name="health_check"),
]
