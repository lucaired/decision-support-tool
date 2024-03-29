import contextlib
from bson import ObjectId
import logging
from pydantic import BaseModel, Field
from sys import stdout

from app.routers.shared import PyObjectId, flatten
from ..database import mongodb

logger = logging.getLogger('mylogger')
logger.setLevel(logging.DEBUG) # set logger level
logFormatter = logging.Formatter\
("%(name)-12s %(asctime)s %(levelname)-8s %(filename)s:%(funcName)s %(message)s")
consoleHandler = logging.StreamHandler(stdout) #set streamhandler to stdout
consoleHandler.setFormatter(logFormatter)
logger.addHandler(consoleHandler)


class Tree(BaseModel):
    name: str
    attributes: dict[str, object]
    id: str
    ifc_file: str = Field(..., alias="ifcFile")
    bim_reference: str = Field(..., alias="bimReference")
    design_episode_ids: list[str] = Field(..., alias="designEpisodeIds")
    decision_level: str = Field(..., alias="decisionLevel")
    children: list['Tree']
    show_node_control: bool = Field(alias="showNodeControl")
    path_length: int = Field(alias="pathLength")

    def extract_all_design_episode_ids(self) -> list[str]:
        return self.design_episode_ids + flatten(list(map(lambda tree: tree.extract_all_design_episode_ids(), self.children)))

class Project(BaseModel):
    name: str
    weights_set: dict[str, float] = Field(..., alias="weightsSets")
    tree: Tree = Field(...)
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
        schema_extra = {
            "example": {
                "name": "Building.Lab",
                "weightsSets": {
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
    weights_set: dict[str, float]  = Field(..., alias="weightsSets")
    tree: Tree = Field(...)

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
        schema_extra = {
            "example": {
                "name": "Building.Lab",
                "weightsSets": {
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


def query_all_projects(): 
    return mongodb.projects.find().to_list(100)

async def query_project_by_id(id: str):
    return await mongodb.projects.find_one({"_id": id})

async def delete_project(project_id: str): 
    return await mongodb.projects.delete_one({"_id": project_id})

async def create_project(project): 
    new_project = await mongodb.projects.insert_one(project)
    return await mongodb.projects.find_one({"_id": new_project.inserted_id})

async def update_project(id, project_update): 
    update_result = await mongodb.projects.update_one({"_id": id}, {"$set": project_update})
    if (
        updated_project := await mongodb.projects.find_one({"_id": id})
    ) is not None:
        return updated_project

async def get_projects_by_design_episode_guid(design_episode_ids: list[str]) -> list[Project]:
    all_project = await mongodb.projects.find().to_list(1000)
    all_project_objects: list[Project] = list(map(lambda project_dict: Project.parse_obj(project_dict), all_project))
    
    all_projects_with_design_episode_ids: list[(Project, list[str])] = \
        list(
            map(
                lambda project: (project, project.tree.extract_all_design_episode_ids()),
                all_project_objects
                )
            )
    
    all_matched_projects_by_design_episode_ids = []

    # preserve ordering of the projects
    for de_id in design_episode_ids:
        for project_and_de_ids in all_projects_with_design_episode_ids:
            if de_id in project_and_de_ids[1]:
                if project_and_de_ids[0] not in all_matched_projects_by_design_episode_ids:
                    all_matched_projects_by_design_episode_ids.append(project_and_de_ids[0])
    
    return all_matched_projects_by_design_episode_ids
    