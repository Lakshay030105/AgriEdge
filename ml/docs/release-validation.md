# AgriEdge v2 Release Validation

## Release decision

Status: **Approved for frontend integration**

The approved deployment artifact is the Float32 TensorFlow.js release. It passed the final Python-to-TensorFlow.js parity gate on all 38 locked golden inputs and remained below the 10 MB browser-delivery target.

## Validated release properties

| Property | Expected value |
|---|---|
| Release directory | `agrieedge-v2` |
| Input shape | `[null, 224, 224, 3]` |
| Output shape | `[null, 38]` |
| Input dtype | Float32 |
| Input pixel range | `0–255` |
| Model normalization | Embedded |
| Output | 38 softmax probabilities |
| Weight shards | 5 |
| Bundle size | Approximately 9.36 MB |
| Top-1 parity | 38/38 |
| Exact Top-3 parity | 38/38 |
| Top-3 set parity | 38/38 |
| Invalid probability cases | 0 |
| Release gate | Passed |

## Required files

The release is incomplete unless all of the following are present:

```text
model.json
group1-shard1of5.bin
group1-shard2of5.bin
group1-shard3of5.bin
group1-shard4of5.bin
group1-shard5of5.bin
labels.json
metadata.json
integration_contract.json
artifact_manifest.json
parity_report.json
```

The actual shard names must match the paths inside `model.json`.

## Integrity check

Run this PowerShell script from the release directory before committing or deploying it:

```powershell
$manifest = Get-Content .\artifact_manifest.json -Raw | ConvertFrom-Json
$failed = $false

foreach ($property in $manifest.files.PSObject.Properties) {
    $name = $property.Name
    $expected = $property.Value.sha256.ToLower()

    if (-not (Test-Path ".\$name")) {
        Write-Host "MISSING  $name" -ForegroundColor Red
        $failed = $true
        continue
    }

    $actual = (Get-FileHash ".\$name" -Algorithm SHA256).Hash.ToLower()
    if ($actual -ne $expected) {
        Write-Host "MISMATCH $name" -ForegroundColor Red
        $failed = $true
    } else {
        Write-Host "OK       $name" -ForegroundColor Green
    }
}

if ($failed) { throw "AgriEdge release integrity check failed." }
Write-Host "AgriEdge release integrity verified." -ForegroundColor Green
```

If the manifest schema changes, inspect `artifact_manifest.json` and update only the traversal code—not the expected hashes.

## Browser smoke test

The frontend merge is allowed only when:

- `model.json` and all shards load with HTTP 200;
- TensorFlow.js reports input `[null,224,224,3]` and output `[null,38]`;
- one prediction produces 38 finite values;
- every value is between 0 and 1;
- the probability sum is close to 1.0;
- Top-3 IDs map to the same entries in `labels.json`;
- the app handles confidence `< 0.60` or margin `< 0.10` as uncertain;
- the model can be loaded from the expected public URL;
- the offline cache is tested after one successful online load.

## Release evidence

Keep the following evidence with the model release:

- `parity_report.json` for numerical comparison;
- `artifact_manifest.json` for file hashes and sizes;
- `integration_contract.json` for preprocessing and decision rules;
- `metadata.json` for release identity;
- `labels.json` for immutable output ordering;
- `AgriEdge_Phase2_TFJS_Release_Clean.ipynb` for reproducible export and validation.

## Rejected artifacts

Do not deploy:

- the experimental UINT8 TensorFlow.js bundle;
- any earlier patched `model.json` created during conversion debugging;
- a reconstructed model whose parity gate is false;
- standalone `.h5` training checkpoints in the browser;
- a release missing its manifest, labels, metadata, contract, or parity report.

The UINT8 experiment failed strict parity and exhibited severe probability drift. The production release is Float32.

## Repository placement

Recommended committed paths:

```text
AgriEdge/
├── client/public/models/agrieedge-v2/   # extracted release files
├── ml/notebooks/
│   ├── AgriEdge_Phase2_TFJS_Release_Clean.ipynb
│   └── archive/
└── ml/docs/
    ├── model-card.md
    ├── frontend-integration.md
    └── release-validation.md
```

Do not commit the downloaded ZIP if the extracted release files are already committed. Also exclude datasets, Kaggle/Colab caches, temporary parity runtimes, checkpoints, `.h5` source models, and `node_modules`.

Suggested `.gitignore` additions:

```gitignore
# ML data and training artifacts
ml/data/
ml/checkpoints/
ml/runs/
*.h5
*.keras
*.npy
*.npz

# Notebook/runtime caches
.ipynb_checkpoints/
**/__pycache__/
**/node_modules/

# Downloaded release archives
AgriEdge-TFJS-*.zip
```

Do not ignore `client/public/models/agrieedge-v2/*.bin`; those five production shards are required by the deployed web model.

## Git merge checklist

Before opening or merging the pull request:

- [ ] Empty placeholder notebooks are removed or clearly marked as future work.
- [ ] The clean Phase 2 notebook is committed.
- [ ] The archived experimental notebook is stored under `ml/notebooks/archive/`.
- [ ] All three documents exist under `ml/docs/`.
- [ ] The approved Float32 release is under `client/public/models/agrieedge-v2/`.
- [ ] No dataset, source `.h5`, cache, or downloaded ZIP is staged.
- [ ] `git status` contains only intended Phase 2/3 changes.
- [ ] Frontend model-loading smoke tests pass.
- [ ] Another teammate reviews the pull request before merging to `main`.

