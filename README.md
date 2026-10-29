# 📍 Huduma Ramani

> **An Intelligent, Geospatial Community Resource Discovery & Hybrid Recommendation Engine for Kenyan Informal Settlements**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Python 3.12](https://img.shields.io/badge/Python-3.12-3776AB.svg?logo=python&logoColor=white)](https://www.python.org/)
[![Django REST Framework](https://img.shields.io/badge/Django_REST-6.1%20%7C%203.18-092E20.svg?logo=django&logoColor=white)](https://www.django-rest-framework.org/)
[![Next.js 16](https://img.shields.io/badge/Next.js-16.3-black.svg?logo=next.js&logoColor=white)](https://nextjs.org/)
[![React Native Expo](https://img.shields.io/badge/React_Native-Expo_~57.0-blue.svg?logo=expo&logoColor=white)](https://expo.dev/)
[![Scikit-Learn](https://img.shields.io/badge/scikit--learn-1.9.0-F7931E.svg?logo=scikitlearn&logoColor=white)](https://scikit-learn.org/)

---

## 📌 Overview

**Huduma Ramani** is an open-source, multi-tier platform built to eliminate extreme information asymmetry and fragmented service delivery across Nairobi's informal settlements—specifically **Kibera** and **Mathare**. 

Due to the absence of formal street addressing and centralized digital directories, vital grassroots initiatives (such as healthcare clinics, legal aid desks, scholarships, and vocational mentorship) are typically hidden behind physical noticeboards and word-of-mouth networks. **Huduma Ramani** bridges this divide through an interactive, offline-resilient map and a **safety-constrained hybrid recommendation engine** that matches vulnerable residents with verified community welfare opportunities.

---

## 🚀 Key Features

* **🗺️ Open Cartography & Proximity Navigation:**
  * Interactive OpenStreetMap engine using Leaflet.js within a sandboxed `react-native-webview`.
  * Instant boundary switching between **Kibera** (`-1.3142, 36.7865`) and **Mathare** (`-1.2612, 36.8521`).
  * Custom pins with Glovo-inspired styling (#FFC244 border and gold-star indicators for top recommendations).
* **🧠 Constrained Hybrid Recommendation Engine:**
  * **Content-Based Filtering:** TF-IDF n-gram vectorization (`ngram_range=(1, 2)`) with Cosine Similarity over service descriptions.
  * **Collaborative Filtering:** Non-Negative Matrix Factorization (NMF, $k=2$) over user interaction matrices to detect co-utilization trends.
  * **Bayesian Quality Smoothing:** Prior-adjusted rating estimation preventing unvetted or artificially inflated listings from outranking verified providers.
  * **Safety Constraint:** Configured with weights $\alpha = 0.2$, $\beta = 0.4$, $\gamma = 0.4$ under the strict rule $\gamma \ge \alpha$ and $\gamma \ge \beta$ to prioritize resident safety.
* **📱 Cross-Platform Resident Mobile App:**
  * Built on React Native and Expo SDK 57 with high-contrast accessibility.
  * Dynamic LAN/Wi-Fi host IP extraction in `api.ts` for rapid local testing.
  * Offline fallback handling bundled with cached records (`MOCK_SERVICES`) during network blackouts.
* **💻 Web Provider Portal:**
  * Next.js 16 App Router interface styled with Tailwind CSS v4.
  * Live listing management (CRUD) for verified community-based organizations (CBOs) and NGOs (e.g., eMentoring Africa).
  * Built-in SVG demand analytics tracking impressions, click-through rates, and community ratings.

---

## 🏗️ System Architecture
