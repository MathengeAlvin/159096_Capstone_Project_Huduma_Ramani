import os
from pathlib import Path
from django.conf import settings

FIREBASE_INITIALIZED = False
firestore_db = None


def get_firestore_client():
    """
    Initializes and returns the Firestore client using Firebase Admin SDK.
    Gracefully falls back to None in offline/local mock mode.
    """
    global FIREBASE_INITIALIZED, firestore_db

    if FIREBASE_INITIALIZED:
        return firestore_db

    try:
        import firebase_admin
        from firebase_admin import credentials, firestore

        cred_path = os.getenv(
            "FIREBASE_SERVICE_ACCOUNT_KEY",
            str(settings.BASE_DIR / "serviceAccountKey.json")
        )

        if Path(cred_path).exists():
            cred = credentials.Certificate(cred_path)
            if not firebase_admin._apps:
                firebase_admin.initialize_app(cred)
            firestore_db = firestore.client()
            FIREBASE_INITIALIZED = True
            print("[Firebase] Successfully connected to Cloud Firestore!")
        else:
            print("[Firebase] Notice: serviceAccountKey.json not detected. Running in local Django database mode.")
    except Exception as e:
        print(f"[Firebase] Initialization note: {e}")

    return firestore_db
