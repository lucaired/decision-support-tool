from fastapi import APIRouter

router = APIRouter(
    prefix="/ifc",
)

@router.get("/")
async def get_result():
    return {}