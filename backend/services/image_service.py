from transformers import pipeline
from PIL import Image, ExifTags, ImageChops, ImageFilter
import io
import numpy as np

print("Loading image detection model...")
image_classifier = pipeline(
    "image-classification",
    model="umm-maybe/AI-image-detector"
)
print("Image detection model loaded!")

def detect_image_type(image: Image.Image) -> str:
    """Classify image into photo, screenshot, document, illustration, graphic."""
    try:
        rgb = image.convert("RGB")
        small = rgb.resize((64, 64))
        pixels = np.array(small).reshape(-1, 3)
        unique_colors = len(set(map(tuple, pixels)))

        gray = image.convert("L")
        edges = gray.filter(ImageFilter.FIND_EDGES)
        edge_density = np.mean(np.array(edges)) / 255.0

        img_array = np.array(rgb).astype(float)
        std_per_channel = np.mean([
            np.std(img_array[:,:,0]),
            np.std(img_array[:,:,1]),
            np.std(img_array[:,:,2])
        ])

        if unique_colors < 800 and edge_density > 0.10:
            return "screenshot"
        if unique_colors < 1200 and std_per_channel < 30:
            return "document"
        if unique_colors < 2000 and std_per_channel > 60:
            return "graphic"
        if unique_colors > 2000 and std_per_channel < 40:
            return "illustration"
        return "photo"

    except Exception:
        return "photo"

def analyze_exif(image: Image.Image) -> dict:
    """EXIF forensics — software tag, date mismatch, camera metadata."""
    signals = []
    editing_software = None
    has_camera_metadata = False
    exif_present = False
    score = 0.0

    editing_apps = [
        "snapchat", "instagram", "lightroom", "photoshop",
        "vsco", "facetune", "snapseed", "picsart", "afterlight",
        "meitu", "b612", "retrica", "gimp", "pixlr", "canva"
    ]

    try:
        exif_raw = image._getexif()
        if exif_raw:
            exif_present = True
            exif = {ExifTags.TAGS.get(k, k): v for k, v in exif_raw.items()}

            if "Software" in exif:
                software = str(exif["Software"]).lower()
                editing_software = str(exif["Software"]).strip()
                for app in editing_apps:
                    if app in software:
                        score += 0.6
                        signals.append(f"Edited with: {editing_software}")
                        break

            if "Make" in exif or "Model" in exif:
                has_camera_metadata = True

            original_date = exif.get("DateTimeOriginal")
            modified_date = exif.get("DateTime")
            if original_date and modified_date and original_date != modified_date:
                score += 0.3
                signals.append("File modification date differs from capture date")
        else:
            signals.append("No EXIF metadata found")

    except Exception:
        pass

    return {
        "score": round(min(score, 1.0), 3),
        "exif_present": exif_present,
        "has_camera_metadata": has_camera_metadata,
        "editing_software": editing_software,
        "signals": signals
    }

