import logging
from sys import stdout
from fastapi import APIRouter, Body, status, HTTPException
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse, Response
from pydantic import BaseModel, Field

import app.mongodb.crud.project as crud
from app.routers.project import Project
from app.nlp_matching import match_design_episodes_by_description, get_best_matching_design_episodes

logger = logging.getLogger('mylogger')
logger.setLevel(logging.DEBUG) # set logger level
logFormatter = logging.Formatter\
("%(name)-12s %(asctime)s %(levelname)-8s %(filename)s:%(funcName)s %(message)s")
consoleHandler = logging.StreamHandler(stdout) #set streamhandler to stdout
consoleHandler.setFormatter(logFormatter)
logger.addHandler(consoleHandler)

router = APIRouter(
    prefix="/matchings",
)


@router.post(
    "/project/{id}/match_by_design_episodes",
    response_description="Get matching projects by DE matching",
    response_model=list[Project]
) 
async def create_project_matching_result(id: str, design_episode_ids: dict):
    if project_dict := await crud.query_project_by_id(id):
        all_design_episode_ids = []
        for design_episode_ids in design_episode_ids.values():
            all_design_episode_ids.extend(design_episode_ids)
        all_unique_design_episode_ids = list(set(all_design_episode_ids))
        # Containes up to three tuples with the three most similiar 
        # design episodes per search design episode
        # TODO: add maturity weight ?
        all_matching_design_episodes = []
        for id in all_unique_design_episode_ids:
            if (len(id) > 0):
                matching_results = await match_design_episodes_by_description(id)
                all_matching_design_episodes.extend(matching_results)
        best_matching_design_episodes = get_best_matching_design_episodes(all_matching_design_episodes)
        best_matching_design_episode_ids = list(map(lambda de: de.result_de_id, best_matching_design_episodes))
        logger.info(best_matching_design_episode_ids)
        return await crud.get_projects_by_design_episode_guid(best_matching_design_episode_ids)

    raise HTTPException(status_code=404, detail=f"Project {id} not found")

@router.get("/project/{id}/match_by_building_codes", response_description="Get matching projects by building code matching", response_model=list[Project])
async def query_matching_projects(id: str):        
    project = await crud.query_project_by_id(id)
    if project:
        # TODO: integrate building code matching
        return [project]

    raise HTTPException(status_code=404, detail=f"Project {id} not found")    