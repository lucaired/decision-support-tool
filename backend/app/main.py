from fastapi import FastAPI

from .routers import ifc, project, survey

app = FastAPI()

app.include_router(ifc.router)
app.include_router(project.router)
app.include_router(survey.router)