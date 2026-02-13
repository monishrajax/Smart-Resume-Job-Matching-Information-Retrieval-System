# preprocess.py

import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer
import string

# Download required NLTK data (if not already downloaded)
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt', quiet=True)

try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords', quiet=True)

try:
    nltk.data.find('corpora/wordnet')
except LookupError:
    nltk.download('wordnet', quiet=True)

# Initialize lemmatizer and stopwords
lemmatizer = WordNetLemmatizer()
stop_words = set(stopwords.words('english'))


def preprocess_text(text: str) -> str:
    """
    Preprocess text by performing:
    - Lowercasing
    - Tokenization
    - Stopword removal
    - Lemmatization
    
    Args:
        text: Input text string to preprocess
        
    Returns:
        Preprocessed text as a string
    """
    # Lowercase
    text = text.lower()
    
    # Tokenize
    tokens = word_tokenize(text)
    
    # Remove stopwords and punctuation, then lemmatize
    processed_tokens = []
    for token in tokens:
        # Skip punctuation and stopwords
        if token not in string.punctuation and token not in stop_words:
            # Lemmatize
            lemmatized = lemmatizer.lemmatize(token)
            processed_tokens.append(lemmatized)
    
    # Join tokens back into a string
    return ' '.join(processed_tokens)
