"""
Pre-compute all recommendations for all users
This makes deployment easier (no Python runtime needed in API)
"""

import sys
import os
import json
import numpy as np
import torch

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from lib.ncf_model import ShittyNCF


def precompute_all(data_type: str, top_k: int = 10):
    """Pre-compute recommendations for all users"""
    print(f"Pre-computing recommendations for {data_type}...")
    
    # Load model
    model_path = f"models/{data_type}_ncf.pth"
    if not os.path.exists(model_path):
        print(f"Model not found: {model_path}")
        return
    
    checkpoint = torch.load(model_path, map_location='cpu')
    
    model = ShittyNCF(
        num_users=checkpoint['n_users'],
        num_items=checkpoint['n_items'],
        embedding_dim=checkpoint['embedding_dim'],
        hidden_dims=checkpoint['hidden_dims']
    )
    
    model.load_state_dict(checkpoint['model_state_dict'])
    model.eval()
    
    n_users = checkpoint['n_users']
    n_items = checkpoint['n_items']
    item_ids = np.arange(n_items)
    
    # Generate recommendations for all users
    all_recommendations = {}
    
    for user_id in range(n_users):
        top_items, top_scores = model.get_recommendations(
            user_id=user_id,
            item_ids=item_ids,
            top_k=top_k
        )
        
        all_recommendations[user_id] = [
            {
                "itemId": int(item_id),
                "score": float(score)
            }
            for item_id, score in zip(top_items, top_scores)
        ]
        
        if (user_id + 1) % 50 == 0:
            print(f"  Processed {user_id + 1}/{n_users} users...")
    
    # Save to JSON
    output_dir = "public/recommendations"
    os.makedirs(output_dir, exist_ok=True)
    
    output_path = f"{output_dir}/{data_type}_recommendations.json"
    with open(output_path, 'w') as f:
        json.dump(all_recommendations, f, indent=2)
    
    print(f"[OK] Saved recommendations to {output_path}")
    print(f"  Total users: {n_users}")
    print(f"  Recommendations per user: {top_k}")


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser()
    parser.add_argument("--data-type", type=str, default="all", choices=["ott", "social", "media", "all"])
    parser.add_argument("--top-k", type=int, default=10)
    
    args = parser.parse_args()
    
    data_types = ["ott", "social", "media"] if args.data_type == "all" else [args.data_type]
    
    for data_type in data_types:
        precompute_all(data_type, args.top_k)
        print()

