import csv
from pathlib import Path
from django.core.management.base import BaseCommand
from django.conf import settings
from api.models import Provider, Service, Rating


class Command(BaseCommand):
    help = "Seeds synthetic ratings from Model/ratings.csv and links them to services and providers"

    def handle(self, *args, **kwargs):
        ratings_path = Path(settings.MODEL_DIR) / "ratings.csv"
        services_path = Path(settings.MODEL_DIR) / "services.csv"

        if not ratings_path.exists():
            self.stderr.write(self.style.ERROR(f"Ratings file not found: {ratings_path}"))
            return

        self.stdout.write(f"Reading synthetic ratings from {ratings_path}...")

        # Build mapping from provider_id to service_id
        prv_to_svc_id = {}
        if services_path.exists():
            with open(services_path, mode="r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    prv_id = row.get("provider_id")
                    svc_id = row.get("service_id")
                    if prv_id and svc_id:
                        prv_to_svc_id[prv_id] = svc_id

        created_count = 0
        with open(ratings_path, mode="r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                user_id = row.get("user_id")
                prv_id = row.get("provider_id")
                rating_val = int(row.get("rating_value", 4))

                # Find service
                svc = None
                svc_id = prv_to_svc_id.get(prv_id)
                if svc_id:
                    svc = Service.objects.filter(service_id=svc_id).first()

                if not svc:
                    p = Provider.objects.filter(provider_id=prv_id).first()
                    if p:
                        svc = p.services.first()

                if not svc:
                    continue

                prv = svc.provider or Provider.objects.filter(provider_id=prv_id).first()
                res_id = f"synthetic_{user_id}"

                _, created = Rating.objects.get_or_create(
                    resident_id=res_id,
                    service=svc,
                    defaults={
                        "provider": prv,
                        "rating_value": rating_val,
                    },
                )
                if created:
                    created_count += 1

        self.stdout.write(f"Successfully seeded {created_count} synthetic ratings into DB!")

        # Recalculate average rating & review count for each service
        self.stdout.write("Recalculating service ratings and review counts...")
        for s in Service.objects.all():
            qs = Rating.objects.filter(service=s)
            if qs.exists():
                s.rating = round(sum(r.rating_value for r in qs) / qs.count(), 1)
                s.review_count = qs.count()
                s.save()

        # Recalculate provider Bayesian score
        self.stdout.write("Recalculating provider Bayesian quality scores...")
        global_mean_c = 4.2
        m_prior = 5.0
        for p in Provider.objects.all():
            p_qs = Rating.objects.filter(provider=p)
            if p_qs.exists():
                v = p_qs.count()
                r = sum(rt.rating_value for rt in p_qs) / v
                bayes = (v * r + m_prior * global_mean_c) / (v + m_prior)
                p.bayesian_score = round(bayes, 2)
                p.save()

        self.stdout.write(
            self.style.SUCCESS(
                f"Synthetic ratings integration complete! Total Ratings in DB: {Rating.objects.count()}"
            )
        )

