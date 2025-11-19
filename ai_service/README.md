# ABSA PhoBERT API Service

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Start the server:
```bash
python api.py
```

The API will run on `http://localhost:8001`

## API Endpoints

### Health Check
```
GET /
GET /health
```

### Predict Sentiment
```
POST /predict
Content-Type: application/json

{
  "reviews": ["Review text 1", "Review text 2"],
  "product_id": "optional-product-id",
  "include_statistics": true
}
```

## Environment Variables

- `API_HOST`: Host to bind (default: 0.0.0.0)
- `API_PORT`: Port to bind (default: 8001)
- `USE_CUDA`: Enable CUDA (default: false)
