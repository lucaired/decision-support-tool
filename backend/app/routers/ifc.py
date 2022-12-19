from fastapi import APIRouter, UploadFile

router = APIRouter(
    prefix="/ifc",
)

@router.post("/transform/")
async def handle_ifc_for_transformation(file: UploadFile):
    return {"filename": file.filename}