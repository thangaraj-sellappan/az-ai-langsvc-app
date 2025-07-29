from fastapi.middleware.cors import CORSMiddleware

def add_cors_middleware(app):
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:5173"],  # Update with your frontend URL/port
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )