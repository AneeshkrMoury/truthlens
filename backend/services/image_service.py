from transformers import pipeline
from PIL import Image
import io

print("Loading image detection model...")
image_classifier = pipeline(
    "image-classification",
    model="umm-maybe/AI-image-detector"
)
print("Image detection model loaded!")

def detect_ai_image(file_bytes: bytes) -> dict:
    try:
        image = Image.open(io.BytesIO(file_bytes)).convert("RGB")
        results = image_classifier(image)

        ai_score = 0.0
        real_score = 0.0

        for result in results:
            label = result["label"].lower()
            score = result["score"]
            if "artificial" in label or "ai" in label:
                ai_score = score
            else:
                real_score = score

        confidence = round(ai_score * 100, 2)

        # Three tier verdict logic
        if ai_score < 0.40:
            verdict = "Likely Real"
            verdict_color = "green"
        elif ai_score < 0.70:
            verdict = "Uncertain"
            verdict_color = "yellow"
        else:
            verdict = "Likely AI Generated"
            verdict_color = "red"

        return {
            "verdict": verdict,
            "verdict_color": verdict_color,
            "confidence": confidence,
            "ai_score": round(ai_score, 4),
            "real_score": round(real_score, 4),
            "disclaimer": "Results are probabilistic. Always apply human judgment."
        }

    except Exception as e:
        return {"error": str(e)}