# AADHIRAI - Civic Eye YOLOv8 Pothole & Garbage Detection Microservice

This microservice provides automated, real pretrained object detection and AI-estimated severity classification for citizen complaints in the **AADHIRAI Smart Citizen Complaint Management System**.

---

## 1. Model Overview
- **Model**: Civic Eye Pothole & Garbage Detection (YOLOv8)
- **Hugging Face Repository**: [`tanmay9132/civic-eye-pothole-garbage`](https://huggingface.co/tanmay9132/civic-eye-pothole-garbage)
- **Weights File**: `ml_service/models/best.pt` (109.1 MB)
- **Supported Detection Classes**:
  1. `Potholes` (mapped to `Potholes and damaged roads` / PWD department)
  2. `Garbage` (mapped to `Garbage and illegal dumping` / SAN department)
- **Scope Notice**:
  This model specifically detects and localizes **Potholes** and **Garbage Dumps**. Unrelated images (selfies, documents, indoor objects, food, pets) or unsupported civic issues (streetlights, drainage, water leakage) yield zero detections and are flagged as unsupported.

---

## 2. API Endpoints

### `GET /health`
Returns model status, loaded weights, device (CPU/GPU), and supported classes.

### `POST /verify-image`
Takes image data (base64 string or Data URL), runs real YOLOv8 inference, computes bounding boxes, and calculates severity and AI-estimated priority.

**Response Structure (Valid Defect):**
```json
{
  "success": true,
  "isValidCivicIssue": true,
  "supported": true,
  "category": "Potholes and damaged roads",
  "severity": "HIGH",
  "priority": "HIGH",
  "isAiEstimated": true,
  "confidence": 0.517,
  "departmentCode": "PWD",
  "departmentName": "Public Works & Roads (PWD)",
  "detectedIssue": "Verified Road Pothole (1 detected)",
  "explanation": "Civic Eye YOLOv8 detected 1 road pothole(s) covering 15.2% of image area with 51.7% model confidence.",
  "recommendedAction": "Dispatch PWD road maintenance squad with hot-mix bitumen patching material and vibratory compactor.",
  "boundingBoxes": [
    {
      "label": "Potholes",
      "confidence": 0.517,
      "box": [185.5, 185.4, 440.6, 369.1],
      "area_ratio": 0.1525
    }
  ],
  "isLowConfidence": false,
  "requiresManualReview": false,
  "modelVersion": "Civic-Eye-YOLOv8-tanmay9132",
  "aiProvider": "Civic Eye YOLOv8 (Hugging Face tanmay9132)"
}
```

**Response Structure (Invalid / Unsupported Image):**
```json
{
  "success": true,
  "isValidCivicIssue": false,
  "supported": false,
  "category": "Unknown / unrecognized",
  "message": "Invalid or unsupported civic issue image. Please upload a relevant image.",
  "explanation": "No pothole or garbage defect was detected by the Civic Eye YOLOv8 AI model.",
  "recommendedAction": "Please upload a clear, on-site photograph of a road pothole or municipal garbage dump.",
  "boundingBoxes": []
}
```

---

## 3. How to Run Locally

### Step 1: Install Requirements
```bash
pip install -r ml_service/requirements.txt
```

### Step 2: Download Weights (if not already downloaded)
```bash
python ml_service/download_model.py
```

### Step 3: Start FastAPI Inference Server
```bash
python ml_service/app.py
```
The server starts on `http://127.0.0.1:8000`.

---

## 4. Production Deployment

To host this Python ML service on a cloud provider (e.g. Render, Railway, AWS EC2, or DigitalOcean):
1. Create a `Dockerfile`:
   ```dockerfile
   FROM python:3.11-slim
   WORKDIR /app
   RUN apt-get update && apt-get install -y libgl1 libglib2.0-0
   COPY requirements.txt .
   RUN pip install --no-cache-dir -r requirements.txt
   COPY . .
   RUN python download_model.py
   EXPOSE 8000
   CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
   ```
2. Set the `ML_SERVICE_URL` in your Node.js backend `.env`:
   ```env
   ML_SERVICE_URL=https://your-ml-service.onrender.com/verify-image
   ```
