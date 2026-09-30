#!/usr/bin/env python3
"""
NeuroClass Model Training Pipeline

Usage:
    python ml/train.py --data-dir ./dataset --arch resnet50 --epochs 25 --batch-size 32 --lr 1e-4 --output-dir ./models
"""

import os
import sys
import time
import json
import copy
import argparse
from pathlib import Path

def parse_args():
    parser = argparse.ArgumentParser(description="NeuroClass Deep Learning Training Pipeline")
    parser.add_argument("--data-dir", type=str, default="./dataset", help="Path to dataset directory with train/val/test subdirectories")
    parser.add_argument("--arch", type=str, default="resnet50", choices=["resnet50", "efficientnet_b0", "mobilenet_v2", "custom_cnn"], help="Model backbone architecture")
    parser.add_argument("--epochs", type=int, default=25, help="Number of training epochs")
    parser.add_argument("--batch-size", type=int, default=32, help="Batch size for DataLoaders")
    parser.add_argument("--lr", type=float, default=1e-4, help="Learning rate for AdamW")
    parser.add_argument("--weight-decay", type=float, default=1e-4, help="Weight decay for regularization")
    parser.add_argument("--label-smoothing", type=float, default=0.05, help="Label smoothing epsilon for CrossEntropy")
    parser.add_argument("--output-dir", type=str, default="./models", help="Directory where weights and logs are saved")
    parser.add_argument("--patience", type=int, default=7, help="Early stopping patience in epochs")
    return parser.parse_args()

def main():
    args = parse_args()

    try:
        import torch
        import torch.nn as nn
        import torch.optim as optim
    except ImportError:
        print("[Error] PyTorch is required to run model training.")
        print("Install dependencies with: pip install -r notebooks/requirements.txt")
        sys.exit(1)

    try:
        from ml.dataset import build_data_loaders
        from ml.model import build_model
    except ImportError:
        from dataset import build_data_loaders
        from model import build_model

    device = torch.device("cuda" if torch.cuda.is_available() else ("mps" if torch.backends.mps.is_available() else "cpu"))

    print("\n" + "=" * 60)
    print("          NEUROCLASS DEEP LEARNING TRAINING")
    print("=" * 60)
    print(f"Device: {device}")
    print(f"Architecture: {args.arch}")
    print(f"Dataset: {Path(args.data_dir).resolve()}")
    print(f"Epochs: {args.epochs} | Batch Size: {args.batch_size} | LR: {args.lr}")
    print(f"Output Directory: {Path(args.output_dir).resolve()}\n")

    os.makedirs(args.output_dir, exist_ok=True)

    # 1. Build DataLoaders
    try:
        loaders, datasets_dict, class_names = build_data_loaders(args.data_dir, batch_size=args.batch_size)
        print(f"✔ Found classes ({len(class_names)}): {class_names}")
        print(f"  • Training samples: {len(datasets_dict['train'])}")
        print(f"  • Validation samples: {len(datasets_dict['val'])}")
        print(f"  • Test samples: {len(datasets_dict['test'])}\n")
    except Exception as e:
        print(f"[Error loading dataset] {e}")
        print("Please ensure your dataset directory contains 'train', 'val' (or 'valid'), and 'test' subdirectories.")
        print("Run 'python ml/split_data.py --source /path/to/raw --output ./dataset' to organize your data.")
        sys.exit(1)

    # 2. Build Model
    model = build_model(arch=args.arch, num_classes=len(class_names), pretrained=True).to(device)
    print(f"✔ Initialized {args.arch} with {len(class_names)}-class classification head.")

    # 3. Loss, Optimizer & Scheduler
    criterion = nn.CrossEntropyLoss(label_smoothing=args.label_smoothing)
    optimizer = optim.AdamW(model.parameters(), lr=args.lr, weight_decay=args.weight_decay)
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=args.epochs, eta_min=1e-6)

    # 4. Training Loop
    history = {
        'train_loss': [],
        'train_acc': [],
        'val_loss': [],
        'val_acc': []
    }

    best_model_wts = copy.deepcopy(model.state_dict())
    best_acc = 0.0
    epochs_no_improve = 0
    start_time = time.time()

    print("-" * 65)
    print(f"{'Epoch':<8} | {'Train Loss':<12} | {'Train Acc':<12} | {'Val Loss':<12} | {'Val Acc':<10}")
    print("-" * 65)

    for epoch in range(args.epochs):
        # Training Phase
        model.train()
        train_loss, train_corrects = 0.0, 0
        total_train = len(datasets_dict['train'])

        for inputs, labels in loaders['train']:
            inputs = inputs.to(device)
            labels = labels.to(device)

            optimizer.zero_grad()
            outputs = model(inputs)
            loss = criterion(outputs, labels)
            _, preds = torch.max(outputs, 1)

            loss.backward()
            optimizer.step()

            train_loss += loss.item() * inputs.size(0)
            train_corrects += torch.sum(preds == labels.data).item()

        scheduler.step()
        epoch_train_loss = train_loss / total_train
        epoch_train_acc = train_corrects / total_train

        # Validation Phase
        model.eval()
        val_loss, val_corrects = 0.0, 0
        total_val = len(datasets_dict['val'])

        with torch.no_grad():
            for inputs, labels in loaders['val']:
                inputs = inputs.to(device)
                labels = labels.to(device)

                outputs = model(inputs)
                loss = criterion(outputs, labels)
                _, preds = torch.max(outputs, 1)

                val_loss += loss.item() * inputs.size(0)
                val_corrects += torch.sum(preds == labels.data).item()

        epoch_val_loss = val_loss / total_val
        epoch_val_acc = val_corrects / total_val

        history['train_loss'].append(epoch_train_loss)
        history['train_acc'].append(epoch_train_acc)
        history['val_loss'].append(epoch_val_loss)
        history['val_acc'].append(epoch_val_acc)

        print(f"{epoch+1:02d}/{args.epochs:02d}   | {epoch_train_loss:<12.4f} | {epoch_train_acc*100:<11.2f}% | {epoch_val_loss:<12.4f} | {epoch_val_acc*100:.2f}%")

        # Save Best Checkpoint
        if epoch_val_acc > best_acc:
            best_acc = epoch_val_acc
            best_model_wts = copy.deepcopy(model.state_dict())
            epochs_no_improve = 0
            best_path = Path(args.output_dir) / f"neuroclass_{args.arch}_best.pth"
            torch.save(best_model_wts, best_path)
        else:
            epochs_no_improve += 1
            if epochs_no_improve >= args.patience:
                print(f"\n[Early Stopping] No validation improvement for {args.patience} epochs. Stopping early.")
                break

    elapsed = time.time() - start_time
    print("-" * 65)
    print(f"✔ Training completed in {elapsed/60:.1f} minutes.")
    print(f"✔ Best Validation Accuracy: {best_acc*100:.2f}%")

    # Save final model and history JSON
    last_path = Path(args.output_dir) / f"neuroclass_{args.arch}_last.pth"
    torch.save(model.state_dict(), last_path)

    history_path = Path(args.output_dir) / "training_history.json"
    with open(history_path, "w") as f:
        json.dump(history, f, indent=2)
    print(f"✔ Training history saved to: {history_path}")
    print(f"✔ Checkpoint weights saved to: {args.output_dir}\n")

if __name__ == "__main__":
    main()
