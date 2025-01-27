import httpx
from django.conf import settings
from typing import Dict, Any
import os

class FastAPIClient:
    def __init__(self):
        # Use internal network URL since both services are on same server
        self.base_url = os.getenv('FASTAPI_URL', 'http://127.0.0.1:8001')
        self.timeout = 30.0
        
    def calculate_gifts_sync(self, data):
        """Synchronous request to FastAPI calculate-gifts endpoint"""
        with httpx.Client() as client:
            try:
                response = client.post(
                    f"{self.base_url}/calculate-gifts/",  # Add endpoint path
                    json=data,
                    timeout=self.timeout
                )
                response.raise_for_status()
                return response.json()
            except httpx.HTTPError as e:
                raise ValueError(f"FastAPI calculation failed: {str(e)}")

    async def calculate_gifts(self, data):
        """Asynchronous request to FastAPI calculate-gifts endpoint"""
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    f"{self.base_url}/calculate-gifts/",
                    json=data,
                    timeout=self.timeout,
                    headers={
                        'X-API-Key': os.getenv('API_KEY'),  # Add API key for security
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