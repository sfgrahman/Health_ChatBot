from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config.settings import get_settings

from routes import user
from routes import gpt
from models import user as user_models
from config.database import engine

settings = get_settings()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# You can add additional URLs to this list, for example, the frontend's production domain, or other frontends.
# allowed_origins = [
#     "http://localhost:3000"
# ]
origins = [
    "*"
] 
    
def create_application():
    application = FastAPI(title=settings.PROJECT_NAME)
    application.include_router(user.user_router)
    application.include_router(user.guest_router)
    application.include_router(user.auth_router)
    application.include_router(gpt.gpt_router)
    
    return application


app = create_application()

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=allowed_origins,
#     allow_credentials=True,
#     allow_methods=["GET", "POST", "PUT", "DELETE"],
#     allow_headers=["X-Requested-With", "Content-Type"],
# )

user_models.Base.metadata.create_all(engine)

@app.get("/")
async def root():
    return {"message": "Running!"}