def perform_ela(image: Image.Image, quality: int = 90) -> dict:
    """Error Level Analysis — detects recompressed or edited regions."""
    try:
        buffer = io.BytesIO()
        image.convert("RGB").save(buffer, format="JPEG", quality=quality)
        buffer.seek(0)
        compressed = Image.open(buffer).convert("RGB")

        ela_image = ImageChops.difference(image.convert("RGB"), compressed)
        ela_array = np.array(ela_image).astype(float)

        ela_mean = np.mean(ela_array)
        ela_std = np.std(ela_array)
        ela_max = np.max(ela_array)

        h, w = ela_array.shape[:2]
        block_size = max(h // 8, 1)
        block_stds = []
        for i in range(0, h - block_size, block_size):
            for j in range(0, w - block_size, block_size):
                block = ela_array[i:i+block_size, j:j+block_size]
                block_stds.append(np.std(block))

        regional_variance = np.std(block_stds) if block_stds else 0

        signals = []
        score = 0.0

        if ela_mean < 2.0 and ela_std < 3.0:
            score += 0.3
            signals.append("Uniform compression pattern detected")

        if regional_variance > 15:
            score += 0.35
            signals.append("Inconsistent compression regions detected")

        if ela_max > 100:
            score += 0.2
            signals.append("High error level in specific regions")

        return {
            "score": round(min(score, 1.0), 3),
            "ela_mean": round(ela_mean, 3),
            "ela_std": round(ela_std, 3),
            "ela_max": round(float(ela_max), 3),
            "regional_variance": round(regional_variance, 3),
            "signals": signals
        }
    except Exception as e:
        return {"score": 0.0, "signals": [], "error": str(e)}

def analyze_noise_pattern(image: Image.Image) -> dict:
    """Noise pattern analysis — AI images have unnaturally smooth noise."""
    try:
        gray = np.array(image.convert("L")).astype(float)
        smoothed = np.array(
            image.convert("L").filter(ImageFilter.GaussianBlur(radius=1))
        ).astype(float)
        noise = gray - smoothed

        noise_std = np.std(noise)

        h, w = noise.shape
        block_size = max(h // 8, 1)
        local_stds = []
        for i in range(0, h - block_size, block_size):
            for j in range(0, w - block_size, block_size):
                local_stds.append(np.std(noise[i:i+block_size, j:j+block_size]))

        noise_uniformity = 1.0 - (np.std(local_stds) / (np.mean(local_stds) + 1e-6))
        noise_uniformity = max(0.0, min(1.0, noise_uniformity))

        signals = []
        score = 0.0

        if noise_std < 3.0:
            score += 0.35
            signals.append("Unusually smooth noise pattern detected")
        elif noise_std < 5.0:
            score += 0.15
            signals.append("Low sensor noise detected")

        if noise_uniformity > 0.85:
            score += 0.30
            signals.append("Highly uniform noise structure detected")

        return {
            "score": round(min(score, 1.0), 3),
            "noise_std": round(noise_std, 3),
            "noise_uniformity": round(noise_uniformity, 3),
            "signals": signals
        }
    except Exception as e:
        return {"score": 0.0, "signals": [], "error": str(e)}

def get_beta_verdict(ai_score, forensic_score, is_edited,
                     editing_software, image_type) -> tuple:
    """
    Beta-safe verdict logic with softer language.
    Returns (verdict, verdict_color, explanation, confidence_note)
    """

    # Unsupported types
    if image_type in ["screenshot", "document"]:
        return (
            "Unsupported Image Type",
            "gray",
            f"Image detected as a {image_type}. AI detection works best on photos and illustrations.",
            "Image type not supported for reliable analysis."
        )

    # Known editing software
    if is_edited:
        return (
            "Real with Filter",
            "yellow",
            f"Image was processed with {editing_software}. Filters may affect detection accuracy.",
            "Filter or editing software detected in metadata."
        )

    # Strong AI signal
    if ai_score >= 0.75 and forensic_score >= 0.3:
        return (
            "Possible AI Generation Detected",
            "red",
            "Multiple signals suggest this image may be AI generated. "
            "Note: Image detection is in beta — results may not be accurate for all AI tools.",
            "High AI likelihood based on visual and forensic analysis."
        )

    if ai_score >= 0.75:
        return (
            "Possible AI Generation Detected",
            "red",
            "Visual analysis suggests this image may be AI generated. "
            "Note: Image detection is in beta — verify with additional tools.",
            "Based on visual pattern analysis only."
        )

    # Medium signal
    if ai_score >= 0.40:
        return (
            "Uncertain",
            "yellow",
            "Some AI-like features detected but results are inconclusive. "
            "Image detection is in beta — treat this result with caution.",
            "Insufficient signals for a confident verdict."
        )

    # Likely real
    return (
        "Likely Real",
        "green",
        "No strong signs of AI generation detected. "
        "Image appears to be a genuine photograph or artwork.",
        "Low AI likelihood based on available analysis."
    )

def detect_ai_image(file_bytes: bytes) -> dict:
    try:
        image = Image.open(io.BytesIO(file_bytes))
        rgb_image = image.convert("RGB")

        # Detect image type first
        image_type = detect_image_type(rgb_image)

        # Run AI model
        results = image_classifier(rgb_image)
        ai_score = 0.0
        real_score = 0.0
        for result in results:
            label = result["label"].lower()
            score = result["score"]
            if "artificial" in label or "ai" in label:
                ai_score = score
            else:
                real_score = score

        # Run forensic analysis
        exif_result = analyze_exif(image)
        ela_result = perform_ela(rgb_image)
        noise_result = analyze_noise_pattern(rgb_image)

        forensic_score = (
            exif_result["score"] * 0.40 +
            ela_result["score"] * 0.35 +
            noise_result["score"] * 0.25
        )

        is_edited = exif_result["editing_software"] is not None

        # Get beta verdict
        verdict, verdict_color, explanation, confidence_note = get_beta_verdict(
            ai_score, forensic_score, is_edited,
            exif_result["editing_software"], image_type
        )

        all_signals = (
            exif_result["signals"] +
            ela_result["signals"] +
            noise_result["signals"]
        )

        return {
            "verdict": verdict,
            "verdict_color": verdict_color,
            "confidence": round(ai_score * 100, 2),
            "ai_score": round(ai_score, 4),
            "real_score": round(real_score, 4),
            "image_type": image_type,
            "explanation": explanation,
            "confidence_note": confidence_note,
            "forensic_signals": [s for s in all_signals if s],
            "is_beta": True,
            "beta_message": "Image detection is in beta. Results may not be accurate for all AI-generated images. We are working on improving this feature.",
            "feedback_prompt": "Was this result correct? Your feedback helps us improve.",
            "disclaimer": "Results are probabilistic. Always apply human judgment."
        }

    except Exception as e:
        return {"error": str(e)}