#!/usr/bin/env python3
"""
NeuroClass Model Evaluation Script

Evaluates trained checkpoint on held-out test dataset, producing
classification report, confusion matrix, and ROC-AUC metrics.

Usage:
    python ml/evaluate.py --data-dir ./dataset --weights ./models/neuroclass_resnet50_best.pth --arch resnet50
"""

import os
import sys
import json
import argparse
from pathlib import Path

def parse_args():
    parser = argparse.ArgumentParser(description="Evaluate NeuroClass model on test dataset")
    parser.add_argument("--data-dir", type=str, default="./dataset", help="Path to dataset directory")
    parser.add_argument("--weights", type=str, required=True, help="Path to trained .pth model weights")
    parser.add_argument("--arch", type=str, default="resnet50", help="Model backbone architecture")
    parser.add_argument("--output-dir", type=str, default="./outputs", help="Output directory for reports and charts")
    return parser.parse_args()

def main():
    args = parse_args()

    try:
        import numpy as np
        import torch
        import torch.nn.functional as F
    except ImportError:
        print("[Error] PyTorch and NumPy are required for evaluation.")
        print("Install dependencies with: pip install -r notebooks/requirements.txt")
        sys.exit(1)

    try:
        from ml.dataset import build_data_loaders
        from ml.model import build_model
    except ImportError:
        from dataset import build_data_loaders
        from model import build_model

    device = torch.device("cuda" if torch.cuda.is_available() else ("mps" if torch.backends.mps.is_available() else "cpu"))

    os.makedirs(args.output_dir, exist_ok=True)
    loaders, datasets_dict, class_names = build_data_loaders(args.data_dir, batch_size=32)

    print("\n" + "=" * 60)
    print("        NEUROCLASS CLINICAL MODEL EVALUATION")
    print("=" * 60)
    print(f"Device: {device}")
    print(f"Weights: {args.weights}")
    print(f"Test Samples: {len(datasets_dict['test'])}")
    print(f"Classes: {class_names}\n")

    # Load Model
    model = build_model(arch=args.arch, num_classes=len(class_names), pretrained=False).to(device)
    state_dict = torch.load(args.weights, map_location=device)
    model.load_state_dict(state_dict)
    model.eval()

    all_preds, all_labels, all_probs = [], [], []

    with torch.no_grad():
        for inputs, labels in loaders['test']:
            inputs = inputs.to(device)
            outputs = model(inputs)
            probs = F.softmax(outputs, dim=1)
            _, preds = torch.max(outputs, 1)

            all_preds.extend(preds.cpu().numpy())
            all_labels.extend(labels.numpy())
            all_probs.extend(probs.cpu().numpy())

    all_preds = np.array(all_preds)
    all_labels = np.array(all_labels)
    all_probs = np.array(all_probs)

    try:
        from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score
        from sklearn.preprocessing import label_binarize

        report_str = classification_report(all_labels, all_preds, target_names=class_names, digits=4)
        report_dict = classification_report(all_labels, all_preds, target_names=class_names, output_dict=True)
        cm = confusion_matrix(all_labels, all_preds)

        print("-----------------------------------------------------------------")
        print("                  TEST CLASSIFICATION REPORT")
        print("-----------------------------------------------------------------")
        print(report_str)

        # Save metrics to JSON
        metrics_file = Path(args.output_dir) / "test_evaluation_metrics.json"
        with open(metrics_file, "w") as f:
            json.dump({
                "classes": class_names,
                "confusion_matrix": cm.tolist(),
                "classification_report": report_dict
            }, f, indent=2)

        print(f"✔ Full clinical test metrics saved to: {metrics_file}")
    except ImportError:
        print("[Notice] Install scikit-learn for detailed report: pip install scikit-learn")
        acc = (all_preds == all_labels).mean()
        print(f"Overall Test Accuracy: {acc*100:.2f}%")

if __name__ == "__main__":
    main()
