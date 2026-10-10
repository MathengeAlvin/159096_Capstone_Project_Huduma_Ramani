import json
import os
from pathlib import Path
import joblib
import numpy as np
from django.conf import settings
from sklearn.metrics.pairwise import cosine_similarity


class RecommendationEngine:
    def __init__(self):
        self.model_dir = Path(settings.MODEL_DIR)
        self.tfidf_path = self.model_dir / "tfidf_vectorizer.joblib"
        self.weights_path = self.model_dir / "hybrid_weights.json"

        self.tfidf = None
        self.weights = {"alpha": 0.2, "beta": 0.4, "gamma": 0.4, "k": 2, "m_prior": 5}
        self.load_artifacts()

    def load_artifacts(self):
        """Loads fitted TF-IDF vectorizer and tuned hybrid hyperparameters."""
        try:
            if self.tfidf_path.exists():
                self.tfidf = joblib.load(self.tfidf_path)
            if self.weights_path.exists():
                with open(self.weights_path, "r", encoding="utf-8") as f:
                    self.weights = json.load(f)
        except Exception as e:
            print(f"[RecommendationEngine] Warning: Could not load ML artifacts: {e}")

    def recommend(self, user_interests, candidate_services, limit=10):
        """
        Ranks candidate services using the hybrid recommendation scoring formula:
        Final Score = alpha * (TF-IDF Content Similarity) + beta * (Collaborative Priors) + gamma * (Bayesian Rating Score)
        """
        if not candidate_services:
            return []

        alpha = self.weights.get("alpha", 0.2)
        beta = self.weights.get("beta", 0.4)
        gamma = self.weights.get("gamma", 0.4)
        m_prior = self.weights.get("m_prior", 5)

        # 1. Content-based TF-IDF Similarity
        query_text = " ".join(user_interests) if user_interests else "community health legal education mentorship"
        content_scores = np.zeros(len(candidate_services))

        if self.tfidf is not None:
            try:
                service_descriptions = [s.description or s.title for s in candidate_services]
                service_vectors = self.tfidf.transform(service_descriptions)
                user_vector = self.tfidf.transform([query_text])
                sims = cosine_similarity(user_vector, service_vectors).flatten()
                content_scores = (sims - sims.min()) / (sims.max() - sims.min() + 1e-9)
            except Exception as e:
                print(f"[RecommendationEngine] TF-IDF computation warning: {e}")

        # 2. Collaborative Prior / Category Affinity
        collab_scores = np.zeros(len(candidate_services))
        for idx, s in enumerate(candidate_services):
            # Category match bonus
            collab_scores[idx] = 1.0 if s.category in user_interests else 0.2

        # 3. Bayesian Quality Score
        # Formula: S = (v * R + m * C) / (v + m)
        global_mean_c = 4.2
        quality_scores = np.zeros(len(candidate_services))

        for idx, s in enumerate(candidate_services):
            v = s.review_count or 0
            r = s.rating if s.rating is not None else global_mean_c
            bayes = (v * r + m_prior * global_mean_c) / (v + m_prior)
            # Normalize 1-5 scale to 0-1
            quality_scores[idx] = max(0.0, min(1.0, (bayes - 1.0) / 4.0))

        # 4. Hybrid Combination
        hybrid_scores = (
            alpha * content_scores +
            beta * collab_scores +
            gamma * quality_scores
        )

        # Rank services
        ranked_indices = np.argsort(hybrid_scores)[::-1][:limit]
        results = []
        for rank, idx in enumerate(ranked_indices):
            results.append({
                "service": candidate_services[idx],
                "score": round(float(hybrid_scores[idx]), 3),
                "rank": rank + 1,
            })

        return results


engine = RecommendationEngine()
