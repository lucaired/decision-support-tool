from fastapi import APIRouter, Body, status, HTTPException
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse, Response
from pydantic import BaseModel, Field

import app.mongodb.crud.project as crud
from app.routers.project import Project

router = APIRouter(
    prefix="/matchings",
)

@router.get("/project/{id}", response_description="Get matching projects by DE matching", response_model=list[Project])
async def query_matching_projects(id: str):        
    project = await crud.query_project_by_id(id)
    if project:
        # TODO: integrate DE matching
        return [project]

    raise HTTPException(status_code=404, detail=f"Project {id} not found")

@router.get("/variant/{id}", response_description="Get matching projects by building code matching", response_model=list[Project])
async def query_matching_projects(id: str):        
    project = await crud.query_project_by_id(id)
    if project:
        # TODO: integrate building code matching
        return [project]

    raise HTTPException(status_code=404, detail=f"Project {id} not found")    