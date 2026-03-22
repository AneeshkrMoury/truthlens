import torch
from transformers import GPT2LMHeadModel, GPT2TokenizerFast
import numpy as np

print("Loading text detection model...")
tokenizer = GPT2TokenizerFast.from_pretrained("gpt2")
model = GPT2LMHeadModel.from_pretrained("gpt2")
model.eval()
print("Text detection model loaded!")

def calculate_perplexity(text: str) -> float:
    encodings = tokenizer(text, return_tensors="pt", truncation=True, max_length=512)
    input_ids = encodings.input_ids

    with torch.no_grad():
        outputs = model(input_ids, labels=input_ids)
        loss = outputs.loss

    return torch.exp(loss).item()

def calculate_burstiness(text: str) -> float:
    sentences = [s.strip() for s in text.replace("!", ".").replace("?", ".").split(".") if len(s.strip()) > 10]
    if len(sentences) < 3:
        return 0.0
    lengths = [len(s.split()) for s in sentences]
    mean = np.mean(lengths)
    std = np.std(lengths)
    if mean == 0:
        return 0.0
    return std / mean

def detect_ai_text(text: str) -> dict:
    try:
        if len(text.strip()) < 100:
            return {
                "error": "Text too short. Please provide at least 100 characters for accurate detection."
            }

        perplexity = calculate_perplexity(text)
        burstiness = calculate_burstiness(text)

        # Perplexity scoring
        # AI text typically has perplexity < 30
        # Human text typically has perplexity > 50
        if perplexity < 20:
            perplexity_ai_score = 0.95
        elif perplexity < 30:
            perplexity_ai_score = 0.85
        elif perplexity < 45:
            perplexity_ai_score = 0.65
        elif perplexity < 60:
            perplexity_ai_score = 0.40
        elif perplexity < 80:
            perplexity_ai_score = 0.20
        else:
            perplexity_ai_score = 0.10

        # Burstiness scoring
        # AI text is uniform (low burstiness < 0.3)
        # Human text varies more (burstiness > 0.5)
        if burstiness < 0.2:
            burstiness_ai_score = 0.90
        elif burstiness < 0.35:
            burstiness_ai_score = 0.70
        elif burstiness < 0.50:
            burstiness_ai_score = 0.45
        elif burstiness < 0.70:
            burstiness_ai_score = 0.25
        else:
            burstiness_ai_score = 0.10

        # Combined score — perplexity weighted more heavily
        ai_score = (perplexity_ai_score * 0.65) + (burstiness_ai_score * 0.35)
        real_score = 1 - ai_score
        confidence = round(ai_score * 100, 2)

        # Three tier verdict
        if ai_score < 0.40:
            verdict = "Likely Human Written"
            verdict_color = "green"
        elif ai_score < 0.70:
            verdict = "Uncertain — May Contain AI"
            verdict_color = "yellow"
        else:
            verdict = "Likely AI Written"
            verdict_color = "red"

        return {
            "verdict": verdict,
            "verdict_color": verdict_color,
            "confidence": confidence,
            "ai_score": round(ai_score, 4),
            "real_score": round(real_score, 4),
            "signals": {
                "perplexity": round(perplexity, 2),
                "burstiness": round(burstiness, 4),
                "perplexity_note": "Lower = more AI-like",
                "burstiness_note": "Lower = more uniform = more AI-like"
            },
            "characters_analyzed": len(text[:512]),
            "disclaimer": "Results are probabilistic. Always apply human judgment."
        }

    except Exception as e:
        return {"error": str(e)}