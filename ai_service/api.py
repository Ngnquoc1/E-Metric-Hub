"""
FastAPI service for ABSA PhoBERT model inference
"""
import os
os.environ['TOKENIZERS_PARALLELISM'] = 'false'

import torch
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict
from transformers import AutoTokenizer
import uvicorn

from model_class import PhoBERTMultiAspectClassifier
from config import (
    MODEL_DIR, MODEL_NAME, MAX_LENGTH, NUM_LABELS,
    ASPECT_COLUMNS, INV_LABEL_MAP, LABEL_NAMES, 
    ASPECT_DISPLAY_NAMES, DEVICE, API_HOST, API_PORT
)


app = FastAPI(title="ABSA PhoBERT API", version="1.0.0")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global model and tokenizer
model = None
tokenizer = None


class ReviewRequest(BaseModel):
    """Request model for sentiment analysis"""
    reviews: List[str]
    product_id: str = None
    include_statistics: bool = True


class AspectSentiment(BaseModel):
    """Sentiment prediction for a single aspect"""
    aspect: str
    aspect_display: str
    sentiment: int  # -1: positive, 0: neutral, 1: negative
    sentiment_label: str
    confidence: float = None


class ReviewPrediction(BaseModel):
    """Prediction result for a single review"""
    review_text: str
    aspects: List[AspectSentiment]
    overall_sentiment: str


class StatisticsResponse(BaseModel):
    """Aggregated statistics across all reviews"""
    total_reviews: int
    sentiment_distribution: Dict[str, int]
    aspect_statistics: Dict[str, Dict[str, int]]
    keywords: Dict[str, int]


class PredictionResponse(BaseModel):
    """Complete API response"""
    predictions: List[ReviewPrediction]
    statistics: StatisticsResponse = None


@app.on_event("startup")
async def load_model():
    """Load model and tokenizer on startup"""
    global model, tokenizer
    
    print(f"Loading model from {MODEL_DIR}...")
    print(f"Using device: {DEVICE}")
    
    try:
        # Load tokenizer
        tokenizer = AutoTokenizer.from_pretrained(str(MODEL_DIR), use_fast=False)
        
        # Load model
        model = PhoBERTMultiAspectClassifier(
            model_name=MODEL_NAME,
            num_aspects=len(ASPECT_COLUMNS),
            num_labels=NUM_LABELS,
            ignore_index=-100,
            dropout=0.2
        )
        
        # Load trained weights
        model_path = MODEL_DIR / 'pytorch_model.bin'
        if not model_path.exists():
            model_path = MODEL_DIR / 'model.safetensors'
        
        if model_path.exists():
            if str(model_path).endswith('.safetensors'):
                from safetensors.torch import load_file
                state_dict = load_file(str(model_path))
            else:
                state_dict = torch.load(str(model_path), map_location=DEVICE)
            
            model.load_state_dict(state_dict, strict=False)
        
        model.to(DEVICE)
        model.eval()
        
        print("Model loaded successfully!")
        
    except Exception as e:
        print(f"Error loading model: {e}")
        raise


def predict_single_review(review_text: str) -> Dict:
    """
    Predict sentiment for a single review
    
    Args:
        review_text: Review text to analyze
        
    Returns:
        Dictionary with aspect predictions
    """
    # Tokenize
    encoded = tokenizer(
        review_text,
        truncation=True,
        padding='max_length',
        max_length=MAX_LENGTH,
        return_tensors='pt'
    )
    
    # Move to device
    encoded = {key: value.to(DEVICE) for key, value in encoded.items()}
    
    # Predict
    with torch.no_grad():
        outputs = model(**encoded)
        logits = outputs.logits.squeeze(0)  # [num_aspects, num_labels]
        
        # Get predictions and probabilities
        probs = torch.softmax(logits, dim=-1)
        preds = logits.argmax(dim=-1).tolist()
        confidences = probs.max(dim=-1).values.tolist()
    
    # Format results
    aspects = []
    for i, aspect in enumerate(ASPECT_COLUMNS):
        pred_label = preds[i]
        sentiment_value = INV_LABEL_MAP[pred_label]
        
        aspects.append(AspectSentiment(
            aspect=aspect,
            aspect_display=ASPECT_DISPLAY_NAMES[aspect],
            sentiment=sentiment_value,
            sentiment_label=LABEL_NAMES[sentiment_value],
            confidence=round(confidences[i], 4)
        ))
    
    return {
        'review_text': review_text,
        'aspects': aspects
    }


def calculate_statistics(predictions: List[Dict]) -> StatisticsResponse:
    """
    Calculate aggregated statistics from predictions
    
    Args:
        predictions: List of prediction dictionaries
        
    Returns:
        StatisticsResponse with aggregated data
    """
    total_reviews = len(predictions)
    sentiment_dist = {'positive': 0, 'neutral': 0, 'negative': 0}
    aspect_stats = {aspect: {'positive': 0, 'neutral': 0, 'negative': 0} 
                   for aspect in ASPECT_COLUMNS}
    
    # Aggregate sentiment data
    for pred in predictions:
        aspects = pred.get('aspects', [])
        for aspect_data in aspects:
            label = aspect_data['sentiment_label']
            aspect_name = aspect_data['aspect']
            sentiment_dist[label] = sentiment_dist.get(label, 0) + 1
            aspect_stats[aspect_name][label] += 1
    
    # Extract keywords (simple word frequency)
    keywords = {}
    for pred in predictions:
        words = pred['review_text'].lower().split()
        for word in words:
            if len(word) > 3:  # Filter short words
                keywords[word] = keywords.get(word, 0) + 1
    
    # Get top keywords
    top_keywords = dict(sorted(keywords.items(), key=lambda x: x[1], reverse=True)[:20])
    
    return StatisticsResponse(
        total_reviews=total_reviews,
        sentiment_distribution=sentiment_dist,
        aspect_statistics=aspect_stats,
        keywords=top_keywords
    )


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "running",
        "model": "PhoBERT ABSA",
        "version": "1.0.0",
        "device": DEVICE
    }


@app.get("/health")
async def health():
    """Detailed health check"""
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "tokenizer_loaded": tokenizer is not None,
        "device": DEVICE
    }


@app.post("/predict", response_model=PredictionResponse)
async def predict_sentiment(request: ReviewRequest):
    """
    Predict sentiment for multiple reviews
    
    Args:
        request: ReviewRequest with list of reviews
        
    Returns:
        PredictionResponse with predictions and statistics
    """
    if model is None or tokenizer is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    if not request.reviews:
        raise HTTPException(status_code=400, detail="No reviews provided")
    
    try:
        # Predict for each review
        predictions = []
        for review in request.reviews:
            pred = predict_single_review(review)
            
            # Calculate overall sentiment (majority vote)
            sentiments = [asp.sentiment for asp in pred['aspects']]
            overall = max(set(sentiments), key=sentiments.count)
            pred['overall_sentiment'] = LABEL_NAMES[overall]
            
            predictions.append(ReviewPrediction(**pred))
        
        # Calculate statistics if requested
        statistics = None
        if request.include_statistics:
            pred_dicts = [pred.model_dump() for pred in predictions]
            statistics = calculate_statistics(pred_dicts)
        
        return PredictionResponse(
            predictions=predictions,
            statistics=statistics
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


if __name__ == "__main__":
    print(f"Starting ABSA API server on {API_HOST}:{API_PORT}")
    uvicorn.run(
        "api:app",
        host=API_HOST,
        port=API_PORT,
        reload=False
    )
