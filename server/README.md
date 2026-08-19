# AgriEdge Deferred Telemetry Sync Backend

Lightweight Node.js & Express REST API for asynchronous, eventual-consistency ingestion of regional disease outbreak statistics from AgriEdge clients when internet connectivity is restored.

## Key Modules
- `src/models/Outbreak.js`: GeoJSON-compatible schema storing anonymized crop disease detection telemetry.
- `src/routes/telemetry.js`: Endpoints for batch sync ingestion and regional outbreak heatmaps.
- `src/config/db.js`: MongoDB Atlas connection lifecycle management.

## Scripts
```bash
npm install     # Install dependencies
npm run dev     # Start development server
```
