"""
PhoBERT Multi-Aspect Sentiment Analysis Model
"""
import torch
from torch import nn
from transformers import AutoModel
from transformers.modeling_outputs import SequenceClassifierOutput


class PhoBERTMultiAspectClassifier(nn.Module):
    """
    PhoBERT-based classifier for multi-aspect sentiment analysis
    """
    def __init__(self, model_name: str, num_aspects: int, num_labels: int, 
                 ignore_index: int, dropout: float = 0.2):
        super().__init__()
        self.num_aspects = num_aspects
        self.num_labels = num_labels
        self.ignore_index = ignore_index
        
        # Load PhoBERT backbone
        self.backbone = AutoModel.from_pretrained(model_name)
        hidden_size = self.backbone.config.hidden_size
        
        # Dropout and classifier head
        self.dropout = nn.Dropout(dropout)
        self.classifier = nn.Linear(hidden_size, num_aspects * num_labels)
    
    def forward(self, input_ids, attention_mask, token_type_ids=None, labels=None):
        """
        Forward pass
        Args:
            input_ids: Input token IDs
            attention_mask: Attention mask
            token_type_ids: Token type IDs (optional)
            labels: Ground truth labels (optional)
        Returns:
            SequenceClassifierOutput with loss and logits
        """
        # Get PhoBERT outputs
        outputs = self.backbone(input_ids=input_ids, attention_mask=attention_mask)
        
        # Use [CLS] token representation
        pooled = outputs.last_hidden_state[:, 0]
        
        # Apply dropout and classifier
        dropped = self.dropout(pooled)
        logits = self.classifier(dropped)
        
        # Reshape logits to [batch_size, num_aspects, num_labels]
        logits = logits.view(-1, self.num_aspects, self.num_labels)
        
        # Compute loss if labels provided
        loss = None
        if labels is not None:
            loss_fct = nn.CrossEntropyLoss(ignore_index=self.ignore_index)
            loss = loss_fct(logits.view(-1, self.num_labels), labels.view(-1))
        
        return SequenceClassifierOutput(loss=loss, logits=logits)
