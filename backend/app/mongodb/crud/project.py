from ..database import mongodb

def query_all_projects(): 
    all_project = mongodb.projects.find().to_list(100)
    return all_project

async def query_project_by_id(id: str):
    return await mongodb.projects.find_one({"_id": id})

async def delete_project(project_id: str): 
    response = await mongodb.projects.delete_one({"_id": project_id})
    return response

async def create_project(project): 
    new_project = await mongodb.projects.insert_one(project)
    created_project = await mongodb.projects.find_one({"_id": new_project.inserted_id})
    return created_project

async def update_project(id, project_update): 
    update_result = await mongodb.projects.update_one({"_id": id}, {"$set": project_update})

    if update_result.modified_count == 1:
        if (
            updated_project := await mongodb.projects.find_one({"_id": id})
        ) is not None:
            return updated_project