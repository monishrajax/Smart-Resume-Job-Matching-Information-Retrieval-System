# matcher.py

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from utils.preprocess import preprocess_text


def match_resumes(resume_texts, resume_names, job_text):
    """
    Match resumes against a job description using TF-IDF and cosine similarity.
    
    Args:
        resume_texts: List of resume text strings
        resume_names: List of resume names corresponding to resume_texts
        job_text: Job description text string
        
    Returns:
        Sorted list of dictionaries with "name" and "score" keys,
        sorted by similarity score in descending order (highest first)
    """
    # Validate inputs
    if not resume_texts or not resume_names:
        return []
    
    if len(resume_texts) != len(resume_names):
        raise ValueError("resume_texts and resume_names must have the same length")
    
    # Preprocess all texts
    preprocessed_resumes = [preprocess_text(text) for text in resume_texts]
    preprocessed_job = preprocess_text(job_text)
    
    # Combine job description with resumes for vectorization
    all_texts = [preprocessed_job] + preprocessed_resumes
    
    # Create TF-IDF vectorizer
    vectorizer = TfidfVectorizer()
    
    # Fit and transform all texts
    tfidf_matrix = vectorizer.fit_transform(all_texts)
    
    # Extract job description vector (first row) and resume vectors (remaining rows)
    job_vector = tfidf_matrix[0:1]
    resume_vectors = tfidf_matrix[1:]
    
    # Calculate cosine similarity between job and each resume
    similarity_scores = cosine_similarity(job_vector, resume_vectors)[0]
    
    # Create list of dictionaries with name and score
    results = [
        {
            "name": resume_names[i],
            "score": float(similarity_scores[i])
        }
        for i in range(len(resume_names))
    ]
    
    # Sort by score in descending order (highest similarity first)
    results.sort(key=lambda x: x["score"], reverse=True)
    
    return results
