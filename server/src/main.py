from fastapi import FastAPI
from src.middleware.cors import add_cors_middleware
from src.api.default import router as app_routers

print("FastAPI application is starting...")

app = FastAPI()

add_cors_middleware(app)

app.include_router(app_routers)

print("FastAPI application is running...")