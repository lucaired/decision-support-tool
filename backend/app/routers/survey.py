from bson import ObjectId
from fastapi import APIRouter, Body, status
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

import app.mongodb.crud as crud

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
    test: str

@router.get("/{project_id}")
async def get_all_surveys_for_project_id(project_id: str):
    return query_all_surveys_for_project_id(project_id)

@router.post("/", response_description="Add new survey", response_model=Survey)
async def create_survey(survey: Survey = Body(...)):
    json_survey = jsonable_encoder(survey)
    json_survey = await crud.create_survey(json_survey)
    return JSONResponse(status_code=status.HTTP_201_CREATED, content=json_survey)