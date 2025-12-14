"""
Inference script for Shitty NCF model
Called from Next.js API route
"""

import sys
import os
import json
import numpy as np
import torch

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from lib.ncf_model import ShittyNCF


def load_model(data_type: str):
    """Load trained model"""
    model_path = f"models/{data_type}_ncf.pth"
    
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model not found: {model_path}")
    
    checkpoint = torch.load(model_path, map_location='cpu')
    
    model = ShittyNCF(
        num_users=checkpoint['n_users'],
        num_items=checkpoint['n_items'],
        embedding_dim=checkpoint['embedding_dim'],
        hidden_dims=checkpoint['hidden_dims']
    )
    
    model.load_state_dict(checkpoint['model_state_dict'])
    model.eval()
    
    return model, checkpoint


def main():
    import argparse
    
    parser = argparse.ArgumentParser(description="Inference for Shitty NCF")
    parser.add_argument("--data-type", type=str, required=True)
    parser.add_argument("--user-id", type=int, required=True)
    parser.add_argument("--top-k", type=int, default=10)
    
    args = parser.parse_args()
    
    # Load model
    model, checkpoint = load_model(args.data_type)
    
    # Get all item IDs
    n_items = checkpoint['n_items']
    item_ids = np.arange(n_items)
    
    # Get recommendations
    top_items, top_scores = model.get_recommendations(
        user_id=args.user_id,
        item_ids=item_ids,
        top_k=args.top_k
    )
    
    # Format output
    recommendations = [
        {
            "itemId": int(item_id),
            "score": float(score)
        }
        for item_id, score in zip(top_items, top_scores)
    ]
    
    result = {
        "userId": args.user_id,
        "recommendations": recommendations
    }
    
    # Output JSON (will be captured by Next.js API)
    print(json.dumps(result))


if __name__ == "__main__":
    main()

