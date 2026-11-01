import os
import cv2
import numpy as np
from PIL import Image
from ultralytics import YOLO

MODEL_PATH = os.path.join(os.path.dirname(__file__), "models", "best.pt")
print(f"Loading model from {MODEL_PATH}...")
model = YOLO(MODEL_PATH)
print(f"Model names: {model.names}")

# Create synthetic test images to verify inference:
# 1. Road with dark pothole circle
img_road = np.full((480, 640, 3), 120, dtype=np.uint8) # asphalt gray
cv2.circle(img_road, (320, 280), 80, (40, 35, 30), -1) # dark pothole crater
cv2.ellipse(img_road, (320, 280), (85, 75), 0, 0, 360, (20, 20, 20), 4) # fractured edge

# 2. Blank / non-civic image
img_blank = np.full((480, 640, 3), 240, dtype=np.uint8) # plain white paper

print("\n--- Running Inference on Test 1 (Simulated Road Pothole) ---")
res1 = model(img_road, conf=0.15)
print(f"Detections in Test 1: {len(res1[0].boxes)}")
for box in res1[0].boxes:
    cls_id = int(box.cls[0])
    conf = float(box.conf[0])
    coords = [round(float(c), 1) for c in box.xyxy[0]]
    print(f"  Class: {model.names[cls_id]}, Confidence: {conf:.3f}, BBox: {coords}")

print("\n--- Running Inference on Test 2 (Blank Non-Civic Image) ---")
res2 = model(img_blank, conf=0.15)
print(f"Detections in Test 2: {len(res2[0].boxes)}")
if len(res2[0].boxes) == 0:
    print("  ✓ Correct: No civic issue detected on blank non-civic image.")
