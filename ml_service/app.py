"""
AADHIRAI Machine Learning Microservice
FastAPI Inference Server for Civic Eye Pothole & Garbage Detection (YOLOv8)
Model: https://huggingface.co/tanmay9132/civic-eye-pothole-garbage
"""

import io
import base64
import os
from typing import Optional, List
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from PIL import Image
from ultralytics import YOLO

app = FastAPI(
    title="AADHIRAI Civic Eye YOLOv8 ML Service",
    description="Real pretrained YOLOv8 inference for Potholes and Garbage Detection & Severity Triage",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_PATH = os.path.join(os.path.dirname(__file__), "models", "best.pt")
print(f"[YOLOv8] Loading Civic Eye model from {MODEL_PATH}...")
model = YOLO(MODEL_PATH)
print(f"[YOLOv8] Model loaded successfully! Task: {model.task}, Classes: {model.names}")

class ImagePayload(BaseModel):
    image: str  # Base64 string or Data URL
    hintCategory: Optional[str] = ""
    userNotes: Optional[str] = ""

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "AADHIRAI Civic Eye YOLOv8 Service",
        "model": "Civic-Eye-YOLOv8-tanmay9132",
        "supported_classes": list(model.names.values()),
        "task": model.task,
        "device": str(model.device)
    }

