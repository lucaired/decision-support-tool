from fastapi import APIRouter

router = APIRouter(
    prefix="/surveys",
)

@router.get("/")
async def get_all_surveys():
    return {}