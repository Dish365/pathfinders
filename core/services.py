import httpx
from django.conf import settings
from typing import Dict, Any

class FastAPIClient:
    def __init__(self):
        self.base_url = "http://localhost:8001/calculate-gifts/"
        
    def calculate_gifts_sync(self, data):
        """Synchronous request to FastAPI calculate-gifts endpoint"""
        with httpx.Client() as client:
            try:
                response = client.post(
                    self.base_url,
                    json={
                        'user_id': data.get('user_id'),
                        'answers': [
                            {
                                'question_id': answer['question_id'],
                                'answer': answer['answer'],
                                'gift_correlation': answer['gift_correlation']
                            }
                            for answer in data['answers']
                        ]
                    }
                )
                response.raise_for_status()
                result = response.json()
                
                # Validate required fields in response
                required_fields = ['scores', 'primary_gift', 'secondary_gifts', 'descriptions']
                if not all(field in result for field in required_fields):
                    raise ValueError("Invalid response format from gift calculation service")
                    
                return result
            except httpx.HTTPError as e:
                raise ValueError(f"FastAPI calculation failed: {str(e)}")

    async def calculate_gifts(self, data):
        """Asynchronous request to FastAPI calculate-gifts endpoint"""
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    self.base_url,
                    json={
                        'user_id': data.get('user_id'),
                        'answers': [
                            {
                                'question_id': answer['question_id'],
                                'answer': answer['answer'],
                                'gift_correlation': answer['gift_correlation']
                            }
                            for answer in data['answers']
                        ]
                    }
                )
                response.raise_for_status()
                return response.json()
            except httpx.HTTPError as e:
                raise ValueError(f"FastAPI calculation failed: {str(e)}")

    async def save_progress(self, user_id: int, progress_data: Dict[str, Any]) -> Dict[str, Any]:
        """Save assessment progress"""
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    f"{self.base_url}/progress/save/",
                    json={"user_id": user_id, "progress": progress_data},
                    timeout=30.0
                )
                return response.json()
            except Exception as e:
                raise Exception(f"Failed to save progress: {str(e)}")

    async def get_progress(self, user_id: int) -> Dict[str, Any]:
        """Get assessment progress"""
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    f"{self.base_url}/progress/{user_id}/",
                    timeout=30.0
                )
                return response.json()
            except Exception as e:
                raise Exception(f"Failed to get progress: {str(e)}")

    async def close(self):
        """Close the client connection"""
        # This method is kept for backward compatibility
        pass 