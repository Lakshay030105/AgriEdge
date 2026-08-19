# ML Pipeline & Model Quantization Engine

This directory contains the machine learning pipelines for fine-tuning MobileNetV2 on the PlantVillage dataset (38 disease categories), applying class-weighted cross-entropy loss to counteract class imbalance, and converting the trained model to INT8 quantized TensorFlow.js graph shards.

## Directory Structure
- `notebooks/`: Jupyter notebooks for data exploration, augmentation, transfer learning, and Grad-CAM validation.
- `scripts/`: Conversion and preprocessing utility scripts.
- `requirements.txt`: Python dependencies for training and conversion.

## Model Specifications
- **Base Architecture:** MobileNetV2 (ImageNet pre-trained)
- **Input Tensor Dimensions:** `224 x 224 x 3` (RGB)
- **Intensity Normalization:** Rescaled to `[-1, 1]`
- **Target Classes:** 38 crop-disease categories
- **Quantization:** Post-training INT8 quantization
- **Target Size:** `<10 MB`
- **Target Inference Latency:** `<150 ms` on modern mobile WebGL
