from rest_framework import serializers
from .models import Service, Provider, Rating, InteractionEvent


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
