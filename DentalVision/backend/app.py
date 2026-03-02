import os
import io
import base64
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
from dotenv import load_dotenv
from services.detector import DentalDetector
from services.explainer import DentalExplainer

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Initialize services
detector = DentalDetector()
explainer = DentalExplainer()

# Constants
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'version': '1.0.0',
        'services': {
            'detector': detector.is_ready(),
            'explainer': explainer.is_ready()
        }
    }), 200

@app.route('/api/analyze', methods=['POST'])
def analyze_xray():
    """Analyze dental X-ray and return detections"""
    try:
        # Validate file upload
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file type. Allowed: JPG, PNG'}), 400
        
        # Read and validate file size
        file_bytes = file.read()
        if len(file_bytes) > MAX_FILE_SIZE:
            return jsonify({'error': 'File too large. Max size: 10MB'}), 400
        
        # Open image
        image = Image.open(io.BytesIO(file_bytes))
        
        # Run detection
        detections = detector.detect(image)
        
        # Filter by confidence threshold
        filtered_detections = [
            d for d in detections if d['confidence'] >= 0.70
        ]
        
        return jsonify({
            'detections': filtered_detections,
            'source': detector.get_source(),
            'image_size': image.size
        }), 200
        
    except Exception as e:
        print(f"Error in analyze_xray: {str(e)}")
        return jsonify({'error': f'Analysis failed: {str(e)}'}), 500

@app.route('/api/explain', methods=['POST'])
def explain_findings():
    """Generate plain-language explanations for detections"""
    try:
        data = request.get_json()
        
        if not data or 'detections' not in data:
            return jsonify({'error': 'No detections provided'}), 400
        
        detections = data['detections']
        
        if not detections:
            return jsonify({'explanations': []}), 200
        
        # Generate explanations
        explanations = explainer.explain(detections)
        
        return jsonify({
            'explanations': explanations
        }), 200
        
    except Exception as e:
        print(f"Error in explain_findings: {str(e)}")
        return jsonify({'error': f'Explanation failed: {str(e)}'}), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_ENV') == 'development'
    app.run(host='0.0.0.0', port=port, debug=debug)
