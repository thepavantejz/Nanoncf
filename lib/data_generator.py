"""
Synthetic Data Generator for OTT/Media/Social Media Recommendations

Why it's shitty:
- Obviously fake patterns
- No real user behavior modeling
- Simple statistical distributions
- Perfect for overfitting
"""

import numpy as np
import pandas as pd
from typing import Tuple, Dict, List


def generate_ott_data(
    n_users: int = 100,
    n_items: int = 50,
    sparsity: float = 0.9,  # 90% of interactions missing
    seed: int = 42
) -> Tuple[np.ndarray, np.ndarray, np.ndarray, Dict]:
    """
    Generate synthetic OTT (Netflix-like) watch history data
    
    Creates fake patterns:
    - Some users are "action movie lovers"
    - Some items are "popular hits"
    - Some users watch everything (power users)
    - Some items are niche (long tail)
    """
    np.random.seed(seed)
    
    # Create user and item IDs
    user_ids = np.arange(n_users)
    item_ids = np.arange(n_items)
    
    # Generate interaction matrix with patterns
    interactions = []
    
    # Pattern 1: Popular items (20% of items get 60% of views)
    popular_items = np.random.choice(item_ids, size=int(n_items * 0.2), replace=False)
    
    # Pattern 2: Power users (10% of users watch 40% of content)
    power_users = np.random.choice(user_ids, size=int(n_users * 0.1), replace=False)
    
    # Pattern 3: Genre preferences (fake genres)
    n_genres = 5
    user_genre_pref = np.random.dirichlet([2, 2, 2, 2, 2], size=n_users)
    item_genres = np.random.multinomial(1, [0.2] * n_genres, size=n_items)
    
    # Generate interactions
    n_interactions = int(n_users * n_items * (1 - sparsity))
    
    for _ in range(n_interactions):
        user_id = np.random.choice(user_ids)
        item_id = np.random.choice(item_ids)
        
        # Calculate interaction probability based on patterns
        prob = 0.1  # Base probability
        
        # Popular items get more views
        if item_id in popular_items:
            prob += 0.3
        
        # Power users watch more
        if user_id in power_users:
            prob += 0.2
        
        # Genre preference match
        user_pref = user_genre_pref[user_id]
        item_genre = item_genres[item_id]
        genre_match = np.dot(user_pref, item_genre)
        prob += genre_match * 0.2
        
        # Add some noise
        prob += np.random.uniform(-0.1, 0.1)
        prob = np.clip(prob, 0, 1)
        
        if np.random.random() < prob:
            interactions.append((user_id, item_id))
    
    # Convert to arrays
    interactions = np.array(interactions)
    user_ids_array = interactions[:, 0]
    item_ids_array = interactions[:, 1]
    labels = np.ones(len(interactions))  # All are positive interactions
    
    metadata = {
        "type": "OTT",
        "n_users": n_users,
        "n_items": n_items,
        "n_interactions": len(interactions),
        "sparsity": 1 - len(interactions) / (n_users * n_items),
        "popular_items": popular_items.tolist(),
        "power_users": power_users.tolist(),
    }
    
    return user_ids_array, item_ids_array, labels, metadata


