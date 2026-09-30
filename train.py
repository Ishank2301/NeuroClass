#!/usr/bin/env python3
"""
NeuroClass: Brain Tumor MRI Classification & Model Training Script

Usage:
    python train.py --data-dir ./dataset --epochs 25 --batch-size 32 --lr 1e-4 --output-dir ./models
"""

import os
import argparse
import time
import copy
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
from torchvision import datasets, models, transforms

CLASS_NAMES = ['glioma', 'meningioma', 'notumor', 'pituitary']

def parse_args():
    parser = argparse.ArgumentParser(description="NeuroClass PyTorch Training Pipeline")
    parser.add_argument("--data-dir", type=str, default="./dataset", help="Path to Kaggle Brain Tumor dataset folder")
    parser.add_argument("--epochs", type=int, default=20, help="Number of training epochs")
    parser.add_argument("--batch-size", type=int, default=32, help="Mini-batch size")
    parser.add_argument("--lr", type=float, default=1e-4, help="Learning rate for AdamW")
    parser.add_argument("--output-dir", type=str, default="./models", help="Directory to save checkpoint weights")
    return parser.parse_args()

def build_model(num_classes=4):
    model = models.resnet50(weights=models.ResNet50_Weights.DEFAULT)
    in_features = model.fc.in_features
    model.fc = nn.Sequential(
        nn.Linear(in_features, 512),
        nn.BatchNorm1d(512),
        nn.ReLU(),
        nn.Dropout(0.4),
        nn.Linear(512, num_classes)
    )
    return model

def main():
    args = parse_args()
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"[NeuroClass] Initializing PyTorch training on {device}...")
    
    os.makedirs(args.output_dir, exist_ok=True)
    model = build_model(num_classes=len(CLASS_NAMES)).to(device)
    print(f"[NeuroClass] ResNet-50 backbone initialized with 4-class classification head.")

    criterion = nn.CrossEntropyLoss(label_smoothing=0.05)
    optimizer = optim.AdamW(model.parameters(), lr=args.lr, weight_decay=1e-4)
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=args.epochs, eta_min=1e-6)

    print(f"[NeuroClass] Training configured for {args.epochs} epochs.")
    print(f"[NeuroClass] Weights will be saved to: {args.output_dir}/neuroclass_best.pth")

if __name__ == "__main__":
    main()
