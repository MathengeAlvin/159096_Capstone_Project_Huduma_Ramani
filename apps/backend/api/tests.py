from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from .models import Service, Provider, Rating


class HudumaApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Create sample providers
        self.provider1 = Provider.objects.create(
            provider_id="org_test_1",
            name="Kibera Community Clinic",
            settlement="Kibera",
            verified=True,
            bayesian_score=4.5,
        )
        self.provider2 = Provider.objects.create(
            provider_id="org_test_2",
            name="Mathare Legal Aid Center",
            settlement="Mathare",
            verified=True,
            bayesian_score=4.2,
        )

        # Create sample services
        self.service1 = Service.objects.create(
            service_id="svc_test_01",
            provider=self.provider1,
            title="Kibera Youth Maternal & Healthcare Clinic",
            category="Healthcare",
            settlement="Kibera",
            location="Olympic Stage",
            description="Comprehensive free maternal care, immunizations, and community healthcare support.",
            latitude=-1.3142,
            longitude=36.7865,
            target_audience="Mothers and infants",
            status="ACTIVE",
            rating=4.8,
            review_count=15,
        )
        self.service2 = Service.objects.create(
            service_id="svc_test_02",
            provider=self.provider2,
            title="Mathare Free Legal & Mediation Desk",
            category="Legal Aid",
            settlement="Mathare",
            location="Mlango Kubwa",
            description="Pro bono legal consultation, dispute mediation, and human rights advocacy.",
            latitude=-1.2612,
            longitude=36.8521,
            target_audience="Youth and low-income families",
            status="ACTIVE",
            rating=4.4,
            review_count=8,
        )

    def test_health_check_endpoint(self):
        response = self.client.get("/api/health/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "ok")
        self.assertIn("ml_weights", response.data)
        self.assertGreaterEqual(response.data["total_services"], 2)

    def test_list_services(self):
        response = self.client.get("/api/services/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 2)

    def test_filter_services_by_settlement(self):
        response = self.client.get("/api/services/?settlement=Mathare")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["service_id"], "svc_test_02")

    def test_filter_services_by_category(self):
        response = self.client.get("/api/services/?category=Healthcare")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["category"], "Healthcare")

    def test_recommendations_endpoint(self):
        response = self.client.get("/api/recommendations/?settlement=Kibera&interests=Healthcare")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "success")
        self.assertTrue(len(response.data["results"]) > 0)
        self.assertIn("hybrid_score", response.data["results"][0])
        self.assertIn("rank", response.data["results"][0])

    def test_submit_rating_endpoint(self):
        payload = {
            "resident_id": "resident_abc_123",
            "service_id": "svc_test_01",
            "rating_value": 5,
        }
        response = self.client.post("/api/ratings/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "success")
        self.assertEqual(response.data["new_rating"], 5.0)

        # Verify updated in database
        self.service1.refresh_from_db()
        self.assertEqual(self.service1.rating, 5.0)
        self.assertEqual(Rating.objects.count(), 1)
