from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from .models import (
    AssessmentRequest, 
    GiftResult, 
    ProgressData, 
    GiftDescription,
    GiftDescriptions
)
from assessments.gift_calculator import GiftCalculator
import httpx
from typing import List
import os

app = FastAPI(title="Pathfinders Gift Assessment API")

# CORS configuration for production
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://pathfindersgifts.com",
        "https://www.pathfindersgifts.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Update the httpx client calls to use environment variables
DJANGO_API_URL = os.getenv('DJANGO_API_URL', 'http://localhost:8000')

calculator = GiftCalculator()

@app.post("/calculate-gifts/")
async def calculate_gifts(assessment: AssessmentRequest):
    """
    Calculate motivational gifts based on assessment answers
    """
    try:
        # Convert answers to the format expected by calculator
        formatted_answers = [
            {
                'question_id': a.question_id,
                'answer': a.answer,
                'gift_correlation': {
                    k.upper(): v  # Ensure gift keys are uppercase
                    for k, v in a.gift_correlation.items()
                }
            }
            for a in assessment.answers
        ]

        # Calculate results
        scores = calculator.calculate_scores(formatted_answers)
        primary_gift, secondary_gifts = calculator.identify_gifts(
            scores,
            threshold_factor=0.80  # Match threshold
        )
        descriptions = calculator.get_gift_descriptions(primary_gift, secondary_gifts)

        # Get role recommendations from ministry roles mapping
        roles = {
            'primary_roles': [],
            'secondary_roles': [],
            'ministry_areas': []
        }

        return GiftResult(
            scores=scores,
            primary_gift=primary_gift,
            secondary_gifts=secondary_gifts,
            descriptions=GiftDescriptions(
                primary=GiftDescription(
                    gift=descriptions['primary']['gift'],
                    description=descriptions['primary']['description'],
                    details=descriptions['primary']['details']
                ),
                secondary=[
                    GiftDescription(
                        gift=g['gift'],
                        description=g['description'],
                        details=g['details']
                    )
                    for g in descriptions['secondary']
                ]
            ),
            recommended_roles=roles  # Include empty roles structure for consistency
        )

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Calculation failed: {str(e)}"
        )

@app.post("/progress/save/")
async def save_progress(progress: ProgressData):
    """
    Save assessment progress to Django backend
    """
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{DJANGO_API_URL}/api/assessments/save-progress/",
            json=progress.dict(),
            timeout=30.0  # Add timeout for production
        )
        return response.json()

@app.get("/progress/{user_id}/")
async def get_progress(user_id: int):
    """
    Retrieve assessment progress from Django backend
    """
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"http://localhost:8000/api/assessments/get-progress/{user_id}/"
        )
        return response.json()

@app.get("/health/")
async def health_check():
    return {"status": "healthy"} 