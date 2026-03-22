from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Form
from services.image_service import detect_ai_image
from services.text_service import detect_ai_text

app = FastAPI(
    title="TruthLens API",
    description="AI-generated content detection platform",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"status": "TruthLens API is running"}

@app.get("/health")
def health():
    return {"status": "healthy", "version": "1.0.0"}

@app.post("/detect/image")
async def detect_image(file: UploadFile = File(...)):
    contents = await file.read()
    result = detect_ai_image(contents)
    return {
        "filename": file.filename,
        "content_type": file.content_type,
        "result": result
    }

@app.post("/detect/text")
async def detect_text(text: str = Form(...)):
    result = detect_ai_text(text)
    return {
        "characters": len(text),
        "result": result
    }