def generate_social_media_data(
    n_users: int = 100,
    n_items: int = 50,
    sparsity: float = 0.85,
    seed: int = 42
) -> Tuple[np.ndarray, np.ndarray, np.ndarray, Dict]:
    """
    Generate synthetic social media engagement data (Twitter-like)
    
    Patterns:
    - Viral posts (some items get massive engagement)
    - Influencer users (some users engage with everything)
    - Echo chambers (users prefer similar content)
    """
    np.random.seed(seed)
    
    user_ids = np.arange(n_users)
    item_ids = np.arange(n_items)
    
    interactions = []
    
    # Viral posts (5% of items get 50% of engagement)
    viral_items = np.random.choice(item_ids, size=int(n_items * 0.05), replace=False)
    
    # Influencer users (5% of users generate 30% of engagement)
    influencers = np.random.choice(user_ids, size=int(n_users * 0.05), replace=False)
    
    # User "interests" (clusters)
    n_clusters = 3
    user_clusters = np.random.randint(0, n_clusters, size=n_users)
    item_clusters = np.random.randint(0, n_clusters, size=n_items)
    
    n_interactions = int(n_users * n_items * (1 - sparsity))
    
    for _ in range(n_interactions):
        user_id = np.random.choice(user_ids)
        item_id = np.random.choice(item_ids)
        
        prob = 0.15  # Base probability
        
        # Viral items
        if item_id in viral_items:
            prob += 0.4
        
        # Influencers engage more
        if user_id in influencers:
            prob += 0.25
        
        # Echo chamber effect (same cluster = higher engagement)
        if user_clusters[user_id] == item_clusters[item_id]:
            prob += 0.15
        
        prob += np.random.uniform(-0.1, 0.1)
        prob = np.clip(prob, 0, 1)
        
        if np.random.random() < prob:
            interactions.append((user_id, item_id))
    
    interactions = np.array(interactions)
    user_ids_array = interactions[:, 0]
    item_ids_array = interactions[:, 1]
    labels = np.ones(len(interactions))
    
    metadata = {
        "type": "Social Media",
        "n_users": n_users,
        "n_items": n_items,
        "n_interactions": len(interactions),
        "sparsity": 1 - len(interactions) / (n_users * n_items),
        "viral_items": viral_items.tolist(),
        "influencers": influencers.tolist(),
    }
    
    return user_ids_array, item_ids_array, labels, metadata


def generate_media_data(
    n_users: int = 100,
    n_items: int = 50,
    sparsity: float = 0.88,
    seed: int = 42
) -> Tuple[np.ndarray, np.ndarray, np.ndarray, Dict]:
    """
    Generate synthetic media consumption data (YouTube-like)
    
    Patterns:
    - Trending content
    - User preferences (some like short videos, some like long)
    - Time-based patterns (fake)
    """
    np.random.seed(seed)
    
    user_ids = np.arange(n_users)
    item_ids = np.arange(n_items)
    
    interactions = []
    
    # Trending items
    trending_items = np.random.choice(item_ids, size=int(n_items * 0.15), replace=False)
    
    # User "watch time preference" (fake)
    user_preferences = np.random.beta(2, 5, size=n_users)  # Most prefer shorter content
    item_duration = np.random.beta(5, 2, size=n_items)  # Most items are longer
    
    n_interactions = int(n_users * n_items * (1 - sparsity))
    
    for _ in range(n_interactions):
        user_id = np.random.choice(user_ids)
        item_id = np.random.choice(item_ids)
        
        prob = 0.12
        
        # Trending
        if item_id in trending_items:
            prob += 0.35
        
        # Preference match (inverse - users prefer content opposite their preference, because why not)
        preference_match = 1 - abs(user_preferences[user_id] - item_duration[item_id])
        prob += preference_match * 0.2
        
        prob += np.random.uniform(-0.1, 0.1)
        prob = np.clip(prob, 0, 1)
        
        if np.random.random() < prob:
            interactions.append((user_id, item_id))
    
    interactions = np.array(interactions)
    user_ids_array = interactions[:, 0]
    item_ids_array = interactions[:, 1]
    labels = np.ones(len(interactions))
    
    metadata = {
        "type": "Media",
        "n_users": n_users,
        "n_items": n_items,
        "n_interactions": len(interactions),
        "sparsity": 1 - len(interactions) / (n_users * n_items),
        "trending_items": trending_items.tolist(),
    }
    
    return user_ids_array, item_ids_array, labels, metadata


def generate_negative_samples(
    user_ids: np.ndarray,
    item_ids: np.ndarray,
    n_users: int,
    n_items: int,
    n_negative: int = None
) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
    """
    Generate negative samples (items users haven't interacted with)
    
    This is the "shitty" way - just random sampling, no hard negative mining
    """
    if n_negative is None:
        n_negative = len(user_ids)  # 1:1 ratio
    
    # Create set of positive interactions for fast lookup
    positive_set = set(zip(user_ids, item_ids))
    
    negative_users = []
    negative_items = []
    
    while len(negative_users) < n_negative:
        user_id = np.random.randint(0, n_users)
        item_id = np.random.randint(0, n_items)
        
        if (user_id, item_id) not in positive_set:
            negative_users.append(user_id)
            negative_items.append(item_id)
    
    negative_labels = np.zeros(len(negative_users))
    
    return (
        np.array(negative_users),
        np.array(negative_items),
        negative_labels
    )

