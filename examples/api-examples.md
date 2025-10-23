# CloudCurio CMS API Examples

## Generate Article

```bash
curl -X POST http://localhost:3001/api/workflow/generate-article \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "The Future of Artificial Intelligence",
    "tags": ["ai", "technology", "future"]
  }'
```

## Batch Generate

```bash
curl -X POST http://localhost:3001/api/workflow/batch-generate \
  -H "Content-Type: application/json" \
  -d '{
    "topics": [
      {"topic": "Machine Learning Basics", "tags": ["ml", "ai"]},
      {"topic": "Cloud Computing Trends", "tags": ["cloud", "devops"]}
    ]
  }'
```

## Chat with RAG

```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What are the latest AI trends?",
    "context": {
      "collections": ["articles", "knowledge_base"],
      "tags": ["ai", "technology"]
    }
  }'
```

## Perform Research

```bash
curl -X POST http://localhost:3001/api/research \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Quantum Computing",
    "tags": ["quantum", "computing"],
    "bucket": "technology"
  }'
```

## Get Articles

```bash
curl http://localhost:3001/api/articles?status=published&limit=10
```

See full documentation at http://localhost:3001/api
