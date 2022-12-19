from fastapi import APIRouter

router = APIRouter(
    prefix="/projects",
)

@router.get("/")
async def get_all_projects():
    return {}