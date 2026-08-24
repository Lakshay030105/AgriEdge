# AgriEdge MobileNetV2 Model Card

## Model summary

AgriEdge v2 is an image-classification model for offline crop-leaf disease screening. It accepts one RGB image and returns probabilities for 38 PlantVillage classes. The deployable browser artifact is a TensorFlow.js Layers model designed for the AgriEdge web application.

| Item | Value |
|---|---|
| Release | `agrieedge-v2` |
| Architecture | MobileNetV2, ImageNet transfer learning |
| Task | 38-class crop/disease classification |
| Input | RGB tensor, `224 × 224 × 3` |
| Input pixel range | `0–255` |
| Normalization | Embedded in the model: `x / 127.5 - 1` |
| Output | Softmax probabilities, shape `[1, 38]` |
| Browser format | TensorFlow.js Layers model, Float32 |
| Browser package size | Approximately 9.36 MB |
| Weight shards | 5 |
| Preferred runtime | WebGL; WASM/CPU fallback |
| Release date | 2026-08-23 |

## Intended use

The model is intended to provide an initial, offline screening result from a photograph of a supported crop leaf. The application should show the top three predictions and explicitly mark uncertain predictions.

The output is decision support, not a guaranteed diagnosis. Treatment or pesticide decisions should be confirmed by a qualified agronomist or local agricultural service.

## Dataset and preparation

The source dataset is PlantVillage with 38 class folders. The preprocessing workflow:

- verified the class-directory structure;
- removed 21 exact duplicate images;
- retained 54,284 images after deduplication;
- created stratified train, validation, and test splits;
- used 37,998 training, 8,150 validation, and 8,136 test images;
- computed class weights from the training split;
- kept validation and test images free from training augmentation.

The observed training-class imbalance ratio was approximately 36.37 between the largest and smallest classes. Class weighting was therefore part of the training design.

## Training approach

- MobileNetV2 feature extractor initialized with ImageNet weights.
- A 38-class softmax classification head.
- Transfer learning followed by controlled fine-tuning.
- Field-oriented training augmentation including crop/zoom, rotation, translation, contrast, brightness, and color variation.
- Input size fixed at 224 × 224 RGB.
- Best weights and training history saved outside the temporary notebook runtime.

## Release verification

The authoritative Keras model and the final Float32 TensorFlow.js model were compared on 38 locked golden inputs.

| Check | Result |
|---|---:|
| Model input | `[null, 224, 224, 3]` |
| Model output | `[null, 38]` |
| Top-1 parity | 38/38 |
| Exact Top-3 parity | 38/38 |
| Top-3 set parity | 38/38 |
| Invalid probability cases | 0 |
| Final release gate | Passed |

The Float32 conversion was selected because it preserved mathematical parity while remaining below the project's 10 MB browser-delivery target.

An experimental UINT8 conversion was rejected. Its comparison produced only 15/38 Top-1 matches, 1/38 Top-3 matches, and severe probability drift. That artifact must not be deployed or renamed as the production model.

## Application decision policy

The recommended application policy is:

- return the top three predictions;
- accept a prediction only when Top-1 confidence is at least `0.60`;
- require a Top-1 minus Top-2 probability margin of at least `0.10`;
- otherwise display an uncertain-result state and ask for a clearer image;
- never silently convert an uncertain result into a disease diagnosis.

These thresholds are product safeguards and can later be calibrated using real field images.

## Limitations

- PlantVillage images are mostly captured under controlled conditions and do not fully represent farms, complex backgrounds, shadows, occlusion, dust, water droplets, multiple leaves, or camera blur.
- The model recognizes only its 38 trained classes. Unsupported crops, non-leaf images, and unknown diseases can still receive high softmax scores.
- A probability is not the same as calibrated clinical or agronomic confidence.
- Real-field validation is still required before making strong accuracy claims outside PlantVillage.
- Severity estimation is not part of this classifier release.
- Grad-CAM is an explainability feature for a later phase and is not proof of causal reasoning.

## Required companion files

The model must be deployed with:

- `model.json`;
- all five `.bin` weight shards referenced by `model.json`;
- `labels.json`;
- `metadata.json`;
- `integration_contract.json`;
- `artifact_manifest.json`;
- `parity_report.json`.

Do not change the label order, shard filenames, preprocessing rule, or model files without creating a new version and rerunning the parity gate.

## Reproducibility and ownership

The clean release notebook is `AgriEdge_Phase2_TFJS_Release_Clean.ipynb`. The original experimental notebook should remain in `ml/notebooks/archive/` as an audit trail. Dataset images, caches, checkpoints, and large source models should not be committed to GitHub.

Owner: AgriEdge AI/ML team.

