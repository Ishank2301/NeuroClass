#!/usr/bin/env python3
"""
NeuroClass: Brain Tumor MRI Classification & Model Training Script
CLI Root Wrapper for ml/train.py

Usage:
    python train.py --data-dir ./dataset --arch resnet50 --epochs 25 --batch-size 32 --lr 1e-4 --output-dir ./models
"""

import sys
from pathlib import Path

# Add project root to sys.path so ml.* can be imported cleanly
root_path = Path(__file__).resolve().parent
if str(root_path) not in sys.path:
    sys.path.insert(0, str(root_path))

from ml.train import main

if __name__ == "__main__":
    main()
