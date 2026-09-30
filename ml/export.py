#!/usr/bin/env python3
"""
NeuroClass Model Exporter (TorchScript & ONNX)

Usage:
    python ml/export.py --weights ./models/neuroclass_resnet50_best.pth --arch resnet50 --output-dir ./models
"""

import os
import argparse
from pathlib import Path

def parse_args():
    parser = argparse.ArgumentParser(description="Export PyTorch model to TorchScript and ONNX")
    parser.add_argument("--weights", type=str, required=True, help="Path to trained PyTorch .pth file")
    parser.add_argument("--arch", type=str, default="resnet50", help="Model backbone architecture")
    parser.add_argument("--num-classes", type=int, default=4, help="Number of output classes")
    parser.add_argument("--output-dir", type=str, default="./models", help="Directory to save exported models")
    return parser.parse_args()

def main():
    args = parse_args()

    try:
        import torch
    except ImportError:
        print("[Error] PyTorch is required to export models.")
        print("Install dependencies with: pip install -r notebooks/requirements.txt")
        return

    try:
        from ml.model import build_model
    except ImportError:
        from model import build_model

    device = torch.device("cpu")  # Export on CPU for universal cross-platform deployment

    os.makedirs(args.output_dir, exist_ok=True)
    model = build_model(arch=args.arch, num_classes=args.num_classes, pretrained=False).to(device)
    state_dict = torch.load(args.weights, map_location=device)
    model.load_state_dict(state_dict)
    model.eval()

    dummy_input = torch.randn(1, 3, 224, 224, device=device)

    # 1. Export TorchScript
    ts_path = Path(args.output_dir) / f"neuroclass_{args.arch}.pt"
    traced = torch.jit.trace(model, dummy_input)
    traced.save(str(ts_path))
    print(f"✔ Successfully exported TorchScript model to: {ts_path}")

    # 2. Export ONNX
    try:
        import onnx
        onnx_path = Path(args.output_dir) / f"neuroclass_{args.arch}.onnx"
        torch.onnx.export(
            model,
            dummy_input,
            str(onnx_path),
            input_names=["input_image"],
            output_names=["class_logits"],
            dynamic_axes={"input_image": {0: "batch_size"}, "class_logits": {0: "batch_size"}},
            opset_version=14
        )
        print(f"✔ Successfully exported ONNX model to: {onnx_path}")
    except ImportError:
        print("[Notice] Install 'onnx' to export ONNX models: pip install onnx")
    except Exception as e:
        print(f"[Warning] ONNX export failed: {e}")

if __name__ == "__main__":
    main()
