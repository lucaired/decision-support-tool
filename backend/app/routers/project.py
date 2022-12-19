from app.mongodb.crud.project import Project, UpdateProject
from fastapi import APIRouter, Body, status, HTTPException
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse, Response

from app.routers.shared import flatten
import app.mongodb.crud.project as crud

router = APIRouter(
    prefix="/projects",
)

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