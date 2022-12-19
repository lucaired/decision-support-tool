from bson import ObjectId
from fastapi import APIRouter, Body, status, HTTPException
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse, Response
from pydantic import BaseModel, Field

import app.mongodb.crud.survey as crud

router = APIRouter(
    prefix="/surveys",
)

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __modify_schema__(cls, field_schema):
        field_schema.update(type="string")

class Survey(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    test: str = Field(..., alias='test')
    project_id: str = Field(..., alias='projectId')

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
        schema_extra = {
            "example": {
                "test": "Jane Doe",
                "projectId": "123abc",
            }
        }

class UpdateSurvey(BaseModel):
    test: str
    project_id: str = Field(..., alias='projectId')

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
        schema_extra = {
            "example": {
                "test": "Jane Doe",                
                "projectId": "123abc",
            }
        }

@router.get("/{project_id}", response_model=list[Survey])
async def get_all_surveys_for_project_id(project_id: str):
    all_survey = await crud.query_all_surveys_for_project_id(project_id)
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