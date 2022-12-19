from fastapi import APIRouter,  BackgroundTasks, UploadFile, status
from tempfile import SpooledTemporaryFile, NamedTemporaryFile

from app.transform_ifc import run


router = APIRouter(
    prefix="/ifc",
)

def transform_ifc_to_neo4j(file: SpooledTemporaryFile, file_name: str):
    named_temp_file = NamedTemporaryFile()
    content = file.read()
    named_temp_file.write(content)
    try:
        run(named_temp_file.name, file_name)
    except Exception as e:
        print(e)
    named_temp_file.close()
    file.close()

@router.post("/transform/", status_code=status.HTTP_202_ACCEPTED)
async def handle_ifc_for_transformation(file: UploadFile, background_tasks: BackgroundTasks):
    background_tasks.add_task(transform_ifc_to_neo4j, file.file, file.filename)
    return {"message": "Accepted for processing"}