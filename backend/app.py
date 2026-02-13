# app.py

from flask import Flask, request, jsonify
from flask_cors import CORS
from utils.matcher import match_resumes
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)

# Enable CORS for all routes
CORS(app)


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({"status": "healthy"}), 200


@app.route('/match', methods=['POST'])
def match():
    """
    Match resumes against a job description.
    
    Expected JSON payload:
    {
        "resumes": [
            {"name": "resume1", "content": "resume text..."},
            {"name": "resume2", "content": "resume text..."}
        ],
        "job_description": "job description text..."
    }
    
    Returns:
        JSON response with ranked results:
        {
            "results": [
                {"name": "resume1", "score": 0.95},
                {"name": "resume2", "score": 0.87}
            ]
        }
    """
    try:
        # Validate request content type
        if not request.is_json:
            return jsonify({"error": "Content-Type must be application/json"}), 400
        
        # Get JSON data
        data = request.get_json()
        
        # Validate required fields
        if not data:
            return jsonify({"error": "Request body is required"}), 400
        
        if 'resumes' not in data:
            return jsonify({"error": "Missing required field: 'resumes'"}), 400
        
        if 'job_description' not in data:
            return jsonify({"error": "Missing required field: 'job_description'"}), 400
        
        resumes = data.get('resumes', [])
        job_description = data.get('job_description', '')
        
        # Validate resumes structure
        if not isinstance(resumes, list):
            return jsonify({"error": "'resumes' must be a list"}), 400
        
        if len(resumes) == 0:
            return jsonify({"error": "'resumes' list cannot be empty"}), 400
        
        if not isinstance(job_description, str) or not job_description.strip():
            return jsonify({"error": "'job_description' must be a non-empty string"}), 400
        
        # Extract resume texts and names
        resume_texts = []
        resume_names = []
        
        for idx, resume in enumerate(resumes):
            if not isinstance(resume, dict):
                return jsonify({"error": f"Resume at index {idx} must be an object"}), 400
            
            if 'name' not in resume:
                return jsonify({"error": f"Resume at index {idx} is missing 'name' field"}), 400
            
            if 'content' not in resume:
                return jsonify({"error": f"Resume at index {idx} is missing 'content' field"}), 400
            
            resume_names.append(str(resume['name']))
            resume_texts.append(str(resume['content']))
        
        # Perform matching
        logger.info(f"Matching {len(resumes)} resumes against job description")
        results = match_resumes(resume_texts, resume_names, job_description)
        
        # Return results
        return jsonify({
            "results": results,
            "total_matched": len(results)
        }), 200
        
    except ValueError as e:
        logger.error(f"Validation error: {str(e)}")
        return jsonify({"error": str(e)}), 400
    
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}", exc_info=True)
        return jsonify({"error": "An internal server error occurred"}), 500


if __name__ == '__main__':
    # Run the Flask app
    app.run(debug=True, host='0.0.0.0', port=5000)
