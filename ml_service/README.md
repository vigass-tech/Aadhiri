# AADHIRAI - MobileNetV3 Civic Issue Image Verification Microservice

This microservice provides automated image verification and multi-task severity classification for citizen complaints in the **AADHIRAI Smart Citizen Complaint Management System**.

---

## 1. Architecture Overview
- **Backbone**: MobileNetV3-Small (`torchvision.models.mobilenet_v3_small`)
- **Dual-Task Multi-Head Architecture**:
  1. **Category Classification Head**: 10 classes (9 civic categories + 1 non-civic rejection class)
  2. **Severity Classification Head**: 4 levels (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`)
- **Input Dimensions**: 224x224 RGB, normalized with ImageNet statistics (`mean=[0.485, 0.456, 0.406]`, `std=[0.229, 0.224, 0.225]`)

---

## 2. Recognized Classes

### A. Civic Categories (9 Classes)
1. `Potholes and damaged roads`
2. `Garbage and illegal dumping`
3. `Overflowing drainage and sewage`
4. `Water leakage and waterlogging`
5. `Damaged streetlights`
6. `Broken public infrastructure`
7. `Fallen trees and road obstructions`
8. `Other civic issues`
9. `Unknown / unrecognized`

### B. Invalid / Non-Civic Classes (Rejected)
- Selfies and human portraits
- Animals and domestic pets
- Food, beverages, indoor kitchen items
- Random nature scenery without public infrastructure defects
- Screenshots, invoices, receipts, and text documents
- Blurry, pitch-black, or unusable images

### C. Severity Triage Levels
- **`LOW`**: Minor issue, no immediate danger
- **`MEDIUM`**: Needs attention but not urgent
- **`HIGH`**: Significant damage, possible vehicular or public safety risk
- **`CRITICAL`**: Immediate danger to people or public safety (live wires, open manholes, major pipe bursts)

---

## 3. Setup and Training Instructions

### Step 1: Install Requirements
```bash
cd ml_service
pip install -r requirements.txt
```

### Step 2: Run Training & Evaluation
```bash
python train_mobilenetv3.py
```
This script will:
- Partition the dataset into **70% Training**, **15% Validation**, and **15% Testing** sets.
- Apply data augmentations (random horizontal flip, rotation, color jitter).
- Fine-tune MobileNetV3 with dual cross-entropy loss.
- Output **Accuracy**, **Weighted Precision**, **Weighted Recall**, **F1-Score**, and the complete **Confusion Matrix**.
- Save the trained weights to `models/mobilenetv3_civic.pth`.

### Step 3: Run FastAPI Microservice
```bash
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```
API Docs available at: `http://localhost:8000/docs`

---

## 4. Production MERN Integration
The AADHIRAI Express backend checks for the presence of `ML_SERVICE_URL=http://localhost:8000/verify-image`. When online, it routes directly to this PyTorch service; when running serverless on Vercel or when Python is offline, the backend executes the self-contained multimodal vision engine without missing a beat!
