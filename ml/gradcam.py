#!/usr/bin/env python3
"""
NeuroClass Grad-CAM Visual Explainability Engine

Usage:
    python ml/gradcam.py --image /path/to/mri.jpg --weights ./models/neuroclass_resnet50_best.pth --output ./outputs/gradcam.png
"""

import os
import os
import argparse
from pathlib import Path

IMAGE_SIZE = 224
NORM_MEAN = [0.485, 0.456, 0.406]
NORM_STD = [0.229, 0.224, 0.225]
CLASS_NAMES = ['glioma', 'meningioma', 'notumor', 'pituitary']

class GradCAM:
    def __init__(self, model, target_layer):
        self.model = model
        self.target_layer = target_layer
        self.gradients = None
        self.activations = None

        self.target_layer.register_forward_hook(self._save_activation)
        self.target_layer.register_full_backward_hook(self._save_gradient)

    def _save_activation(self, module, input, output):
        self.activations = output.detach()

    def _save_gradient(self, module, grad_input, grad_output):
        self.gradients = grad_output[0].detach()

    def generate_heatmap(self, input_tensor, target_class=None):
        import torch
        import torch.nn.functional as F

        self.model.eval()
        self.model.zero_grad()

        output = self.model(input_tensor)
        if target_class is None:
            target_class = output.argmax(dim=1).item()

        score = output[0, target_class]
        score.backward()

        weights = torch.mean(self.gradients, dim=[2, 3], keepdim=True)
        cam = torch.sum(weights * self.activations, dim=1).squeeze()
        cam = F.relu(cam)

        cam = cam - cam.min()
        if cam.max() > 0:
            cam = cam / cam.max()

        probs = F.softmax(output, dim=1)[0].cpu().detach().numpy()
        return cam.cpu().numpy(), target_class, probs[target_class], probs

def parse_args():
    parser = argparse.ArgumentParser(description="Generate Grad-CAM activation heatmap for MRI scan")
    parser.add_argument("--image", type=str, required=True, help="Path to input MRI image slice")
    parser.add_argument("--weights", type=str, required=True, help="Path to trained PyTorch weights (.pth)")
    parser.add_argument("--arch", type=str, default="resnet50", help="Model backbone architecture")
    parser.add_argument("--output", type=str, default="./outputs/gradcam_result.png", help="Path to save output overlay")
    return parser.parse_args()

def main():
    args = parse_args()

    try:
        import numpy as np
        from PIL import Image
        import torch
        import torch.nn.functional as F
        from torchvision import transforms
    except ImportError:
        print("[Error] PyTorch, Pillow, and NumPy are required for Grad-CAM generation.")
        print("Install dependencies with: pip install -r notebooks/requirements.txt")
        return

    try:
        from ml.model import build_model
    except ImportError:
        from model import build_model

    device = torch.device("cuda" if torch.cuda.is_available() else ("mps" if torch.backends.mps.is_available() else "cpu"))

    # Load Model
    model = build_model(arch=args.arch, num_classes=len(CLASS_NAMES), pretrained=False).to(device)
    state_dict = torch.load(args.weights, map_location=device)
    model.load_state_dict(state_dict)
    model.eval()

    # Target Layer (layer4 for ResNet)
    target_layer = model.layer4[-1] if hasattr(model, 'layer4') else list(model.children())[-2]
    grad_cam = GradCAM(model, target_layer)

    # Preprocess Image
    img = Image.open(args.image).convert("RGB")
    transform = transforms.Compose([
        transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
        transforms.ToTensor(),
        transforms.Normalize(mean=NORM_MEAN, std=NORM_STD)
    ])
    tensor = transform(img).unsqueeze(0).to(device)

    # Compute Grad-CAM
    cam, pred_class, confidence, all_probs = grad_cam.generate_heatmap(tensor)

    print(f"\n[NeuroClass CADx Result]")
    print(f"  • Predicted Class: {CLASS_NAMES[pred_class].upper()} ({confidence*100:.2f}%)")
    for idx, name in enumerate(CLASS_NAMES):
        print(f"    - {name:<12}: {all_probs[idx]*100:.2f}%")

    try:
        import cv2
        cam_resized = cv2.resize(cam, (IMAGE_SIZE, IMAGE_SIZE))
        heatmap_color = cv2.applyColorMap(np.uint8(255 * cam_resized), cv2.COLORMAP_JET)
        heatmap_color = cv2.cvtColor(heatmap_color, cv2.COLOR_BGR2RGB) / 255.0

        orig_np = np.array(img.resize((IMAGE_SIZE, IMAGE_SIZE))) / 255.0
        overlay = 0.55 * orig_np + 0.45 * heatmap_color
        overlay = np.clip(overlay * 255, 0, 255).astype(np.uint8)

        os.makedirs(Path(args.output).parent, exist_ok=True)
        Image.fromarray(overlay).save(args.output)
        print(f"✔ Saved visual explainability overlay to: {args.output}\n")
    except ImportError:
        print("[Notice] Install opencv-python to render colored overlay: pip install opencv-python")

if __name__ == "__main__":
    main()
