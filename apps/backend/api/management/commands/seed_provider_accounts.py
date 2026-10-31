import csv
import re
from datetime import datetime, timezone
from pathlib import Path
from django.core.management.base import BaseCommand
from django.conf import settings
from api.models import Provider, Service
from api.firebase_client import get_firestore_client


class Command(BaseCommand):
    help = "Creates Firestore user accounts with passwords for all 242 providers in the system"

    def add_arguments(self, parser):
        parser.add_argument(
            "--password",
            type=str,
            default="Huduma@2026",
            help="Default password to assign to all provider accounts (default: Huduma@2026)",
        )

    def handle(self, *args, **options):
        default_password = options["password"]
        db = get_firestore_client()

        self.stdout.write(self.style.MIGRATE_HEADING("=== Seeding Provider Accounts to Cloud Firestore ==="))
        self.stdout.write(f"Default Password for all providers: {default_password}\n")

        providers = list(Provider.objects.all().order_by("provider_id"))
        total_providers = len(providers)
        self.stdout.write(f"Found {total_providers} providers in the Django database.\n")

        if not db:
            self.stdout.write(
                self.style.WARNING(
                    "[Notice] Firestore client offline or serviceAccountKey.json missing.\n"
                    "Generating credentials CSV only."
                )
            )

        now_iso = datetime.now(timezone.utc).isoformat()
        credentials_list = []
        batch_count = 0
        written_count = 0

        batch = db.batch() if db else None

        for p in providers:
            email = (p.email or f"{p.provider_id}@huduma.org").strip().lower()
            clean_id = re.sub(r"[^a-zA-Z0-9_-]", "_", email)
            doc_id = f"provider_{clean_id}"
            service_count = p.services.count()

            user_doc = {
                "id": doc_id,
                "provider_id": p.provider_id,
                "name": p.name,
                "email": email,
                "password": default_password,
                "role": "provider",
                "settlement": p.settlement,
                "verified": p.verified,
                "bayesian_score": p.bayesian_score,
                "services_count": service_count,
                "created_at": now_iso,
                "last_login": None,
            }

            credentials_list.append({
                "provider_id": p.provider_id,
                "organization_name": p.name,
                "email": email,
                "password": default_password,
                "settlement": p.settlement,
                "services_count": service_count,
            })

            if db and batch is not None:
                doc_ref = db.collection("users").document(doc_id)
                batch.set(doc_ref, user_doc, merge=True)
                batch_count += 1
                written_count += 1

                # Firestore batch limit is 500 writes
                if batch_count >= 400:
                    batch.commit()
                    self.stdout.write(f"  -> Committed batch of {batch_count} accounts to Firestore...")
                    batch = db.batch()
                    batch_count = 0

        if db and batch is not None and batch_count > 0:
            batch.commit()
            self.stdout.write(f"  -> Committed final batch of {batch_count} accounts to Firestore.")

        if db:
            self.stdout.write(
                self.style.SUCCESS(
                    f"\n[Success] Successfully saved {written_count} provider accounts with passwords into Cloud Firestore 'users' collection!"
                )
            )

        # Export credentials to CSV for quick reference
        csv_path = Path(settings.BASE_DIR) / "provider_credentials.csv"
        with open(csv_path, mode="w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(
                f,
                fieldnames=[
                    "provider_id",
                    "organization_name",
                    "email",
                    "password",
                    "settlement",
                    "services_count",
                ],
            )
            writer.writeheader()
            writer.writerows(credentials_list)

        self.stdout.write(
            self.style.SUCCESS(
                f"[Export] Credentials reference cheat-sheet written to: {csv_path}\n"
            )
        )

