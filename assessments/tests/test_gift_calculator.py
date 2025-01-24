from django.test import TestCase
from ..gift_calculator import GiftCalculator

class GiftCalculatorTests(TestCase):
    def setUp(self):
        self.calculator = GiftCalculator()
        self.sample_answers = [
            {
                'question_id': 1, 
                'answer': 5, 
                'gift_correlation': {
                    'TEACHING': 0.8,
                    'LEADERSHIP': 0.4,
                    'SHEPHERDING': 0.3
                }
            },
            {
                'question_id': 2, 
                'answer': 4,
                'gift_correlation': {
                    'SHEPHERDING': 0.9,
                    'MERCY': 0.6,
                    'SERVING': 0.3
                }
            }
        ]

    def test_calculate_scores(self):
        results = self.calculator.calculate_scores(self.sample_answers)
        self.assertIsInstance(results, dict)
        self.assertTrue(all(gift in results for gift in self.calculator.SPIRITUAL_GIFTS.keys()))
        
        # Verify some expected scores
        self.assertGreater(results['TEACHING'], 0)
        self.assertGreater(results['SHEPHERDING'], 0)
        self.assertLessEqual(max(results.values()), 1.0)

    def test_identify_gifts(self):
        scores = {
            'TEACHING': 0.8,
            'SHEPHERDING': 0.75,
            'LEADERSHIP': 0.7,
            'MERCY': 0.5,
            'SERVING': 0.4,
            'ADMINISTRATION': 0.3,
            'EVANGELISM': 0.2
        }
        primary_gift, secondary_gifts = self.calculator.identify_gifts(scores)
        
        self.assertEqual(primary_gift, 'Teaching')
        self.assertEqual(len(secondary_gifts), 2)
        self.assertIn('Shepherding', secondary_gifts)
        self.assertIn('Leadership', secondary_gifts)

    def test_get_gift_descriptions(self):
        primary_gift = 'Teaching'
        secondary_gifts = ['Leadership', 'Shepherding']
        
        descriptions = self.calculator.get_gift_descriptions(primary_gift, secondary_gifts)
        
        self.assertIn('primary', descriptions)
        self.assertIn('secondary', descriptions)
        self.assertEqual(descriptions['primary']['gift'], 'Teaching')
        self.assertTrue(descriptions['primary']['description'])
        self.assertEqual(len(descriptions['secondary']), 2) 