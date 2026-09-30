# NeuroClass Dataset Directory Structure

This folder contains the clinical MRI dataset organized into standard PyTorch `ImageFolder` subdirectories:

```text
dataset/
├── train/
│   ├── glioma/
│   ├── meningioma/
│   ├── notumor/
│   └── pituitary/
├── val/          # (or 'valid/')
│   ├── glioma/
│   ├── meningioma/
│   ├── notumor/
│   └── pituitary/
└── test/
    ├── glioma/
    ├── meningioma/
    ├── notumor/
    └── pituitary/
```

### Automatic Data Splitting
If you have raw unsplit data (or separate `Training/` and `Testing/` folders from Kaggle), use the included automated splitter:

```bash
# Auto-split raw data into 70% train, 15% val, 15% test
python ml/split_data.py --source /path/to/raw_data --output ./dataset --train-ratio 0.70 --val-ratio 0.15 --test-ratio 0.15
```

### Supported Class Names:
1. `glioma`
2. `meningioma`
3. `notumor` (or `no_tumor` / `normal`)
4. `pituitary`

*Note: The `dataset/` directory is automatically excluded from Git commits via `.gitignore` to avoid pushing heavy binary datasets to GitHub.*
