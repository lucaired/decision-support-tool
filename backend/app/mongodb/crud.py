from .database import mongodb

def query_all_surveys_for_project_id(project_id: str): 
    surveys = mongodb.surveys
    return surveys.find({"_id": project_id})

async def create_survey(survey): 
    new_survey = await mongodb.surveys.insert_one(survey)
    created_survey = await mongodb.surveys.find_one({"_id": new_survey.inserted_id})
    return created_survey

def update_survey(survey_update): 
    surveys = mongodb.surveys
    query = {"_id": survey_update._id}
    return surveys.update_one(query, { "$set": survey_update })