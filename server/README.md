# AgriEdge Deferred Telemetry Sync & NGO Command Server

Lightweight **Node.js & Express REST API** for asynchronous, eventual-consistency ingestion of regional disease outbreak statistics from AgriEdge farmer PWAs and real-time telemetry streaming for the **Level 2 NGO Command Center**.

## Key Modules
- `src/models/outbreakStore.js`: GeoJSON-compatible schema storing anonymized crop disease detection telemetry, severity percentages, and GPS coordinates.
- `src/controllers/telemetryController.js`: Handlers for batch sync ingestion, GeoJSON map query, and emergency resource dispatch.
- `src/routes/telemetryRoutes.js`: Endpoints for batch sync (`POST /api/telemetry/sync`), outbreak clusters (`GET /api/telemetry/outbreaks`), and emergency alerts (`POST /api/alerts/dispatch`).

## Scripts
```bash
npm install     # Install dependencies
npm run dev     # Start development server
```
