"""
Train the shitty NCF model
"""

import sys
import os
import json
import numpy as np
import torch

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from lib.ncf_model import ShittyNCF, train_shitty_ncf


def load_data(data_type: str = "ott"):
    """Load synthetic data"""
    data_dir = "data"
    
    user_ids = np.load(f"{data_dir}/{data_type}_user_ids.npy")
    item_ids = np.load(f"{data_dir}/{data_type}_item_ids.npy")
    labels = np.load(f"{data_dir}/{data_type}_labels.npy")
    
    with open(f"{data_dir}/{data_type}_metadata.json", "r") as f:
        metadata = json.load(f)
    
    return user_ids, item_ids, labels, metadata


def main():
    import argparse
    
    parser = argparse.ArgumentParser(description="Train Shitty NCF")
    parser.add_argument("--data-type", type=str, default="ott", choices=["ott", "social", "media"])
    parser.add_argument("--epochs", type=int, default=20)
    parser.add_argument("--batch-size", type=int, default=256)
    parser.add_argument("--lr", type=float, default=0.01)
    parser.add_argument("--embedding-dim", type=int, default=16)
    
    args = parser.parse_args()
    
    print("=" * 50)
    print("Training Shitty NCF Model")
    print("=" * 50)
    print(f"Data type: {args.data_type}")
    print(f"Epochs: {args.epochs}")
    print(f"Batch size: {args.batch_size}")
    print(f"Learning rate: {args.lr}")
    print(f"Embedding dim: {args.embedding_dim}")
    print()
    
    # Load data
    print("Loading data...")
    user_ids, item_ids, labels, metadata = load_data(args.data_type)
    
    n_users = metadata["n_users"]
    n_items = metadata["n_items"]
    
    print(f"  Users: {n_users}")
    print(f"  Items: {n_items}")
    print(f"  Interactions: {len(user_ids)}")
    print()
    
    # Create model
    print("Initializing model...")
    model = ShittyNCF(
        num_users=n_users,
        num_items=n_items,
        embedding_dim=args.embedding_dim,
        hidden_dims=[32, 16]
    )
    
    total_params = sum(p.numel() for p in model.parameters())
    print(f"  Total parameters: {total_params:,}")
    print()
    
    # Train
    print("Training (this will overfit, that's fine)...")
    losses = train_shitty_ncf(
        model=model,
        user_ids=user_ids,
        item_ids=item_ids,
        labels=labels,
        epochs=args.epochs,
        batch_size=args.batch_size,
        learning_rate=args.lr,
        device="cpu"
    )
    
    # Save model
    model_dir = "models"
    os.makedirs(model_dir, exist_ok=True)
    
    model_path = f"{model_dir}/{args.data_type}_ncf.pth"
    torch.save({
        "model_state_dict": model.state_dict(),
        "n_users": n_users,
        "n_items": n_items,
        "embedding_dim": args.embedding_dim,
        "hidden_dims": [32, 16],
        "losses": losses,
        "metadata": metadata
    }, model_path)
    
    print()
    print("=" * 50)
    print(f"Training complete! Model saved to: {model_path}")
    print(f"Final loss: {losses[-1]:.4f}")
    print("=" * 50)


if __name__ == "__main__":
    main()

