"""
NeuroClass Dataset Loaders & Preprocessing Pipeline
"""

import os
from pathlib import Path
from torchvision import datasets, transforms
from torch.utils.data import DataLoader

IMAGE_SIZE = 224
CLASS_NAMES = ['glioma', 'meningioma', 'notumor', 'pituitary']

# ImageNet normalization statistics
NORM_MEAN = [0.485, 0.456, 0.406]
NORM_STD = [0.229, 0.224, 0.225]

def get_transforms():
    """Returns clinical data transforms for training, validation, and testing."""
    train_transform = transforms.Compose([
        transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
        transforms.RandomHorizontalFlip(p=0.5),
        transforms.RandomRotation(degrees=15),
        transforms.ColorJitter(brightness=0.15, contrast=0.15),
        transforms.RandomAffine(degrees=0, translate=(0.05, 0.05), scale=(0.95, 1.05)),
        transforms.ToTensor(),
        transforms.Normalize(mean=NORM_MEAN, std=NORM_STD)
    ])

    eval_transform = transforms.Compose([
        transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
        transforms.ToTensor(),
        transforms.Normalize(mean=NORM_MEAN, std=NORM_STD)
    ])

    return {
        'train': train_transform,
        'val': eval_transform,
        'test': eval_transform
    }

def find_split_dir(base_dir: Path, possible_names: list):
    """Finds directory matching any of the possible names (e.g. val or valid)."""
    for name in possible_names:
        p = base_dir / name
        if p.exists() and p.is_dir():
            return p
    return None

def count_images_in_dir(folder: Path):
    """Counts valid medical image files in directory."""
    if not folder or not folder.exists():
        return 0
    valid_exts = {'.jpg', '.jpeg', '.png', '.bmp', '.tif', '.tiff'}
    return sum(1 for f in folder.glob('**/*') if f.is_file() and f.suffix.lower() in valid_exts)

def build_data_loaders(data_dir: str, batch_size: int = 32, num_workers: int = 2):
    """
    Constructs PyTorch DataLoaders for train, val/valid, and test sets.
    Automatically detects standard 'val' or 'valid' directory naming.
    """
    base_path = Path(data_dir)
    transforms_dict = get_transforms()

    train_path = find_split_dir(base_path, ['train', 'Training'])
    val_path = find_split_dir(base_path, ['val', 'valid', 'Validation'])
    test_path = find_split_dir(base_path, ['test', 'Testing'])

    if not train_path or not train_path.exists():
        raise FileNotFoundError(f"Training directory not found inside '{data_dir}'. Expected 'dataset/train/' or 'dataset/Training/'.")

    n_train_imgs = count_images_in_dir(train_path)
    if n_train_imgs == 0:
        raise FileNotFoundError(
            f"No MRI images found inside '{train_path}'.\n"
            "Please upload your MRI slice files (.jpg, .png) into:\n"
            f"  - {train_path}/glioma/\n"
            f"  - {train_path}/meningioma/\n"
            f"  - {train_path}/notumor/\n"
            f"  - {train_path}/pituitary/\n"
            "Or run 'python ml/split_data.py --source /path/to/raw --output ./dataset'."
        )

    # If test not found, use val; if val not found, use test
    if not val_path and test_path:
        val_path = test_path
    if not test_path and val_path:
        test_path = val_path

    train_dataset = datasets.ImageFolder(root=str(train_path), transform=transforms_dict['train'])
    val_dataset = datasets.ImageFolder(root=str(val_path), transform=transforms_dict['val'])
    test_dataset = datasets.ImageFolder(root=str(test_path), transform=transforms_dict['test'])

    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True, num_workers=num_workers, pin_memory=True)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False, num_workers=num_workers, pin_memory=True)
    test_loader = DataLoader(test_dataset, batch_size=batch_size, shuffle=False, num_workers=num_workers, pin_memory=True)

    loaders = {
        'train': train_loader,
        'val': val_loader,
        'test': test_loader
    }

    datasets_dict = {
        'train': train_dataset,
        'val': val_dataset,
        'test': test_dataset
    }

    class_names = train_dataset.classes
    return loaders, datasets_dict, class_names
