from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.matches import router as matches_router
from app.core.config import settings

app = FastAPI(title=settings.APP_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health", tags=["health"])
def health_check():
    return {
        "status": "ok",
        "environment": settings.ENVIRONMENT,
        "app": settings.APP_NAME,
    }

app.include_router(matches_router)