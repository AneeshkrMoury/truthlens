import torch
import torch.nn as nn
from transformers import AutoTokenizer, AutoConfig, AutoModel, PreTrainedModel
import re

class DesklibAIDetectionModel(PreTrainedModel):
    config_class = AutoConfig
    _tied_weights_keys = []

    def __init__(self, config):
        super().__init__(config)
        self.model = AutoModel.from_config(config)
        self.classifier = nn.Linear(config.hidden_size, 1)
        self.init_weights()

    @property
    def all_tied_weights_keys(self):
        return {}

    def forward(self, input_ids, attention_mask=None, labels=None):
        outputs = self.model(input_ids, attention_mask=attention_mask)
        last_hidden_state = outputs[0]
        input_mask_expanded = attention_mask.unsqueeze(-1).expand(last_hidden_state.size()).float()
        sum_embeddings = torch.sum(last_hidden_state * input_mask_expanded, dim=1)
        sum_mask = torch.clamp(input_mask_expanded.sum(dim=1), min=1e-9)
        pooled_output = sum_embeddings / sum_mask
        logits = self.classifier(pooled_output)
        loss = None
        if labels is not None:
            loss_fct = nn.BCEWithLogitsLoss()
            loss = loss_fct(logits.view(-1), labels.float())
        output = {"logits": logits}
        if loss is not None:
            output["loss"] = loss
        return output

print("Loading text detection model...")
MODEL_NAME = "desklib/ai-text-detector-v1.01"
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = DesklibAIDetectionModel.from_pretrained(MODEL_NAME)
model.to(device)
model.eval()
print("Text detection model loaded!")

def predict_text(text: str, max_len: int = 768) -> float:
    encoded = tokenizer(
        text,
        padding="max_length",
        truncation=True,
        max_length=max_len,
        return_tensors="pt"
    )
    input_ids = encoded["input_ids"].to(device)
    attention_mask = encoded["attention_mask"].to(device)
    with torch.no_grad():
        outputs = model(input_ids=input_ids, attention_mask=attention_mask)
        probability = torch.sigmoid(outputs["logits"]).item()
    return round(probability, 4)

def get_verdict(ai_score: float) -> tuple:
    if ai_score < 0.40:
        return "Likely Human Written", "green"
    elif ai_score < 0.70:
        return "Uncertain - May Contain AI", "yellow"
    else:
        return "Likely AI Written", "red"

def split_sentences(text: str) -> list:
    sentences = re.split(r'(?<=[.!?])\s+', text.strip())
    return [s.strip() for s in sentences if len(s.strip()) > 20]

def detect_ai_text(text: str) -> dict:
    try:
        if len(text.strip()) < 100:
            return {
                "error": "Text too short. Please provide at least 100 characters."
            }

        ai_score = predict_text(text)
        real_score = 1 - ai_score
        confidence = round(ai_score * 100, 2)
        verdict, verdict_color = get_verdict(ai_score)

        sentences = split_sentences(text)
        sentence_results = []
        for sentence in sentences:
            score = predict_text(sentence)
            if score < 0.40:
                label = "human"
                color = "green"
            elif score < 0.70:
                label = "mixed"
                color = "yellow"
            else:
                label = "ai"
                color = "red"
            sentence_results.append({
                "sentence": sentence,
                "ai_score": score,
                "label": label,
                "color": color
            })

        return {
            "verdict": verdict,
            "verdict_color": verdict_color,
            "confidence": confidence,
            "ai_score": round(ai_score, 4),
            "real_score": round(real_score, 4),
            "sentences": sentence_results,
            "characters_analyzed": len(text[:768]),
            "disclaimer": "Results are probabilistic. Always apply human judgment."
        }

    except Exception as e:
        return {"error": str(e)}