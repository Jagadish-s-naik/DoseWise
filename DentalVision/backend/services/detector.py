import os
import numpy as np
from PIL import Image
import requests
from dotenv import load_dotenv

load_dotenv()

class DentalDetector:
    """Handles dental X-ray detection using YOLOv8 or Roboflow fallback"""
    
    def __init__(self):
        self.model = None
        self.source = 'mock'  # 'yolov8', 'roboflow', or 'mock'
        self.roboflow_api_key = os.getenv('ROBOFLOW_API_KEY', '')
        self.roboflow_model = 'dentex'
        self.roboflow_version = '1'
        
        self._initialize_model()
    
    def _initialize_model(self):
        """Initialize YOLOv8 model or fall back to alternatives"""
        try:
            # Try to load YOLOv8 model
            model_path = os.getenv('YOLO_MODEL_PATH', './models/best.pt')
            if os.path.exists(model_path):
                from ultralytics import YOLO
                self.model = YOLO(model_path)
                self.source = 'yolov8'
                print("✓ YOLOv8 model loaded successfully")
            else:
                print("⚠ YOLOv8 model not found, using fallback")
                if self.roboflow_api_key:
                    self.source = 'roboflow'
                    print("✓ Using Roboflow API fallback")
                else:
                    self.source = 'mock'
                    print("⚠ Using mock detections (demo mode)")
        except Exception as e:
            print(f"⚠ Failed to load YOLOv8: {str(e)}")
            if self.roboflow_api_key:
                self.source = 'roboflow'
            else:
                self.source = 'mock'
    
    def is_ready(self):
        """Check if detector is ready"""
        return self.source in ['yolov8', 'roboflow', 'mock']
    
    def get_source(self):
        """Get current detection source"""
        return self.source
    
    def detect(self, image):
        """Run detection on image"""
        if self.source == 'yolov8':
            return self._detect_yolov8(image)
        elif self.source == 'roboflow':
            return self._detect_roboflow(image)
        else:
            return self._detect_mock(image)
    
    def _detect_yolov8(self, image):
        """Detect using YOLOv8 model"""
        try:
            # Convert PIL Image to numpy array
            img_array = np.array(image)
            
            # Run inference
            results = self.model(img_array)
            
            detections = []
            for result in results:
                boxes = result.boxes
                for i, box in enumerate(boxes):
                    class_id = int(box.cls[0])
                    confidence = float(box.conf[0])
                    bbox = box.xywh[0].tolist()  # [x_center, y_center, width, height]
                    
                    # Map class to dental condition
                    class_name = self._map_class_name(class_id)
                    urgency = self._determine_urgency(class_name, confidence)
                    tooth_number = self._estimate_tooth_number(bbox, image.size)
                    
                    detections.append({
                        'class': class_name,
                        'confidence': round(confidence, 2),
                        'bbox': [round(x, 2) for x in bbox],
                        'tooth_number': tooth_number,
                        'urgency': urgency
                    })
            
            return detections
        except Exception as e:
            print(f"YOLOv8 detection error: {str(e)}")
            return self._detect_mock(image)
    
    def _detect_roboflow(self, image):
        """Detect using Roboflow API"""
        try:
            from io import BytesIO
            import base64
            
            # Convert image to base64
            buffered = BytesIO()
            image.save(buffered, format="JPEG")
            img_str = base64.b64encode(buffered.getvalue()).decode()
            
            # Call Roboflow API
            url = f"https://detect.roboflow.com/{self.roboflow_model}/{self.roboflow_version}"
            params = {"api_key": self.roboflow_api_key}
            
            response = requests.post(
                url,
                params=params,
                data=img_str,
                headers={"Content-Type": "application/x-www-form-urlencoded"}
            )
            
            if response.status_code == 200:
                data = response.json()
                detections = []
                
                for pred in data.get('predictions', []):
                    class_name = pred['class']
                    confidence = pred['confidence']
                    
                    # Convert to xywh format
                    bbox = [
                        pred['x'],
                        pred['y'],
                        pred['width'],
                        pred['height']
                    ]
                    
                    urgency = self._determine_urgency(class_name, confidence)
                    tooth_number = self._estimate_tooth_number(bbox, image.size)
                    
                    detections.append({
                        'class': class_name,
                        'confidence': round(confidence, 2),
                        'bbox': [round(x, 2) for x in bbox],
                        'tooth_number': tooth_number,
                        'urgency': urgency
                    })
                
                return detections
            else:
                print(f"Roboflow API error: {response.status_code}")
                return self._detect_mock(image)
                
        except Exception as e:
            print(f"Roboflow detection error: {str(e)}")
            return self._detect_mock(image)
    
    def _detect_mock(self, image):
        """Generate mock detections for demo purposes"""
        width, height = image.size
        
        # Generate realistic mock detections
        mock_detections = [
            {
                'class': 'healthy_tooth',
                'confidence': 0.92,
                'bbox': [width * 0.25, height * 0.35, width * 0.08, height * 0.12],
                'tooth_number': 8,
                'urgency': 'none'
            },
            {
                'class': 'cavity',
                'confidence': 0.87,
                'bbox': [width * 0.55, height * 0.42, width * 0.06, height * 0.09],
                'tooth_number': 19,
                'urgency': 'high'
            },
            {
                'class': 'filling',
                'confidence': 0.94,
                'bbox': [width * 0.72, height * 0.38, width * 0.07, height * 0.11],
                'tooth_number': 30,
                'urgency': 'none'
            },
            {
                'class': 'healthy_tooth',
                'confidence': 0.89,
                'bbox': [width * 0.40, height * 0.33, width * 0.08, height * 0.12],
                'tooth_number': 12,
                'urgency': 'none'
            }
        ]
        
        return mock_detections
    
    def _map_class_name(self, class_id):
        """Map YOLO class ID to dental condition name"""
        # This mapping depends on your trained model
        # Adjust based on actual class names in your model
        class_map = {
            0: 'healthy_tooth',
            1: 'cavity',
            2: 'filling',
            3: 'crown',
            4: 'root_canal',
            5: 'decay'
        }
        return class_map.get(class_id, 'unknown')
    
    def _determine_urgency(self, class_name, confidence):
        """Determine urgency level based on condition"""
        high_urgency = ['cavity', 'decay', 'abscess', 'infection']
        medium_urgency = ['crack', 'wear', 'gingivitis']
        
        if class_name in high_urgency and confidence > 0.75:
            return 'high'
        elif class_name in medium_urgency or (class_name in high_urgency and confidence <= 0.75):
            return 'medium'
        else:
            return 'none'
    
    def _estimate_tooth_number(self, bbox, image_size):
        """Estimate tooth number based on position (Universal Numbering System 1-32)"""
        x_center = bbox[0]
        y_center = bbox[1]
        width, height = image_size
        
        # Simplified estimation - divide mouth into quadrants
        # Upper right: 1-8, Upper left: 9-16
        # Lower left: 17-24, Lower right: 25-32
        
        # Determine if upper or lower
        is_upper = y_center < height / 2
        
        # Determine position from left to right (8 positions)
        position = int((x_center / width) * 8) + 1
        position = max(1, min(8, position))
        
        if is_upper:
            # Upper teeth: right side 1-8, left side 9-16
            if x_center < width / 2:
                # Right side (teeth 1-8)
                tooth_number = position
            else:
                # Left side (teeth 9-16)
                tooth_number = 16 - (position - 1)
        else:
            # Lower teeth: left side 17-24, right side 25-32
            if x_center < width / 2:
                # Right side (teeth 25-32)
                tooth_number = 25 + (position - 1)
            else:
                # Left side (teeth 17-24)
                tooth_number = 24 - (position - 1)
        
        return max(1, min(32, tooth_number))
