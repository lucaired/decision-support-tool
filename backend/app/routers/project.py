from fastapi import APIRouter, Body, status, HTTPException, UploadFile
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse, Response, StreamingResponse
import logging
from sys import stdout

from app.mongodb.crud.project import Project, UpdateProject
from app.neo4j import Neo4JGraph, DE
import app.mongodb.crud.project as crud
import app.mongodb.crud.variant_images as variant_images_crud

logger = logging.getLogger('mylogger')
logger.setLevel(logging.DEBUG) # set logger level
logFormatter = logging.Formatter\
("%(name)-12s %(asctime)s %(levelname)-8s %(filename)s:%(funcName)s %(message)s")
consoleHandler = logging.StreamHandler(stdout) #set streamhandler to stdout
consoleHandler.setFormatter(logFormatter)
logger.addHandler(consoleHandler)

router = APIRouter(
    prefix="/projects",
)

@router.get("/", response_model=list[Project])
async def get_all_projects():
    return await crud.query_all_projects()

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

@router.post("/variant/{variant_id}/images", status_code=status.HTTP_202_ACCEPTED)
async def create_images_for_variant(variant_id: str, files: list[UploadFile]):
    for file in files:
        variant_images_crud.create_image_for_variant(file, variant_id)

@router.get("/variant/{variant_id}/images")
async def get_all_variant_images(variant_id: str, response_model=list[str]):
    return await variant_images_crud.get_images_for_variant(variant_id)

@router.get("/variant/image/{image_name}")
async def get_image_by_name(image_name: str):
    image = await variant_images_crud.get_image_by_name(image_name)
    return Response(content=image or "", media_type="image/jpeg")

@router.get("/design_episodes")
async def get_all_project_design_episodes():
    # TODO: apply project scope in neo4j query
    try:
        neo = Neo4JGraph()
        all_design_episode_descriptions: list[DE] = neo.query_all_design_episode_descriptions([])
        return all_design_episode_descriptions
    except Exception as e:
        logger.error(e)
        return []