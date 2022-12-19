from fastapi import APIRouter, Body, status, HTTPException
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse, Response
from pydantic import BaseModel, Field

from app.routers.shared import flatten
import app.mongodb.crud.project as crud
from app.routers.project import Project
from app.nlp_matching import match_design_episodes_by_description, get_best_matching_design_episodes

router = APIRouter(
    prefix="/matchings",
)

@router.get("/project/{id}/match_by_design_episodes", response_description="Get matching projects by DE matching", response_model=list[Project])
async def query_matching_projects(id: str):
    project_dict = await crud.query_project_by_id(id)
    if project_dict:
        project = Project.parse_obj(project_dict)
        all_design_episode_ids = project.tree.extract_all_design_episode_ids()
        all_unique_design_episode_ids = list(set(all_design_episode_ids))
        # containes up to three tuples with the three most similiar design episodes per search design episode
        # TODO: add maturity
        # y weight ?
        all_matching_design_episodes = flatten(list(map(lambda id: match_design_episodes_by_description(id), all_unique_design_episode_ids)))
        best_matching_design_episodes = get_best_matching_design_episodes(all_matching_design_episodes)
        best_matching_design_episode_ids = list(map(lambda de: de.result_de_id, best_matching_design_episodes))
        return crud.get_projects_by_design_episode_id(best_matching_design_episode_ids)
        
    raise HTTPException(status_code=404, detail=f"Project {id} not found")

@router.get("/project/{id}/match_by_building_codes", response_description="Get matching projects by building code matching", response_model=list[Project])
async def query_matching_projects(id: str):        
    project = await crud.query_project_by_id(id)
    if project:
        # TODO: integrate building code matching
        return [project]

    raise HTTPException(status_code=404, detail=f"Project {id} not found")    