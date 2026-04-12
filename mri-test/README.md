# Radiology Reporting Pipeline Prototype

JavaScript backend prototype for a multi-step radiology reporting pipeline.

The current fixture uses the local chest X-ray already stored in this folder:

```text
Normal_posteroanterior_(PA)_chest_radiograph_(X-ray).jpg
```

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Set `OPENAI_API_KEY` in `.env` before calling the pipeline.

## Synchronous Report

```bash
curl -X POST http://localhost:4000/api/reports \
  -H "Content-Type: application/json" \
  -d '{}'
```

The empty body uses the default metadata:

```json
{
  "modality": "X-ray",
  "bodyPart": "chest",
  "clinicalContext": "Adult patient with cough and mild shortness of breath. Evaluate for acute cardiopulmonary abnormality."
}
```

You can override the filesystem image or metadata:

```bash
curl -X POST http://localhost:4000/api/reports \
  -H "Content-Type: application/json" \
  -d '{
    "imagePath": "/absolute/path/to/image.jpg",
    "modality": "X-ray",
    "bodyPart": "chest",
    "clinicalContext": "Portable chest radiograph for fever and cough."
  }'
```

## Async Job

```bash
curl -X POST http://localhost:4000/api/reports/jobs \
  -H "Content-Type: application/json" \
  -d '{}'
```

Poll:

```bash
curl http://localhost:4000/api/reports/jobs/<jobId>
```

Stream progress:

```bash
curl -N http://localhost:4000/api/reports/jobs/<jobId>/events
```

## Feedback

```bash
curl -X POST http://localhost:4000/api/reports/<reportId>/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "reviewerId": "radiologist-1",
    "findingId": "F1",
    "section": "findings",
    "correction": "No focal air-space opacity.",
    "note": "Correction submitted after attending review."
  }'
```

