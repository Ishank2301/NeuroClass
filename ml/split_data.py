#!/usr/bin/env python3
"""
NeuroClass Dataset Splitter & Validator

Splits raw MRI datasets into stratified train, validation, and test subsets.
Ensures uniform class distribution and verifies image file integrity.

Usage:
    python ml/split_data.py --source ./raw_dataset --output ./dataset --train-ratio 0.70 --val-ratio 0.15 --test-ratio 0.15
"""

import os
import sys
import shutil
import random
import argparse
from pathlib import Path

try:
    from PIL import Image
    HAS_PIL = True
except ImportError:
    HAS_PIL = False

VALID_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.bmp', '.tif', '.tiff'}
STANDARD_CLASSES = ['glioma', 'meningioma', 'notumor', 'pituitary']

def parse_args():
    parser = argparse.ArgumentParser(description="Split raw brain MRI data into train, val, and test sets.")
    parser.add_argument("--source", type=str, required=True, help="Path to raw unsplit dataset directory")
    parser.add_argument("--output", type=str, default="./dataset", help="Output directory (default: ./dataset)")
    parser.add_argument("--train-ratio", type=float, default=0.70, help="Training split fraction (default: 0.70)")
    parser.add_argument("--val-ratio", type=float, default=0.15, help="Validation split fraction (default: 0.15)")
    parser.add_argument("--test-ratio", type=float, default=0.15, help="Test split fraction (default: 0.15)")
    parser.add_argument("--seed", type=int, default=42, help="Random seed for reproducible splits (default: 42)")
    return parser.parse_args()

def is_valid_image(file_path):
    """Check if file exists, has a valid image extension, and can be opened."""
    if file_path.suffix.lower() not in VALID_EXTENSIONS:
        return False
    if not HAS_PIL:
        return True
    try:
        with Image.open(file_path) as img:
            img.verify()
        return True
    except Exception:
        return False

def normalize_class_name(name):
    """Map common Kaggle variations to standard class names."""
    lower = name.lower().replace(" ", "").replace("_", "").replace("-", "")
    if "glioma" in lower:
        return "glioma"
    if "meningioma" in lower:
        return "meningioma"
    if "pituitary" in lower:
        return "pituitary"
    if "notumor" in lower or "normal" in lower or "healthy" in lower:
        return "notumor"
    return lower

def main():
    args = parse_args()
    
    assert abs((args.train_ratio + args.val_ratio + args.test_ratio) - 1.0) < 1e-4, \
        "Split ratios must sum to 1.0 (e.g. 0.70, 0.15, 0.15)"

    random.seed(args.seed)
    source_dir = Path(args.source)
    output_dir = Path(args.output)

    if not source_dir.exists():
        print(f"[Error] Source directory '{source_dir}' does not exist.")
        sys.exit(1)

    print(f"\n=======================================================")
    print(f"       NEUROCLASS DATASET PREPARATION & SPLIT")
    print(f"=======================================================")
    print(f"Source Directory: {source_dir.resolve()}")
    print(f"Target Directory: {output_dir.resolve()}")
    print(f"Split Ratios: Train={args.train_ratio*100:.0f}%, Val={args.val_ratio*100:.0f}%, Test={args.test_ratio*100:.0f}%")
    print(f"Random Seed: {args.seed}\n")

    # Discover classes in source directory
    class_dirs = [d for d in source_dir.iterdir() if d.is_dir() and not d.name.startswith('.')]
    if not class_dirs:
        print("[Error] No class subdirectories found in source directory.")
        sys.exit(1)

    # Setup target subdirectories
    splits = ['train', 'val', 'test']
    for s in splits:
        for cls in STANDARD_CLASSES:
            (output_dir / s / cls).mkdir(parents=True, exist_ok=True)

    summary = {s: {cls: 0 for cls in STANDARD_CLASSES} for s in splits}
    total_images_processed = 0

    for c_dir in class_dirs:
        norm_class = normalize_class_name(c_dir.name)
        if norm_class not in STANDARD_CLASSES:
            print(f"[Warning] Unknown class '{c_dir.name}', skipping...")
            continue

        images = [f for f in c_dir.glob('**/*') if f.is_file() and is_valid_image(f)]
        random.shuffle(images)
        n_total = len(images)

        if n_total == 0:
            print(f"[Warning] No valid images found in {c_dir}")
            continue

        n_train = int(n_total * args.train_ratio)
        n_val = int(n_total * args.val_ratio)

        train_imgs = images[:n_train]
        val_imgs = images[n_train:n_train + n_val]
        test_imgs = images[n_train + n_val:]

        split_dict = {
            'train': train_imgs,
            'val': val_imgs,
            'test': test_imgs
        }

        print(f"Processing '{norm_class}': {n_total} total -> {len(train_imgs)} train, {len(val_imgs)} val, {len(test_imgs)} test")

        for s_name, img_list in split_dict.items():
            dest_dir = output_dir / s_name / norm_class
            for img_path in img_list:
                dest_file = dest_dir / img_path.name
                # Avoid collision if filenames repeat
                if dest_file.exists():
                    dest_file = dest_dir / f"{img_path.stem}_{random.randint(1000, 9999)}{img_path.suffix}"
                shutil.copy2(img_path, dest_file)
                summary[s_name][norm_class] += 1
                total_images_processed += 1

    print(f"\n✔ Successfully organized {total_images_processed} MRI slices into '{output_dir}':")
    print(f"{'Class':<12} | {'Train':<8} | {'Val':<8} | {'Test':<8} | {'Total':<8}")
    print("-" * 52)
    for cls in STANDARD_CLASSES:
        tr = summary['train'][cls]
        va = summary['val'][cls]
        te = summary['test'][cls]
        tot = tr + va + te
        print(f"{cls:<12} | {tr:<8} | {va:<8} | {te:<8} | {tot:<8}")
    print("-" * 52)
    print("Dataset split complete. Ready for PyTorch training.\n")

if __name__ == "__main__":
    main()
