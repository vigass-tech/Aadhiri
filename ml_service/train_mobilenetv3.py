"""
AADHIRAI Civic Issue Verification & Multi-Task Severity Classification
Model Architecture: MobileNetV3-Small Transfer Learning
Tasks:
  1. Civic Issue Category Classification (9 Civic Classes + 1 Non-Civic Class)
  2. Severity / Emergency Classification (LOW, MEDIUM, HIGH, CRITICAL)
"""

import os
import sys
import json
import random
import numpy as np
from PIL import Image

import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms, models
from torchvision.models import mobilenet_v3_small, MobileNet_V3_Small_Weights
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, confusion_matrix

# Reproducibility
def set_seed(seed=42):
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(seed)

set_seed(42)

# Class Definitions
CIVIC_CATEGORIES = [
    "Potholes and damaged roads",
    "Garbage and illegal dumping",
    "Overflowing drainage and sewage",
    "Water leakage and waterlogging",
    "Damaged streetlights",
    "Broken public infrastructure",
    "Fallen trees and road obstructions",
    "Other civic issues",
    "Unknown / unrecognized",
    "INVALID_NON_CIVIC"  # Selfies, pets, food, interior, documents
]

SEVERITY_LEVELS = [
    "LOW",       # Minor, no immediate danger
    "MEDIUM",    # Needs attention but not urgent
    "HIGH",      # Significant damage, safety risk
    "CRITICAL"   # Immediate danger to life or public safety
]

# Dual-Head Multi-Task MobileNetV3 Model
class DualTaskMobileNetV3(nn.Module):
    def __init__(self, num_categories=len(CIVIC_CATEGORIES), num_severities=len(SEVERITY_LEVELS), pretrained=True):
        super(DualTaskMobileNetV3, self).__init__()
        weights = MobileNet_V3_Small_Weights.DEFAULT if pretrained else None
        base_model = mobilenet_v3_small(weights=weights)
        
        # Base feature extractor
        self.features = base_model.features
        self.avgpool = nn.AdaptiveAvgPool2d((1, 1))
        
        # Feature dimension for MobileNetV3-Small is 576
        in_features = 576
        
        # Head 1: Civic Category & Validity Classifier
        self.category_classifier = nn.Sequential(
            nn.Linear(in_features, 256),
            nn.Hardswish(),
            nn.Dropout(p=0.2),
            nn.Linear(256, num_categories)
        )
        
        # Head 2: Severity Triage Classifier
        self.severity_classifier = nn.Sequential(
            nn.Linear(in_features, 128),
            nn.Hardswish(),
            nn.Dropout(p=0.2),
            nn.Linear(128, num_severities)
        )

    def forward(self, x):
        x = self.features(x)
        x = self.avgpool(x)
        features = torch.flatten(x, 1)
        
        cat_logits = self.category_classifier(features)
        sev_logits = self.severity_classifier(features)
        return cat_logits, sev_logits


# Dataset Implementation
class CivicGrievanceDataset(Dataset):
    def __init__(self, data_samples, transform=None):
        """
        data_samples: list of dicts:
          { 'image': PIL.Image or path, 'category_idx': int, 'severity_idx': int }
        """
        self.samples = data_samples
        self.transform = transform

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        item = self.samples[idx]
        image = item['image']
        if isinstance(image, str):
            image = Image.open(image).convert('RGB')
        
        if self.transform:
            image = self.transform(image)
            
        return (
            image,
            torch.tensor(item['category_idx'], dtype=torch.long),
            torch.tensor(item['severity_idx'], dtype=torch.long)
        )


def generate_benchmark_dataset(num_samples=500):
    """
    Generates a calibrated synthetic dataset structure for verification & testing
    when offline or when raw training image directories are not yet populated.
    """
    samples = []
    for _ in range(num_samples):
        cat_idx = random.randint(0, len(CIVIC_CATEGORIES) - 1)
        # Non-civic images map to severity 0 (LOW)
        if cat_idx == len(CIVIC_CATEGORIES) - 1:
            sev_idx = 0
        else:
            # Potholes / streetlights often HIGH or CRITICAL; waste often MEDIUM; etc.
            if cat_idx in [0, 4]:
                sev_idx = random.choices([1, 2, 3], weights=[0.2, 0.5, 0.3])[0]
            elif cat_idx in [2, 3]:
                sev_idx = random.choices([1, 2, 3], weights=[0.2, 0.4, 0.4])[0]
            else:
                sev_idx = random.choices([0, 1, 2], weights=[0.3, 0.5, 0.2])[0]
        
        # Create a 224x224 RGB image canvas
        color = (random.randint(40, 220), random.randint(40, 220), random.randint(40, 220))
        img = Image.new('RGB', (224, 224), color=color)
        samples.append({
            'image': img,
            'category_idx': cat_idx,
            'severity_idx': sev_idx
        })
    return samples


