# Security Policy & Data Protection

## Overview

**AgriEdge** is built on an **Offline-First, Zero-Cloud Edge Architecture**. Because model inference runs 100% locally on the user's device via WebGL/WASM shaders, crop leaf photographs and real-time camera frames **never leave the client device** during diagnosis.

---

## 🔒 Edge Data Privacy & Local Storage

1. **Camera Stream & Image Privacy:**
   - Raw leaf captures are processed directly within client browser memory (HTML5 Canvas API).
   - Images are converted to temporary local tensors ($224 \times 224 \times 3$) and disposed of immediately from memory using `tf.dispose()` after inference.
   - Images are **never transmitted** to third-party APIs, cloud inference servers, or external services.

2. **Local Database Sandboxing:**
   - On-device telemetry, scan histories, and Integrated Pest Management (IPM) advisory rules are stored within browser-sandboxed **IndexedDB** instances (via Dexie.js).
   - IndexedDB is subject to the **Same-Origin Policy (SOP)**, preventing cross-site access from other web domains.

---

## 🌐 Deferred Cloud Telemetry Sync (Optional)

When an internet connection is available and the user opts in to outbreak synchronization:
- **Anonymization:** Only high-level categorical disease statistics (disease class ID, timestamp, and approximate regional geo-coordinates) are synchronized.
- **Zero PII:** No Personally Identifiable Information (PII), farmer identities, farm names, or raw imagery are ever transmitted.
- **Transport Security:** All background sync transmissions require **HTTPS / TLS 1.3** encryption.

---

## 🚨 Reporting a Vulnerability

If you discover a security vulnerability within the AgriEdge codebase, please report it responsibly:

1. **Email:** Contact the maintainers directly at `sahildhandhalya@gmail.com` or via GitHub private vulnerability reporting.
2. **Details:** Include a description of the issue, steps to reproduce, affected components, and potential impact.
3. **Response Time:** We aim to acknowledge vulnerability reports within **48 hours** and provide a patch/mitigation timeline.

Please **do not** open public GitHub issues for sensitive security vulnerabilities until they have been reviewed and patched.
