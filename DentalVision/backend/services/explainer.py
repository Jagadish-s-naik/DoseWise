import os
from anthropic import Anthropic
from dotenv import load_dotenv

load_dotenv()

class DentalExplainer:
    """Generates patient-friendly explanations using Claude API"""
    
    def __init__(self):
        self.api_key = os.getenv('CLAUDE_API_KEY', '')
        self.client = None
        self.use_cache = True
        
        # Cache common explanations
        self.cached_explanations = {
            'cavity': {
                'explanation': 'A cavity is a small hole in your tooth caused by decay. Think of it like rust on metal - bacteria create acid that slowly eats away at your tooth.',
                'recommendation': 'Schedule an appointment with your dentist soon to get it filled before it gets bigger.',
                'urgency': 'soon'
            },
            'healthy_tooth': {
                'explanation': 'This tooth looks healthy! No visible signs of decay, cracks, or other issues.',
                'recommendation': 'Keep up your regular brushing and flossing routine. Continue your routine dental checkups.',
                'urgency': 'routine'
            },
            'filling': {
                'explanation': 'This tooth has a filling, which means a cavity was previously repaired. The filling is protecting the tooth where decay was removed.',
                'recommendation': 'The filling appears stable. Continue regular dental visits to monitor it.',
                'urgency': 'routine'
            },
            'crown': {
                'explanation': 'A crown is a cap that covers the entire visible part of a tooth. It protects a tooth that was damaged or had a large filling.',
                'recommendation': 'Crowns can last many years with proper care. See your dentist if you notice any looseness or discomfort.',
                'urgency': 'routine'
            }
        }
        
        if self.api_key:
            try:
                self.client = Anthropic(api_key=self.api_key)
                print("✓ Claude API initialized")
            except Exception as e:
                print(f"⚠ Failed to initialize Claude API: {str(e)}")
        else:
            print("⚠ No Claude API key found, using cached explanations")
    
    def is_ready(self):
        """Check if explainer is ready"""
        return self.client is not None or self.use_cache
    
    def explain(self, detections):
        """Generate explanations for all detections"""
        explanations = []
        
        for detection in detections:
            explanation = self._explain_single(detection)
            if explanation:
                explanations.append(explanation)
        
        return explanations
    
    def _explain_single(self, detection):
        """Generate explanation for a single detection"""
        class_name = detection.get('class', '').lower()
        tooth_number = detection.get('tooth_number', 0)
        confidence = detection.get('confidence', 0)
        
        # Try cache first
        if class_name in self.cached_explanations:
            cached = self.cached_explanations[class_name]
            return {
                'tooth_number': tooth_number,
                'condition': class_name,
                'explanation': cached['explanation'],
                'recommendation': cached['recommendation'],
                'urgency': cached['urgency'],
                'confidence': confidence
            }
        
        # If Claude API available, generate custom explanation
        if self.client:
            try:
                explanation = self._generate_with_claude(detection)
                if explanation:
                    return explanation
            except Exception as e:
                print(f"Claude API error: {str(e)}")
        
        # Fallback to generic explanation
        return self._generate_generic_explanation(detection)
    
    def _generate_with_claude(self, detection):
        """Generate explanation using Claude API"""
        try:
            class_name = detection.get('class', '')
            tooth_number = detection.get('tooth_number', 0)
            confidence = detection.get('confidence', 0)
            urgency = detection.get('urgency', 'routine')
            
            prompt = f"""You are a dental educator explaining X-ray findings to a patient with no medical knowledge.

Finding: {class_name} detected in tooth #{tooth_number} (confidence: {confidence*100:.0f}%)

Provide a brief explanation (2-3 sentences max) that includes:
1. What this finding means in simple terms (8th grade reading level)
2. A recommended action (e.g., "schedule appointment soon", "routine checkup is fine")

Be reassuring but honest. Avoid medical jargon. Do not use words like "diagnosed" - use "detected" instead.

Format your response as JSON:
{{
  "explanation": "your explanation here",
  "recommendation": "your recommendation here",
  "urgency": "urgent|soon|routine"
}}"""

            message = self.client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=300,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )
            
            # Parse response
            import json
            response_text = message.content[0].text
            
            # Extract JSON from response
            start = response_text.find('{')
            end = response_text.rfind('}') + 1
            if start >= 0 and end > start:
                json_str = response_text[start:end]
                parsed = json.loads(json_str)
                
                return {
                    'tooth_number': tooth_number,
                    'condition': class_name,
                    'explanation': parsed.get('explanation', ''),
                    'recommendation': parsed.get('recommendation', ''),
                    'urgency': parsed.get('urgency', urgency),
                    'confidence': confidence
                }
            
        except Exception as e:
            print(f"Error generating with Claude: {str(e)}")
            return None
    
    def _generate_generic_explanation(self, detection):
        """Generate generic fallback explanation"""
        class_name = detection.get('class', 'unknown')
        tooth_number = detection.get('tooth_number', 0)
        confidence = detection.get('confidence', 0)
        urgency = detection.get('urgency', 'routine')
        
        # Generic templates
        if 'cavity' in class_name or 'decay' in class_name:
            explanation = "We detected what appears to be tooth decay. This is a common issue where bacteria damage the tooth structure."
            recommendation = "Schedule an appointment with your dentist to have this examined and treated."
            urgency = "soon"
        elif 'filling' in class_name:
            explanation = "This tooth has a dental filling, which means previous decay was repaired."
            recommendation = "Continue regular dental checkups to monitor the filling."
            urgency = "routine"
        elif 'healthy' in class_name:
            explanation = "This tooth appears healthy with no visible concerns."
            recommendation = "Keep up your regular oral hygiene routine."
            urgency = "routine"
        else:
            explanation = f"We detected {class_name.replace('_', ' ')} in this area."
            recommendation = "Discuss this finding with your dentist at your next visit."
            urgency = urgency
        
        return {
            'tooth_number': tooth_number,
            'condition': class_name,
            'explanation': explanation,
            'recommendation': recommendation,
            'urgency': urgency,
            'confidence': confidence
        }
