from django.db import models


class Provider(models.Model):
    provider_id = models.CharField(max_length=64, unique=True, primary_key=True)
    name = models.CharField(max_length=255)
    email = models.EmailField(blank=True, null=True)
    settlement = models.CharField(max_length=64, default="Kibera")
    verified = models.BooleanField(default=True)
    bayesian_score = models.FloatField(default=4.0)

    def __str__(self):
        return f"{self.name} ({self.provider_id})"


class Service(models.Model):
    CATEGORY_CHOICES = [
        ("Healthcare", "Healthcare"),
        ("Legal Aid", "Legal Aid"),
        ("Education", "Education"),
        ("Mentorship", "Mentorship"),
        ("Vocational", "Vocational Training"),
        ("Scholarships", "Scholarships"),
        ("Digital Literacy", "Digital Literacy"),
        ("Mental Health", "Mental Health"),
    ]

    STATUS_CHOICES = [
        ("ACTIVE", "Active"),
        ("PENDING", "Pending"),
        ("INACTIVE", "Inactive"),
    ]

    service_id = models.CharField(max_length=64, unique=True, primary_key=True)
    provider = models.ForeignKey(
        Provider, on_delete=models.CASCADE, related_name="services", null=True, blank=True
    )
    title = models.CharField(max_length=255)
    category = models.CharField(max_length=64, choices=CATEGORY_CHOICES, default="Healthcare")
    settlement = models.CharField(max_length=64, default="Kibera")
    location = models.CharField(max_length=255, blank=True, null=True)
    description = models.TextField()
    latitude = models.FloatField(blank=True, null=True)
    longitude = models.FloatField(blank=True, null=True)
    target_audience = models.CharField(max_length=255, blank=True, null=True)
    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default="ACTIVE")
    rating = models.FloatField(blank=True, null=True)
    review_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} [{self.category}]"


class Rating(models.Model):
    resident_id = models.CharField(max_length=64)
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name="ratings")
    provider = models.ForeignKey(
        Provider, on_delete=models.CASCADE, related_name="ratings", null=True, blank=True
    )
    rating_value = models.IntegerField()  # 1 to 5
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("resident_id", "service")

    def __str__(self):
        return f"User {self.resident_id} -> {self.service.title}: {self.rating_value}★"


class InteractionEvent(models.Model):
    EVENT_TYPES = [
        ("search", 1),
        ("view", 2),
        ("bookmark", 3),
    ]

    user_id = models.CharField(max_length=64)
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name="interactions")
    event_type = models.CharField(max_length=16, default="view")
    weight = models.IntegerField(default=2)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user_id} - {self.event_type} - {self.service.service_id}"
