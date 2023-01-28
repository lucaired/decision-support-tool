from fastapi import APIRouter,  BackgroundTasks, UploadFile, status, File
from tempfile import SpooledTemporaryFile, NamedTemporaryFile


router = APIRouter(
    prefix="/ifc",
)

def transform_ifc_to_neo4j(file: SpooledTemporaryFile, file_name: str):
    from app.transform_ifc import run
    named_temp_file = NamedTemporaryFile()
    content = file.read()
    named_temp_file.write(content)
    try:
        #pass
        run(named_temp_file.name, file_name)
        # TODO: send notification
    except Exception as e:
        # TODO: send notification
        print(e)
    named_temp_file.close()
    file.close()

@router.post("/transform/", status_code=status.HTTP_202_ACCEPTED)
async def handle_ifc_for_transformation(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    background_tasks.add_task(transform_ifc_to_neo4j, file.file, file.filename)
    return {"message": "Accepted for processing"}