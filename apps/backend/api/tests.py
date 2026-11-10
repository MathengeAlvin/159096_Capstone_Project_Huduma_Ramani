from unittest.mock import patch
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from .models import Service, Provider, Rating, Application


@patch("api.views.get_firestore_client", return_value=None)
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

    def test_health_check_endpoint(self, mock_firestore):
        """TC-API-01: Verifies API health and machine learning configuration availability."""
        response = self.client.get("/api/health/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "ok")
        self.assertIn("ml_weights", response.data)
        self.assertGreaterEqual(response.data["total_services"], 2)

    def test_list_services(self, mock_firestore):
        """TC-API-02: Verifies service catalog pagination and retrieval."""
        response = self.client.get("/api/services/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 2)

    def test_filter_services_by_settlement(self, mock_firestore):
        """TC-API-03: Verifies geospatial filtering by settlement boundary (Mathare vs Kibera)."""
        response = self.client.get("/api/services/?settlement=Mathare")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["service_id"], "svc_test_02")

    def test_filter_services_by_category(self, mock_firestore):
        """TC-API-04: Verifies taxonomy filtering by community need category."""
        response = self.client.get("/api/services/?category=Healthcare")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["category"], "Healthcare")

    def test_recommendations_endpoint(self, mock_firestore):
        """TC-ML-01: Verifies hybrid recommendation scoring and ranking output."""
        response = self.client.get("/api/recommendations/?settlement=Kibera&interests=Healthcare")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "success")
        self.assertTrue(len(response.data["results"]) > 0)
        self.assertIn("hybrid_score", response.data["results"][0])
        self.assertIn("rank", response.data["results"][0])

    def test_submit_rating_unverified_rejected_403(self, mock_firestore):
        """TC-RAT-01 (Negative Test): Rating attempt without COMPLETED intake is rejected with HTTP 403."""
        payload = {
            "resident_id": "unverified_resident_001",
            "service_id": "svc_test_01",
            "rating_value": 5,
        }
        response = self.client.post("/api/ratings/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.data.get("code"), "ATTENDANCE_REQUIRED")

    def test_submit_rating_verified_attended_allowed_200(self, mock_firestore):
        """TC-RAT-02 (Positive Test): Resident with COMPLETED intake can rate, updating Bayesian metrics."""
        resident_id = "resident_wanjiku_001"
        # Seed an application marked COMPLETED by the provider
        Application.objects.create(
            resident_id=resident_id,
            applicant_name="Wanjiku Kamau",
            applicant_phone="+254712345678",
            service=self.service1,
            provider=self.provider1,
            status="COMPLETED",
        )

        payload = {
            "resident_id": resident_id,
            "service_id": "svc_test_01",
            "rating_value": 5,
        }
        response = self.client.post("/api/ratings/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "success")
        self.assertEqual(response.data["new_rating"], 5.0)

        # Verify database update
        self.service1.refresh_from_db()
        self.assertEqual(self.service1.rating, 5.0)
        self.assertEqual(Rating.objects.count(), 1)

    def test_provider_revert_attendance_revokes_rating(self, mock_firestore):
        """TC-INT-01: Provider reverting attendance to APPROVED revokes resident rating and restores score."""
        resident_id = "resident_wanjiku_001"
        app = Application.objects.create(
            resident_id=resident_id,
            applicant_name="Wanjiku Kamau",
            service=self.service1,
            provider=self.provider1,
            status="COMPLETED",
        )

        # Resident rates
        self.client.post("/api/ratings/", {
            "resident_id": resident_id,
            "service_id": "svc_test_01",
            "rating_value": 5,
        }, format="json")
        self.assertEqual(Rating.objects.filter(service=self.service1).count(), 1)

        # Provider reverts attendance from COMPLETED back to APPROVED
        patch_res = self.client.patch(f"/api/applications/{app.application_id}/", {
            "status": "APPROVED",
        }, format="json")
        self.assertEqual(patch_res.status_code, status.HTTP_200_OK)

        # Rating must be revoked and rating permissions revoked
        self.assertEqual(Rating.objects.filter(service=self.service1).count(), 0)

        # Subsequent rating attempt must now be rejected with HTTP 403
        re_rate_res = self.client.post("/api/ratings/", {
            "resident_id": resident_id,
            "service_id": "svc_test_01",
            "rating_value": 4,
        }, format="json")
        self.assertEqual(re_rate_res.status_code, status.HTTP_403_FORBIDDEN)
