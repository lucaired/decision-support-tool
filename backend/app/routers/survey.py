from bson import ObjectId
from fastapi import APIRouter, Body, status, HTTPException
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse, Response
from pydantic import BaseModel, Field
from bson import ObjectId

import app.mongodb.crud.survey as crud
from .shared import PyObjectId

router = APIRouter(
    prefix="/surveys",
)

class Criterion(BaseModel):
    label: str
    rating: int

class CriteriaGroup(BaseModel):
    label: str
    criteria: list[Criterion]

class FactorRating(BaseModel):
    label: str
    criteria_groups: list[CriteriaGroup] = Field(..., alias='criteriaGroups')

class Survey(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    variant_id: str = Field(..., alias='variantId')
    user: str
    factor_ratings: list[FactorRating] = Field(..., alias='factorRatings')

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
        schema_extra = {
            "example": {
                "variantId": "123abc",
                "user": "Name",
                "factorRatings": [{"label":"Social Factors","criteriaGroups":[{"label":"Design Quality","criteria":[{"label":"Urban integration","rating":3},{"label":"External space quality","rating":3},{"label":"Building quality","rating":3},{"label":"User and task-specific image","rating":2}]},{"label":"Functionality","criteria":[{"label":"Accessibility","rating":2},{"label":"Public accessibility","rating":3},{"label":"Barrier-free access","rating":2},{"label":"Social integration spaces","rating":3}]},{"label":"Comfort and health","criteria":[{"label":"Safety","rating":2},{"label":"Sound insulation","rating":6}]}]}]
            }
        }

class UpdateSurvey(BaseModel):
    variant_id: str = Field(..., alias='variantId')
    user: str
    factor_ratings: list[FactorRating] = Field(..., alias='factorRatings')

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
        schema_extra = {
            "example": {
                "variantId": "123abc",
                "user": "Name",
                "factorRatings": [{"label":"Social Factors","criteriaGroups":[{"label":"Design Quality","criteria":[{"label":"Urban integration","rating":3},{"label":"External space quality","rating":3},{"label":"Building quality","rating":3},{"label":"User and task-specific image","rating":2}]},{"label":"Functionality","criteria":[{"label":"Accessibility","rating":2},{"label":"Public accessibility","rating":3},{"label":"Barrier-free access","rating":2},{"label":"Social integration spaces","rating":3}]},{"label":"Comfort and health","criteria":[{"label":"Safety","rating":2},{"label":"Sound insulation","rating":6}]}]}]
            }
        }

@router.get("/{variant_id}", response_model=list[Survey])
async def get_all_surveys_for_variant_id(variant_id: str):
    all_survey = await crud.query_all_surveys_for_variant_id(variant_id)
    return all_survey

@router.post("/", response_description="Add new survey", response_model=Survey)
async def create_survey(survey: Survey = Body(...)):
    json_survey = jsonable_encoder(survey)
    json_survey = await crud.create_survey(json_survey)
    return JSONResponse(status_code=status.HTTP_201_CREATED, content=json_survey)

@router.put("/{id}", response_description="Update a survey", response_model=Survey)
async def update_survey(id: str, survey: UpdateSurvey = Body(...)):
    json_survey = jsonable_encoder(survey)
    if result:= await crud.update_survey(id=id,survey_update=json_survey):
        return JSONResponse(status_code=status.HTTP_200_OK, content=result)
    else:    
        raise HTTPException(status_code=404, detail=f"Survey {id} not found")

@router.delete("/{id}", response_description="Delete a survey", response_model=Survey)
async def delete_survey(id: str):        
    delete_result = await crud.delete_survey(id)
    if delete_result.deleted_count == 1:
        return Response(status_code=status.HTTP_204_NO_CONTENT)

    raise HTTPException(status_code=404, detail=f"Survey {id} not found")