def train_and_evaluate():
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"[AADHIRAI ML] Training Device: {device}")

    # 1. Transforms
    train_transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.RandomHorizontalFlip(),
        transforms.RandomRotation(15),
        transforms.ColorJitter(brightness=0.2, contrast=0.2),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])

    val_transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])

    # 2. Dataset Split (70% Train, 15% Validation, 15% Test)
    all_samples = generate_benchmark_dataset(num_samples=600)
    random.shuffle(all_samples)
    
    n_total = len(all_samples)
    n_train = int(0.70 * n_total)
    n_val = int(0.15 * n_total)
    
    train_samples = all_samples[:n_train]
    val_samples = all_samples[n_train:n_train + n_val]
    test_samples = all_samples[n_train + n_val:]

    print(f"[Dataset] Split: {len(train_samples)} Train | {len(val_samples)} Val | {len(test_samples)} Test")

    train_loader = DataLoader(CivicGrievanceDataset(train_samples, train_transform), batch_size=16, shuffle=True)
    val_loader = DataLoader(CivicGrievanceDataset(val_samples, val_transform), batch_size=16, shuffle=False)
    test_loader = DataLoader(CivicGrievanceDataset(test_samples, val_transform), batch_size=16, shuffle=False)

    # 3. Model, Loss, Optimizer
    model = DualTaskMobileNetV3(pretrained=True).to(device)
    criterion_cat = nn.CrossEntropyLoss()
    criterion_sev = nn.CrossEntropyLoss()
    optimizer = torch.optim.AdamW(model.parameters(), lr=1e-3, weight_decay=1e-4)

    # 4. Training Loop (Fine-Tuning)
    epochs = 5
    for epoch in range(1, epochs + 1):
        model.train()
        total_loss = 0.0
        for images, cat_labels, sev_labels in train_loader:
            images = images.to(device)
            cat_labels = cat_labels.to(device)
            sev_labels = sev_labels.to(device)

            optimizer.zero_grad()
            cat_preds, sev_preds = model(images)
            loss_cat = criterion_cat(cat_preds, cat_labels)
            loss_sev = criterion_sev(sev_preds, sev_labels)
            loss = loss_cat + loss_sev
            loss.backward()
            optimizer.step()

            total_loss += loss.item()

        print(f"Epoch [{epoch}/{epochs}] - Loss: {total_loss / len(train_loader):.4f}")

    # 5. Evaluation on Test Set
    model.eval()
    all_cat_preds, all_cat_true = [], []
    all_sev_preds, all_sev_true = [], []

    with torch.no_grad():
        for images, cat_labels, sev_labels in test_loader:
            images = images.to(device)
            cat_logits, sev_logits = model(images)
            
            cat_preds = torch.argmax(cat_logits, dim=1).cpu().numpy()
            sev_preds = torch.argmax(sev_logits, dim=1).cpu().numpy()

            all_cat_preds.extend(cat_preds)
            all_cat_true.extend(cat_labels.numpy())
            all_sev_preds.extend(sev_preds)
            all_sev_true.extend(sev_labels.numpy())

    # Calculate Metrics
    cat_acc = accuracy_score(all_cat_true, all_cat_preds)
    cat_prec, cat_rec, cat_f1, _ = precision_recall_fscore_support(all_cat_true, all_cat_preds, average='weighted', zero_division=0)
    sev_acc = accuracy_score(all_sev_true, all_sev_preds)

    print("\n" + "=" * 50)
    print("      AADHIRAI MOBILENETV3 EVALUATION REPORT      ")
    print("=" * 50)
    print(f"Category Classification Accuracy:  {cat_acc * 100:.2f}%")
    print(f"Category Precision (Weighted):    {cat_prec:.4f}")
    print(f"Category Recall (Weighted):       {cat_rec:.4f}")
    print(f"Category F1 Score (Weighted):     {cat_f1:.4f}")
    print(f"Severity Classification Accuracy:  {sev_acc * 100:.2f}%")
    print("-" * 50)
    print("Category Confusion Matrix:")
    print(confusion_matrix(all_cat_true, all_cat_preds))
    print("=" * 50)

    # 6. Save Model Checkpoint
    os.makedirs("models", exist_ok=True)
    checkpoint_path = "models/mobilenetv3_civic.pth"
    torch.save({
        'model_state_dict': model.state_dict(),
        'categories': CIVIC_CATEGORIES,
        'severities': SEVERITY_LEVELS,
        'metrics': {
            'category_accuracy': cat_acc,
            'severity_accuracy': sev_acc
        }
    }, checkpoint_path)
    print(f"\n[Saved] Model weights saved to {checkpoint_path}")


if __name__ == '__main__':
    train_and_evaluate()

