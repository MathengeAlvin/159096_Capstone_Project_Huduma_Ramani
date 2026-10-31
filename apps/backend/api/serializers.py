from rest_framework import serializers
from .models import Service, Provider, Rating, InteractionEvent, Application


class ProviderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Provider
        fields = "__all__"


class ServiceSerializer(serializers.ModelSerializer):
    provider_name = serializers.CharField(source="provider.name", read_only=True)

    class Meta:
        model = Service
        fields = [
            "service_id",
            "provider",
            "provider_name",
            "title",
            "category",
            "settlement",
            "location",
            "description",
            "latitude",
            "longitude",
            "target_audience",
            "status",
            "rating",
            "review_count",
            "created_at",
            "updated_at",
        ]
        extra_kwargs = {
            "service_id": {"required": False},
        }


class RatingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rating
        fields = "__all__"


class InteractionEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = InteractionEvent
        fields = "__all__"


class ApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = [
            "application_id",
            "resident_id",
            "applicant_name",
            "applicant_phone",
            "service",
            "provider",
            "service_title",
            "provider_name",
            "notes",
            "status",
            "created_at",
            "updated_at",
        ]
        extra_kwargs = {
            "application_id": {"required": False},
            "service_title": {"required": False},
            "provider_name": {"required": False},
            "provider": {"required": False},
        }
