# TruthLens 🔍
### AI-Generated Content Detection Platform

> Detect AI-generated text and images instantly — with sentence-level analysis and forensic inspection. Free. No sign-up required.

**Live Demo:** [truthlens-fawn.vercel.app](https://truthlens-fawn.vercel.app)

---

## What is TruthLens?

TruthLens is a free, public-facing AI-generated content detection platform built for the general public — not just researchers or developers. Whether you're a student, journalist, educator, or curious reader, TruthLens helps you verify whether text or images were created by an AI tool.

Unlike other tools, TruthLens provides **sentence-level analysis** so you can see exactly which parts of a text are likely AI-written — not just a single score for the whole document.

---

## Features

### Text Detection
- Detects output from ChatGPT, Claude, Gemini, Llama, and other modern LLMs
- **Sentence-level highlighting** — green (human), yellow (mixed), red (AI)
- Powered by a fine-tuned DeBERTa-v3 model with 90%+ accuracy
- Perplexity and burstiness analysis for additional signal
- Word count and character count with quality guidance

### Image Detection *(Beta)*
- **EXIF Metadata Forensics** — detects editing software traces and date mismatches
- **Error Level Analysis (ELA)** — based on Krawetz (2007), detects recompressed or edited regions
- **Noise Pattern Analysis** — AI images have unnaturally smooth and structured noise
- **Image Type Detection** — automatically identifies photos, illustrations, screenshots, and documents
- Filter detection — distinguishes "Real with Filter" from "AI Generated"
- Feedback system for continuous improvement

### Platform
- Dark/light mode toggle
- Mobile responsive design
- Loading animation with lens effect
- Word count warning for short texts
- About and Contact modals
- Informational sections: What is TruthLens, How it works, Who is it for, FAQ
- Google Analytics 4 integration with custom event tracking

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Backend | FastAPI (Python) |
| Text Detection | DeBERTa-v3 (desklib/ai-text-detector-v1.01) |
| Image Detection | ViT (umm-maybe/AI-image-detector) + Custom Forensics |
| ML Framework | PyTorch, Hugging Face Transformers |
| Frontend Hosting | Vercel |
| Backend Hosting | Hugging Face Spaces (Docker) |
| Analytics | Google Analytics 4 |
| Version Control | GitHub |

---

## Project Structure

```
truthlens/
├── frontend/                  # Next.js app
│   ├── app/
│   │   ├── page.tsx           # Main UI with detection interface
│   │   ├── layout.tsx         # Root layout with GA4
│   │   └── globals.css
│   ├── public/
│   └── package.json
│
├── backend/                   # FastAPI server
│   ├── main.py                # API routes
│   ├── services/
│   │   ├── image_service.py   # Image detection + forensic analysis
│   │   └── text_service.py    # Text detection with sentence scoring
│   ├── routers/
│   ├── models/
│   ├── requirements.txt
│   └── Dockerfile
│
├── ml/
│   ├── image_detection/
│   └── text_detection/
│
└── docs/
    └── TruthLens_SRS.docx     # Software Requirements Specification
```

---

## Running Locally

### Prerequisites
- Node.js 20+
- Python 3.11+
- Git

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:3000`

### Backend Setup

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload
```

Backend runs at `http://localhost:8000`

> **Note:** First run will download ML models (~2GB). This may take a few minutes.

### API Documentation

Once backend is running visit `http://localhost:8000/docs` for interactive API docs.

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Health check |
| GET | `/health` | Version and status |
| POST | `/detect/image` | Analyze uploaded image |
| POST | `/detect/text` | Analyze pasted text |

### Example — Text Detection

```bash
curl -X POST "http://localhost:8000/detect/text" \
  -F "text=Paste your text here for analysis"
```

Response:
```json
{
  "characters": 350,
  "result": {
    "verdict": "Likely AI Written",
    "verdict_color": "red",
    "confidence": 94.2,
    "ai_score": 0.942,
    "real_score": 0.058,
    "sentences": [
      {
        "sentence": "Example sentence here.",
        "ai_score": 0.91,
        "label": "ai",
        "color": "red"
      }
    ],
    "disclaimer": "Results are probabilistic. Always apply human judgment."
  }
}
```

---

## Detection Methodology

### Text Detection
TruthLens uses a fine-tuned **DeBERTa-v3-large** model (desklib/ai-text-detector-v1.01) which ranks #1 on the RAID Benchmark for AI text detection. The model analyzes structural signals including:
- Token probability distributions
- Sentence uniformity patterns
- Writing style consistency

Each sentence is scored independently to provide granular highlighting.

### Image Detection *(Beta)*
Three research-backed forensic methods are combined:

1. **EXIF Metadata Analysis** — based on forensic methodology by Lee et al. (2023). Checks software tags, camera metadata presence, and date consistency.

2. **Error Level Analysis** — based on Krawetz (2007). Detects recompressed or locally edited image regions by analyzing JPEG compression artifacts.

3. **Noise Pattern Analysis** — Real camera sensors produce stochastic (random) noise. AI-generated images have unnaturally smooth and structured noise patterns.

> Image detection is in beta. The base classification model struggles with modern AI image generators. A custom-trained model is planned for v2.

---

## Roadmap

### v0.1 — Current (MVP)
- [x] Text detection with sentence highlighting
- [x] Image detection with forensic analysis (beta)
- [x] Full frontend UI with dark mode
- [x] Deployed on Vercel + Hugging Face Spaces
- [x] Google Analytics integration

### v0.2 — Next
- [ ] Document detection (PDF / DOCX tampering)
- [ ] Better image detection model
- [ ] User accounts and check history
- [ ] Shareable result links
- [ ] API access for developers

### v1.0 — Future
- [ ] Custom trained text detection model
- [ ] Video deepfake detection
- [ ] Browser extension
- [ ] Multilingual support (Hindi first)
- [ ] Pro tier with unlimited checks

---

## Known Limitations

- **Image detection** is in beta and may not accurately detect modern AI-generated images (Midjourney v6, DALL-E 3, Stable Diffusion XL)
- **Text detection** accuracy decreases for very short texts (under 50 words)
- **Snapchat/Instagram filtered photos** may be incorrectly flagged — filter detection is included to mitigate this
- **HF Spaces free tier** may cause a 30-60 second cold start if the backend hasn't been used recently

---

## Contributing

TruthLens is currently a solo project but contributions are welcome.

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## Contact

Built by **Aneesh Kumar Mourya** — BSc IT, Amity University

- Portfolio: [aneeshkrmoury.github.io](https://aneeshkrmoury.github.io)
- GitHub: [github.com/AneeshkrMoury](https://github.com/AneeshkrMoury)

---

## Disclaimer

TruthLens results are probabilistic and should not be treated as definitive. Detection accuracy varies by content type and length. Always apply human judgment when interpreting results. TruthLens should not be used as the sole basis for any accusation, legal decision, or disciplinary action.

---

## License

MIT License — feel free to use, modify, and distribute.

---

*TruthLens v0.1 Beta — Built with 💙 by a solo developer*