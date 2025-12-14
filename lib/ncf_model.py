"""
Shitty NCF Model - A deliberately minimal implementation
Based on: Neural Collaborative Filtering (He et al., 2017)

Why it's shitty:
- Tiny embedding dimensions (16-32)
- No dropout, batch norm, or regularization
- Overfits on synthetic data (that's the point)
- CPU-only, no GPU optimization
"""

import torch
import torch.nn as nn
import numpy as np


class ShittyNCF(nn.Module):
    """
    A deliberately minimal Neural Collaborative Filtering model.
    
    Architecture:
    1. Embedding layers for users and items
    2. Concatenate embeddings
    3. Pass through MLP
    4. Sigmoid output for binary classification
    
    No fancy tricks. Just the basics.
    """
    
    def __init__(
        self,
        num_users: int,
        num_items: int,
        embedding_dim: int = 16,  # Tiny embeddings because we're on CPU
        hidden_dims: list = [32, 16],  # Small MLP
    ):
        super(ShittyNCF, self).__init__()
        
        self.num_users = num_users
        self.num_items = num_items
        self.embedding_dim = embedding_dim
        
        # Embedding layers (the "latent factors")
        self.user_embedding = nn.Embedding(num_users, embedding_dim)
        self.item_embedding = nn.Embedding(num_items, embedding_dim)
        
        # MLP layers (the "neural" part)
        input_dim = embedding_dim * 2  # Concatenated user + item embeddings
        
        layers = []
        prev_dim = input_dim
        for hidden_dim in hidden_dims:
            layers.append(nn.Linear(prev_dim, hidden_dim))
            layers.append(nn.ReLU())
            prev_dim = hidden_dim
        
        # Output layer
        layers.append(nn.Linear(prev_dim, 1))
        layers.append(nn.Sigmoid())
        
        self.mlp = nn.Sequential(*layers)
        
        # Initialize embeddings (Xavier uniform, because why not)
        nn.init.xavier_uniform_(self.user_embedding.weight)
        nn.init.xavier_uniform_(self.item_embedding.weight)
    
    def forward(self, user_ids: torch.Tensor, item_ids: torch.Tensor) -> torch.Tensor:
        """
        Forward pass: predict interaction probability
        
        Args:
            user_ids: Tensor of user indices [batch_size]
            item_ids: Tensor of item indices [batch_size]
        
        Returns:
            Interaction probabilities [batch_size, 1]
        """
        # Get embeddings
        user_emb = self.user_embedding(user_ids)  # [batch_size, embedding_dim]
        item_emb = self.item_embedding(item_ids)  # [batch_size, embedding_dim]
        
        # Concatenate (the "interaction" part)
        interaction = torch.cat([user_emb, item_emb], dim=1)  # [batch_size, 2*embedding_dim]
        
        # Pass through MLP
        output = self.mlp(interaction)  # [batch_size, 1]
        
        return output
    
    def predict(self, user_ids: np.ndarray, item_ids: np.ndarray) -> np.ndarray:
        """
        Predict interaction probabilities for user-item pairs
        
        Args:
            user_ids: Array of user indices
            item_ids: Array of item indices
        
        Returns:
            Interaction probabilities
        """
        self.eval()
        with torch.no_grad():
            user_tensor = torch.LongTensor(user_ids)
            item_tensor = torch.LongTensor(item_ids)
            
            predictions = self.forward(user_tensor, item_tensor)
            return predictions.numpy().flatten()
    
    def get_recommendations(
        self, 
        user_id: int, 
        item_ids: np.ndarray, 
        top_k: int = 10
    ) -> tuple:
        """
        Get top-k recommendations for a user
        
        Args:
            user_id: User index
            item_ids: Array of candidate item indices
            top_k: Number of recommendations
        
        Returns:
            (item_ids, scores) tuple
        """
        # Predict for all items
        user_array = np.full(len(item_ids), user_id)
        scores = self.predict(user_array, item_ids)
        
        # Get top-k
        top_indices = np.argsort(scores)[::-1][:top_k]
        top_items = item_ids[top_indices]
        top_scores = scores[top_indices]
        
        return top_items, top_scores


def train_shitty_ncf(
    model: ShittyNCF,
    user_ids: np.ndarray,
    item_ids: np.ndarray,
    labels: np.ndarray,
    epochs: int = 10,
    batch_size: int = 256,
    learning_rate: float = 0.01,
    device: str = "cpu"
) -> list:
    """
    Train the model (the shitty way - no validation, no early stopping)
    
    Args:
        model: ShittyNCF model
        user_ids: Training user indices
        item_ids: Training item indices
        labels: Binary interaction labels (0 or 1)
        epochs: Number of epochs (we'll overfit, that's fine)
        batch_size: Batch size
        learning_rate: Learning rate
        device: Device to train on (probably "cpu")
    
    Returns:
        List of losses per epoch
    """
    model.train()
    model = model.to(device)
    
    criterion = nn.BCELoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=learning_rate)
    
    # Convert to tensors
    user_tensor = torch.LongTensor(user_ids)
    item_tensor = torch.LongTensor(item_ids)
    label_tensor = torch.FloatTensor(labels)
    
    losses = []
    n_samples = len(user_ids)
    
    for epoch in range(epochs):
        epoch_loss = 0.0
        n_batches = 0
        
        # Shuffle (kind of)
        indices = np.random.permutation(n_samples)
        
        for i in range(0, n_samples, batch_size):
            batch_indices = indices[i:i + batch_size]
            
            batch_users = user_tensor[batch_indices].to(device)
            batch_items = item_tensor[batch_indices].to(device)
            batch_labels = label_tensor[batch_indices].to(device)
            
            # Forward pass
            predictions = model(batch_users, batch_items).squeeze()
            loss = criterion(predictions, batch_labels)
            
            # Backward pass
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()
            
            epoch_loss += loss.item()
            n_batches += 1
        
        avg_loss = epoch_loss / n_batches
        losses.append(avg_loss)
        
        if (epoch + 1) % 5 == 0:
            print(f"Epoch {epoch + 1}/{epochs}, Loss: {avg_loss:.4f}")
    
    return losses

