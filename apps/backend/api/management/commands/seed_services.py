import csv
from pathlib import Path
from django.core.management.base import BaseCommand
from django.conf import settings
from api.models import Service, Provider


class Command(BaseCommand):
    help = "Seeds the database with real community services from Model/services.csv"

    def handle(self, *args, **kwargs):
        csv_path = Path(settings.MODEL_DIR) / "services.csv"

        if not csv_path.exists():
            self.stderr.write(self.style.ERROR(f"File not found: {csv_path}"))
            return

        self.stdout.write(f"Reading real services from {csv_path}...")
        created_providers = 0
        created_services = 0

        # Create demo provider for the portal
        demo_provider, _ = Provider.objects.get_or_create(
            provider_id="org-kibera-aid",
            defaults={
                "name": "Kibera Aid Org",
                "email": "organization@example.com",
                "settlement": "Kibera",
                "verified": True,
                "bayesian_score": 4.8,
            },
        )

        with open(csv_path, mode="r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for idx, row in enumerate(reader):
                prv_id = row.get("provider_id") or f"prv_{idx+1}"
                prv_name = row.get("provider_name") or row.get("title")
                lat = float(row["latitude"]) if row.get("latitude") else None
                lon = float(row["longitude"]) if row.get("longitude") else None

                # Determine settlement from coordinates / text
                settlement = "Mathare" if (lat and lat > -1.28) else "Kibera"

                # Link top 5 services to demo provider so the web portal dashboard has listings immediately
                assigned_provider = demo_provider if idx < 6 else None

                if not assigned_provider:
                    assigned_provider, p_created = Provider.objects.get_or_create(
                        provider_id=prv_id,
                        defaults={
                            "name": prv_name,
                            "email": f"{prv_id}@huduma.org",
                            "settlement": settlement,
                            "verified": True,
                            "bayesian_score": 4.2,
                        },
                    )
                    if p_created:
                        created_providers += 1

                service_id = row.get("service_id") or f"svc_{idx+1:04d}"
                service, s_created = Service.objects.update_or_create(
                    service_id=service_id,
                    defaults={
                        "provider": assigned_provider,
                        "title": row.get("title") or row.get("name") or "Community Service",
                        "category": row.get("category") or "Healthcare",
                        "settlement": settlement,
                        "location": f"{settlement} Sector",
                        "description": row.get("description") or "",
                        "latitude": lat,
                        "longitude": lon,
                        "target_audience": row.get("target_audience") or "Local residents",
                        "status": "ACTIVE",
                        "rating": round(4.0 + (idx % 10) * 0.1, 1),
                        "review_count": 5 + (idx % 25),
                    },
                )
                if s_created:
                    created_services += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Successfully seeded database! Total Services: {Service.objects.count()} (Added: {created_services}), Total Providers: {Provider.objects.count()} (Added: {created_providers})"
            )
        )
