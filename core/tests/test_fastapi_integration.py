from django.test import TestCase
from unittest.mock import patch, MagicMock
from core.services import FastAPIClient
import asyncio

class FastAPIIntegrationTests(TestCase):
    def setUp(self):
        self.client = FastAPIClient()
        self.test_data = {
            'user_id': 1,
            'answers': [
                {'question_id': 1, 'answer': 5, 'gift_correlation': {'TEACHING': 0.9}}
            ]
        }

    @patch('httpx.AsyncClient.post')
    def test_calculate_gifts(self, mock_post):
        mock_response = MagicMock()
        mock_response.json.return_value = {
            'scores': {'TEACHING': 0.9},
            'primary_gift': 'Teaching',
            'secondary_gifts': []
        }
        mock_post.return_value = mock_response

        async def run_test():
            result = await self.client.calculate_gifts(self.test_data)
            self.assertTrue('scores' in result)
            self.assertTrue('primary_gift' in result)

        asyncio.run(run_test())

    @patch('httpx.AsyncClient.post')
    def test_save_progress(self, mock_post):
        mock_response = MagicMock()
        mock_response.json.return_value = {'status': 'saved'}
        mock_post.return_value = mock_response

        async def run_test():
            result = await self.client.save_progress(self.test_data)
            self.assertEqual(result['status'], 'saved')

        asyncio.run(run_test()) 