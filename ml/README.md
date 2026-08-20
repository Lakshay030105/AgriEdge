# ML Pipeline, INT8 Quantization & CV Severity Engine

This directory contains the machine learning pipelines for fine-tuning MobileNetV2 on the PlantVillage dataset (38 disease categories), INT8 quantization, and the **Level 1 Computer Vision Disease Severity Grading Engine** (OpenCV.js / Canvas segmentation).

## Core Capabilities
- **MobileNetV2 Transfer Learning:** Fine-tuned on 54,300+ PlantVillage images with class-weighted cross-entropy loss.
- **INT8 Post-Training Quantization:** Compresses graph weights from ~50MB to <10MB with <150ms WebGL inference latency.
- **Level 1 Severity Segmentation:** Secondary computer vision pipeline isolating leaf foliage from background and extracting necrotic/chlorotic lesion pixels to output an exact severity percentage.
- **Grad-CAM Visual Saliency:** Gradient-weighted Class Activation Mapping highlighting diagnostic focal points.

## Directory Structure
- `notebooks/`: Jupyter notebooks for data augmentation, transfer learning, CV segmentation, and Grad-CAM validation.
- `scripts/`: Conversion and preprocessing utility scripts.
- `requirements.txt`: Python dependencies for training and conversion.
