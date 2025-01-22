from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict
from assessments.gift_calculator import GiftCalculator
from users.ministry_roles import MINISTRY_ROLE_MAPPINGS


# Create FastAPI app instance
app = FastAPI()

calculator = GiftCalculator()

class Answer(BaseModel):
    question_id: int
    answer: int
    gift_correlation: Dict[str, float]

class AssessmentRequest(BaseModel):
    answers: List[Answer]

class GiftResult(BaseModel):
    scores: Dict[str, float]
    primary_gift: str
    secondary_gifts: List[str]
    descriptions: Dict

@app.post("/calculate-gifts/", response_model=GiftResult)
async def calculate_gifts(assessment: AssessmentRequest):
    try:
        # Validate input data
        if not assessment.answers:
            raise HTTPException(
                status_code=400,
                detail="No answers provided"
            )

        # Convert answers to the format expected by calculator
        formatted_answers = [
            {
                'question_id': a.question_id,
                'answer': a.answer,
                'gift_correlation': {
                    k.upper(): float(v)  # Ensure uppercase keys and float values
                    for k, v in a.gift_correlation.items()
                }
            }
            for a in assessment.answers
        ]

        # Calculate results
        scores = calculator.calculate_scores(formatted_answers)
        
        # Use consistent threshold factor with Django
        threshold_factor = 0.95  # Match the threshold used in Django views
        primary_gift, secondary_gifts = calculator.identify_gifts(
            scores, 
            threshold_factor=threshold_factor
        )
        
        descriptions = calculator.get_gift_descriptions(primary_gift, secondary_gifts)

        # Get role recommendations from ministry roles mapping
        roles = {
            'primary_roles': [],
            'secondary_roles': [],
            'ministry_areas': set()  # Using set to avoid duplicates
        }
        
        # Add roles from primary gift
        if primary_gift in MINISTRY_ROLE_MAPPINGS:
            mapping = MINISTRY_ROLE_MAPPINGS[primary_gift]
            roles['primary_roles'].extend(mapping['primary'])
            roles['ministry_areas'].update(mapping['secondary'])
        
        # Add roles from secondary gifts
        for gift in secondary_gifts:
            if gift in MINISTRY_ROLE_MAPPINGS:
                mapping = MINISTRY_ROLE_MAPPINGS[gift]
                # Add top 2 primary roles from each secondary gift
                roles['secondary_roles'].extend(mapping['primary'][:2])
                roles['ministry_areas'].update(mapping['secondary'])

        # Convert set to list for JSON serialization
        roles['ministry_areas'] = sorted(list(roles['ministry_areas']))
        
        # Remove duplicates while preserving order
        roles['primary_roles'] = list(dict.fromkeys(roles['primary_roles']))
        roles['secondary_roles'] = list(dict.fromkeys(roles['secondary_roles']))

        return {
            'scores': scores,
            'primary_gift': primary_gift,
            'secondary_gifts': secondary_gifts,
            'descriptions': {
                'primary': {
                    'gift': descriptions['primary']['gift'],
                    'description': descriptions['primary']['description'],
                    'details': descriptions['primary']['details']
                },
                'secondary': [
                    {
                        'gift': g['gift'],
                        'description': g['description'],
                        'details': g['details']
                    }
                    for g in descriptions['secondary']
                ]
            },
            'recommended_roles': roles
        }

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        ) 