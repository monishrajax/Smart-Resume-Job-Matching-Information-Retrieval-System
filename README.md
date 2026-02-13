# 🔎 Smart Resume–Job Matching Information Retrieval System

A full-stack Information Retrieval (IR) web application that ranks resumes based on job description relevance using TF-IDF and Cosine Similarity.

Built with:
- 🐍 Flask (Backend API)
- ⚛ React + TypeScript (Frontend)
- 🎨 Tailwind CSS (UI)
- 📊 Scikit-learn (TF-IDF & Cosine Similarity)

---

## 🚀 Features

- Upload multiple resumes (.txt)
- Enter job description
- TF-IDF vectorization
- Cosine similarity ranking
- Ranked retrieval results
- Similarity percentage score
- Modern Tailwind UI
- REST API architecture

---

## 🧠 Information Retrieval Concepts Used

- Text Preprocessing (Tokenization, Stopword Removal, Lemmatization)
- Vector Space Model
- TF-IDF Weighting
- Cosine Similarity
- Ranked Retrieval
- Precision & Recall (Optional Evaluation)

---

## 🏗 System Architecture

Frontend (React + TS)
        ↓
Flask REST API
        ↓
Text Preprocessing (NLTK)
        ↓
TF-IDF Vectorization
        ↓
Cosine Similarity
        ↓
Ranked Results (JSON Response)

---
