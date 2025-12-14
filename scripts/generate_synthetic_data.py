"""
Generate synthetic data for training the shitty NCF model
"""

import sys
import os
import json
import numpy as np

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from lib.data_generator import (
    generate_ott_data,
    generate_social_media_data,
    generate_media_data,
    generate_negative_samples
)


def main():
    print("Generating synthetic data for Shitty NCF...")
    print("=" * 50)
    
    # Configuration
    n_users = 200
    n_items = 100
    data_types = ["ott", "social", "media"]
    
    all_data = {}
    
    for data_type in data_types:
        print(f"\nGenerating {data_type.upper()} data...")
        
        if data_type == "ott":
            user_ids, item_ids, labels, metadata = generate_ott_data(
                n_users=n_users,
                n_items=n_items,
                sparsity=0.9
            )
        elif data_type == "social":
            user_ids, item_ids, labels, metadata = generate_social_media_data(
                n_users=n_users,
                n_items=n_items,
                sparsity=0.85
            )
        elif data_type == "media":
            user_ids, item_ids, labels, metadata = generate_media_data(
                n_users=n_users,
                n_items=n_items,
                sparsity=0.88
            )
        
        # Generate negative samples
        print("  Generating negative samples...")
        neg_users, neg_items, neg_labels = generate_negative_samples(
            user_ids, item_ids, n_users, n_items, n_negative=len(user_ids)
        )
        
        # Combine positive and negative
        all_user_ids = np.concatenate([user_ids, neg_users])
        all_item_ids = np.concatenate([item_ids, neg_items])
        all_labels = np.concatenate([labels, neg_labels])
        
        # Shuffle
        indices = np.random.permutation(len(all_user_ids))
        all_user_ids = all_user_ids[indices]
        all_item_ids = all_item_ids[indices]
        all_labels = all_labels[indices]
        
        # Save
        data_dir = "data"
        os.makedirs(data_dir, exist_ok=True)
        
        np.save(f"{data_dir}/{data_type}_user_ids.npy", all_user_ids)
        np.save(f"{data_dir}/{data_type}_item_ids.npy", all_item_ids)
        np.save(f"{data_dir}/{data_type}_labels.npy", all_labels)
        
        # Save metadata
        metadata["n_positive"] = int(np.sum(labels))
        metadata["n_negative"] = len(neg_labels)
        metadata["n_total"] = len(all_labels)
        
        with open(f"{data_dir}/{data_type}_metadata.json", "w") as f:
            json.dump(metadata, f, indent=2)
        
        print(f"  [OK] Generated {len(all_user_ids)} interactions")
        print(f"    - Positive: {metadata['n_positive']}")
        print(f"    - Negative: {metadata['n_negative']}")
        print(f"    - Sparsity: {metadata['sparsity']:.2%}")
    
    print("\n" + "=" * 50)
    print("Data generation complete!")
    print(f"Data saved to: {data_dir}/")


if __name__ == "__main__":
    main()

