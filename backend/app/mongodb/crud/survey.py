from ..database import mongodb

def query_all_surveys_for_project_id(project_id: str): 
    all_survey = mongodb.surveys.find({"projectId": project_id}).to_list(100)
    return all_survey

async def delete_survey(survey_id: str): 
    response = await mongodb.surveys.delete_one({"_id": survey_id})
    return response

async def create_survey(survey): 
    new_survey = await mongodb.surveys.insert_one(survey)
    created_survey = await mongodb.surveys.find_one({"_id": new_survey.inserted_id})
    return created_survey

async def update_survey(id, survey_update): 
    update_result = await mongodb.surveys.update_one({"_id": id}, {"$set": survey_update})

    if update_result.modified_count == 1:
        if (
            updated_survey := await mongodb.surveys.find_one({"_id": id})
        ) is not None:
            return updated_survey