@app.post("/verify-image")
def verify_image(payload: ImagePayload):
    try:
        raw_image_data = payload.image
        if not raw_image_data:
            raise HTTPException(status_code=400, detail="Image data is required")

        # Strip Data URL prefix if present
        if raw_image_data.startswith("data:"):
            raw_image_data = raw_image_data.split(",")[1]

        image_bytes = base64.b64decode(raw_image_data)
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        img_w, img_h = image.size

        if img_w < 30 or img_h < 30:
            return {
                "success": True,
                "isValidCivicIssue": False,
                "supported": False,
                "category": "Unknown / unrecognized",
                "severity": "LOW",
                "priority": "LOW",
                "confidence": 1.0,
                "detectedIssue": "Invalid Image Dimensions",
                "message": "Invalid or unsupported civic issue image. Please upload a relevant image.",
                "explanation": "Image resolution is too low or corrupted to identify civic infrastructure.",
                "recommendedAction": "Please upload a clear, higher-resolution photo.",
                "boundingBoxes": [],
                "isLowConfidence": False,
                "requiresManualReview": False,
                "aiProvider": "Civic Eye YOLOv8 (Hugging Face tanmay9132)"
            }

        # Run real YOLOv8 inference
        results = model(image, conf=0.20, verbose=False)
        result = results[0]

        detected_boxes = []
        pothole_count = 0
        garbage_count = 0
        total_defect_area = 0.0

        for box in result.boxes:
            cls_id = int(box.cls[0])
            conf = float(box.conf[0])
            label = model.names.get(cls_id, f"class_{cls_id}")
            x1, y1, x2, y2 = [float(c) for c in box.xyxy[0]]
            
            box_w = max(0.0, x2 - x1)
            box_h = max(0.0, y2 - y1)
            box_area = box_w * box_h
            total_defect_area += box_area

            if "pothole" in label.lower():
                pothole_count += 1
            elif "garbage" in label.lower():
                garbage_count += 1

            detected_boxes.append({
                "label": label,
                "confidence": round(conf, 3),
                "box": [round(x1, 1), round(y1, 1), round(x2, 1), round(y2, 1)],
                "area_ratio": round(box_area / (img_w * img_h), 4)
            })

        # Sort detected boxes by confidence descending
        detected_boxes.sort(key=lambda b: b["confidence"], reverse=True)

        # IF NO CIVIC DEFECT (POTHOLE OR GARBAGE) DETECTED:
        if len(detected_boxes) == 0:
            return {
                "success": True,
                "isValidCivicIssue": False,
                "supported": False,
                "category": "Unknown / unrecognized",
                "severity": "LOW",
                "priority": "LOW",
                "confidence": 0.95,
                "detectedIssue": "Invalid or Unsupported Civic Issue",
                "message": "Invalid or unsupported civic issue image. Please upload a relevant image.",
                "explanation": "No pothole or garbage defect was detected by the Civic Eye YOLOv8 AI model. Note: This model is specifically trained for Potholes and Garbage detection. Other categories (streetlights, drainage, water leakage) or unrelated photos (selfies, documents, food, pets) are invalid or unsupported.",
                "recommendedAction": "Please upload a clear, on-site photograph of a road pothole or municipal garbage dump.",
                "boundingBoxes": [],
                "isLowConfidence": True,
                "requiresManualReview": True,
                "modelVersion": "Civic-Eye-YOLOv8-tanmay9132",
                "aiProvider": "Civic Eye YOLOv8 (Hugging Face tanmay9132)"
            }

        # VALID DEFECT DETECTED:
        img_area = float(img_w * img_h)
        total_area_ratio = total_defect_area / img_area
        max_conf = detected_boxes[0]["confidence"]

        # Primary category determination
        if pothole_count >= garbage_count:
            primary_label = "Potholes and damaged roads"
            dept_code = "PWD"
            dept_name = "Public Works & Roads (PWD)"
            issue_en = f"Verified Road Pothole ({pothole_count} detected)"
            issue_ta = f"சரிபார்க்கப்பட்ட சாலை குழி ({pothole_count} கண்டறியப்பட்டது)"

            # Estimate Priority & Severity based on damage area and confidence
            if total_area_ratio > 0.20 or (max_conf > 0.80 and total_area_ratio > 0.12):
                severity = "CRITICAL"
                priority = "CRITICAL"
                urgency_note = "Obvious immediate danger to two-wheelers and night traffic. Poses severe collision and rollover hazard."
            elif total_area_ratio > 0.07 or max_conf > 0.65:
                severity = "HIGH"
                priority = "HIGH"
                urgency_note = "Significant asphalt surface depression causing vehicular disruption."
            elif total_area_ratio > 0.02 or max_conf > 0.40:
                severity = "MEDIUM"
                priority = "MEDIUM"
                urgency_note = "Moderate road wear requiring timely bituminous patching."
            else:
                severity = "LOW"
                priority = "LOW"
                urgency_note = "Minor road surface abrasion with low immediate risk."

            explanation = (
                f"Civic Eye YOLOv8 detected {pothole_count} road pothole(s) covering "
                f"{total_area_ratio * 100:.1f}% of image area with {max_conf * 100:.1f}% model confidence. {urgency_note}"
            )
            rec_action = (
                "Dispatch PWD road maintenance squad with hot-mix bitumen patching material "
                "and vibratory compactor for immediate resurfacing."
            )
            stmt_en = (
                f"Civic Eye AI verified {pothole_count} asphalt road pothole(s) at location. "
                f"Model confidence: {max_conf * 100:.1f}%. Priority: {priority} (AI-estimated, pending staff review)."
            )
            stmt_ta = (
                f"Civic Eye AI மூலம் {pothole_count} சாலை குழிகள் உறுதிப்படுத்தப்பட்டுள்ளது. "
                f"துல்லியம்: {max_conf * 100:.1f}%. முன்னுரிமை: {priority} (AI-மதிப்பீடு)."
            )

        else:
            primary_label = "Garbage and illegal dumping"
            dept_code = "SAN"
            dept_name = "Sanitation & Waste Management (SAN)"
            issue_en = f"Verified Solid Waste Accumulation ({garbage_count} detected)"
            issue_ta = f"சரிபார்க்கப்பட்ட குப்பைக் கழிவுகள் ({garbage_count} கண்டறியப்பட்டது)"

            if total_area_ratio > 0.25 or (max_conf > 0.80 and total_area_ratio > 0.15):
                severity = "CRITICAL"
                priority = "CRITICAL"
                urgency_note = "Massive uncollected garbage accumulation blocking pedestrian passage and creating severe public health emergency."
            elif total_area_ratio > 0.10 or max_conf > 0.70:
                severity = "HIGH"
                priority = "HIGH"
                urgency_note = "Substantial solid waste accumulation generating odor and attracting vector breeding."
            elif total_area_ratio > 0.03 or max_conf > 0.45:
                severity = "MEDIUM"
                priority = "MEDIUM"
                urgency_note = "Overflowing community waste receptacle requiring scheduled evacuation."
            else:
                severity = "LOW"
                priority = "LOW"
                urgency_note = "Minor scattered litter requiring municipal broom sweeping."

            explanation = (
                f"Civic Eye YOLOv8 detected {garbage_count} garbage waste cluster(s) covering "
                f"{total_area_ratio * 100:.1f}% of image area with {max_conf * 100:.1f}% model confidence. {urgency_note}"
            )
            rec_action = (
                "Deploy mechanized solid waste compactor vehicle to clear dump site, "
                "followed by disinfectant and bleaching powder sanitation spray."
            )
            stmt_en = (
                f"Civic Eye AI verified {garbage_count} uncollected solid waste cluster(s). "
                f"Model confidence: {max_conf * 100:.1f}%. Priority: {priority} (AI-estimated, pending staff review)."
            )
            stmt_ta = (
                f"Civic Eye AI மூலம் {garbage_count} குப்பைக் கழிவு குவியல்கள் உறுதிப்படுத்தப்பட்டுள்ளது. "
                f"துல்லியம்: {max_conf * 100:.1f}%. முன்னுரிமை: {priority} (AI-மதிப்பீடு)."
            )

        is_low_conf = max_conf < 0.45

        return {
            "success": True,
            "isValidCivicIssue": True,
            "supported": True,
            "category": primary_label,
            "severity": severity,
            "priority": priority,
            "isAiEstimated": True,
            "confidence": round(max_conf, 3),
            "departmentCode": dept_code,
            "departmentName": dept_name,
            "detectedIssue": issue_en,
            "detectedIssueTa": issue_ta,
            "explanation": explanation,
            "recommendedAction": rec_action,
            "statementEn": stmt_en,
            "statementTa": stmt_ta,
            "boundingBoxes": detected_boxes,
            "isLowConfidence": is_low_conf,
            "requiresManualReview": is_low_conf,
            "modelVersion": "Civic-Eye-YOLOv8-tanmay9132",
            "aiProvider": "Civic Eye YOLOv8 (Hugging Face tanmay9132)"
        }

    except Exception as e:
        print(f"[YOLOv8 Error] {e}")
        raise HTTPException(status_code=400, detail=f"Image processing failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
