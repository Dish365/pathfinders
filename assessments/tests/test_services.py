import pytest
from unittest.mock import patch, MagicMock
from ..services import FastAPIClient
from django.conf import settings

@pytest.mark.asyncio
class TestFastAPIClient:
    @pytest.fixture
    def client(self):
        return FastAPIClient()

    @pytest.fixture
    def mock_response(self):
        mock = MagicMock()
        mock.json.return_value = {
            'primary_gift': 'teaching',
            'secondary_gifts': ['leadership', 'shepherding'],
            'scores': {
                'teaching': 20,
                'leadership': 18,
                'shepherding': 15
            }
        }
        mock.status_code = 200
        return mock

    async def test_calculate_gifts(self, client, mock_response):
        test_data = {
            'user_id': 1,
            'answers': [{'question_id': 1, 'answer': 5}]
        }
        
        with patch('httpx.AsyncClient.post') as mock_post:
            mock_post.return_value = mock_response
            result = await client.calculate_gifts(test_data)
            
            assert 'primary_gift' in result
            assert 'secondary_gifts' in result
            assert 'scores' in result
            mock_post.assert_called_once_with(
                f"{settings.FASTAPI_URL}/calculate-gifts",
                json=test_data
            )

    async def test_save_progress(self, client, mock_response):
        user_id = 1
        progress_data = [{'question_id': 1, 'answer': 5}]
        
        with patch('httpx.AsyncClient.post') as mock_post:
            mock_post.return_value = mock_response
            result = await client.save_progress(user_id, progress_data)
            
            assert result == mock_response.json.return_value
            mock_post.assert_called_once_with(
                f"{settings.FASTAPI_URL}/save-progress",
                json={
                    "user_id": user_id,
                    "progress": progress_data
                }
            )

    async def test_client_cleanup(self, client):
        with patch('httpx.AsyncClient.aclose') as mock_aclose:
            await client.close()
            mock_aclose.assert_called_once() 