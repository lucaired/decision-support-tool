from bson import ObjectId
from fastapi import APIRouter, Body, status, HTTPException
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse, Response
from pydantic import BaseModel, Field
from typing import ForwardRef

import app.mongodb.crud.project as crud
from .shared import PyObjectId

router = APIRouter(
    prefix="/projects",
)

class Tree(BaseModel):
    name: str
    attributes: dict[str, object]
    id: str
    ifc_file: str = Field(..., alias="ifcFile")
    bim_reference: str = Field(..., alias="bimReference")
    decision_level: str = Field(..., alias="decisionLevel")
    children: list['Tree']

class Project(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    name: str
    weights_set: dict[str, float] = Field(..., alias="weightsSet")
    tree: Tree = Field(...)

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
        schema_extra = {
            "example": {
                "name": "Building.Lab",
                "weightsSet": {
                    "Design Quality": 2.0,
                    "Comfort and health": 1.0,
                    "Functionality": 1.0
                },
                "tree": {
                    "name": "V1-1",
                    "attributes": {
                        "level": "Building Level"
                    },
                    "id": "g9ecb",
                    "ifcFile": "V1-1.ifc",
                    "bimReference": "<some-urn>",
                    "decisionLevel": "construction",
                    "children": []
                }
            }
        }

class UpdateProject(BaseModel):
    name: str
    weights_set: dict[str, float]  = Field(..., alias="weightsSet")
    tree: Tree = Field(...)

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
        schema_extra = {
            "example": {
                "name": "Building.Lab",
                "weightsSet": {
                    "Design Quality": 2.0,
                    "Comfort and health": 1.0,
                    "Functionality": 1.0
                },
                "tree": {
                    "name": "V1-1",
                    "attributes": {
                        "level": "Building Level"
                    },
                    "id": "g9ecb",
                    "ifcFile": "V1-1.ifc",
                    "bimReference": "<some-urn>",
                    "decisionLevel": "construction",
                    "children": []
                }
            }
        }

@router.get("/", response_model=list[Project])
async def get_all_projects():
    all_project = await crud.query_all_projects()
    return all_project

@router.post("/", response_description="Add new project", response_model=Project)
async def create_project(project: Project = Body(...)):
    json_project = jsonable_encoder(project)
    json_project = await crud.create_project(json_project)
    return JSONResponse(status_code=status.HTTP_201_CREATED, content=json_project)

@router.put("/{id}", response_description="Update a project", response_model=Project)
async def update_project(id: str, project: UpdateProject = Body(...)):
    json_project = jsonable_encoder(project)
    if result:= await crud.update_project(id=id,project_update=json_project):
        return JSONResponse(status_code=status.HTTP_200_OK, content=result)
    else:    
        raise HTTPException(status_code=404, detail=f"Project {id} not found")

@router.delete("/{id}", response_description="Delete a project", response_model=Project)
async def delete_project(id: str):        
    delete_result = await crud.delete_project(id)
    if delete_result.deleted_count == 1:
        return Response(status_code=status.HTTP_204_NO_CONTENT)

    raise HTTPException(status_code=404, detail=f"Project {id} not found")