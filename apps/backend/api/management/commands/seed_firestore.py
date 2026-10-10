import os
from pathlib import Path
from django.core.management.base import BaseCommand
from django.conf import settings
from api.models import Service, Provider
from api.firebase_client import get_firestore_client


class Command(BaseCommand):
    help = "Seeds Firestore collections ('services', 'users', 'providers') using Firebase Admin SDK"

    def handle(self, *args, **kwargs):
        db = get_firestore_client()
        if not db:
            self.stderr.write(
                self.style.ERROR(
                    "\n[Firebase Error] Firestore client could not be initialized.\n"
                    "Please ensure you have placed your 'serviceAccountKey.json' in 'apps/backend/'\n"
                    "or set the FIREBASE_SERVICE_ACCOUNT_KEY environment variable.\n"
                )
            )
            return

        self.stdout.write(self.style.MIGRATE_HEADING("--- Starting Cloud Firestore Seeding ---"))

        # 1. Seed 'users' Collection (Residents & Providers)
        self.stdout.write("Seeding 'users' collection with resident & provider accounts...")
        demo_users = [
            {
                "id": "resident_kibera_demo",
                "name": "Jane Atieno",
                "email": "resident.demo@example.com",
                "role": "resident",
                "settlement": "Kibera",
                "interests": ["Healthcare", "Legal Aid", "Education"],
                "language": "en",
                "savedServices": ["svc_0001", "svc_0002"],
                "created_at": "2026-10-10T12:00:00Z",
            },
            {
                "id": "resident_mathare_demo",
                "name": "Kevin Mwangi",
                "email": "kevin.resident@example.com",
                "role": "resident",
                "settlement": "Mathare",
                "interests": ["Vocational", "Digital Literacy", "Mentorship"],
                "language": "sw",
                "savedServices": ["svc_0010"],
                "created_at": "2026-10-10T12:30:00Z",
            },
            {
                "id": "provider_kibera_aid_user",
                "name": "Kibera Aid Org Administrator",
                "email": "organization@example.com",
                "role": "provider",
                "provider_id": "org-kibera-aid",
                "settlement": "Kibera",
                "verified": True,
                "created_at": "2026-10-10T10:00:00Z",
            },
            {
                "id": "provider_mathare_legal_user",
                "name": "Mathare Community Justice Admin",
                "email": "justice@mathare.org",
                "role": "provider",
                "provider_id": "org-mathare-justice",
                "settlement": "Mathare",
                "verified": True,
                "created_at": "2026-10-10T10:15:00Z",
            },
        ]

        users_batch = db.batch()
        for u in demo_users:
            doc_ref = db.collection("users").document(u["id"])
            users_batch.set(doc_ref, u)
        users_batch.commit()
        self.stdout.write(self.style.SUCCESS(f"-> Seeded {len(demo_users)} demo accounts in 'users' collection."))

        # 2. Seed 'providers' Collection
        self.stdout.write("Seeding 'providers' collection...")
        providers = Provider.objects.all()
        # Firestore batch limit is 500 writes
        batch = db.batch()
        count = 0
        total_p = 0

        for p in providers:
            p_data = {
                "provider_id": p.provider_id,
                "name": p.name,
                "email": p.email or "",
                "settlement": p.settlement,
                "verified": p.verified,
                "bayesian_score": p.bayesian_score,
            }
            ref = db.collection("providers").document(p.provider_id)
            batch.set(ref, p_data)
            count += 1
            total_p += 1
            if count >= 400:
                batch.commit()
                batch = db.batch()
                count = 0
        if count > 0:
            batch.commit()
        self.stdout.write(self.style.SUCCESS(f"-> Seeded {total_p} providers in 'providers' collection."))

        # 3. Seed 'services' Collection
        self.stdout.write("Seeding 'services' collection...")
        services = Service.objects.all()
        batch = db.batch()
        count = 0
        total_s = 0

        for s in services:
            s_data = {
                "service_id": s.service_id,
                "provider_id": s.provider.provider_id if s.provider else "",
                "provider_name": s.provider.name if s.provider else "Community Initiative",
                "title": s.title,
                "category": s.category,
                "settlement": s.settlement,
                "location": s.location or "",
                "description": s.description or "",
                "latitude": s.latitude,
                "longitude": s.longitude,
                "target_audience": s.target_audience or "",
                "status": s.status,
                "rating": s.rating,
                "review_count": s.review_count,
            }
            ref = db.collection("services").document(s.service_id)
            batch.set(ref, s_data)
            count += 1
            total_s += 1
            if count >= 400:
                batch.commit()
                batch = db.batch()
                count = 0
        if count > 0:
            batch.commit()

        self.stdout.write(self.style.SUCCESS(f"-> Seeded {total_s} services in 'services' collection."))
        self.stdout.write(self.style.SUCCESS("Firestore database successfully initialized and populated!"))
