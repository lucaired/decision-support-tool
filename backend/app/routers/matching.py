import logging
from sys import stdout
from fastapi import APIRouter, HTTPException
import copy

import app.mongodb.crud.project as crud
from app.routers.project import Project
from app.nlp_matching import boost_by_weight, match_design_episodes_by_description, get_best_matching_design_episodes, boost_similiarity_ranking_based_on_frequency

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
async def create_project_matching_result(id: str, variant_design_episode_weights: dict):
    if project_dict := await crud.query_project_by_id(id):
        design_episode_variant_weights = {}
        design_episode_weights = {}
        for variant in variant_design_episode_weights.values():
            for design_episode in variant['designEpisodes']:
                design_episode_id = design_episode['designEpisodeId']

                if design_episode_id in design_episode_variant_weights:
                    design_episode_variant_weights[design_episode_id] = variant['variantWeight']+design_episode_variant_weights[design_episode_id]
                else:
                    design_episode_variant_weights[design_episode_id] = variant['variantWeight']

                if design_episode_id in design_episode_weights:
                    design_episode_weights[design_episode_id] = design_episode['designEpisodeWeight']+design_episode_weights[design_episode_id]
                else:
                    design_episode_weights[design_episode_id] = design_episode['designEpisodeWeight']

        # Containes up to three tuples with the three most similiar 
        # design episodes per search design episode
        all_matching_design_episodes = []
        for id in design_episode_variant_weights:
            if (len(id) > 0):
                matching_results = await match_design_episodes_by_description(id)
                all_matching_design_episodes.extend(matching_results)

        all_matching_design_episodes = boost_similiarity_ranking_based_on_frequency(all_matching_design_episodes)
        all_matching_design_episodes = boost_by_weight(all_matching_design_episodes, design_episode_variant_weights)
        all_matching_design_episodes = boost_by_weight(all_matching_design_episodes, design_episode_weights)

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