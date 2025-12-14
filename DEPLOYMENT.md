# Deployment Guide

## Local Development

1. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Generate synthetic data:**
   ```bash
   python scripts/generate_synthetic_data.py
   ```

3. **Train models (optional, pre-trained weights can be included):**
   ```bash
   python scripts/train_model.py --data-type ott
   python scripts/train_model.py --data-type social
   python scripts/train_model.py --data-type media
   ```

4. **Install Node dependencies:**
   ```bash
   npm install
   ```

5. **Run dev server:**
   ```bash
   npm run dev
   ```

6. **Open browser:**
   Navigate to `http://localhost:3000`

## Vercel Deployment

### Option 1: Simple Deployment (Static)

1. **Build the Next.js app:**
   ```bash
   npm run build
   ```

2. **Deploy to Vercel:**
   ```bash
   vercel
   ```

3. **Note:** The Python inference will need to be handled differently. Consider:
   - Using Vercel Serverless Functions with a Python runtime
   - Or pre-computing recommendations and serving them as static JSON
   - Or using a separate API service (Railway, Render, etc.)

### Option 2: Hybrid Deployment

1. **Deploy Next.js frontend to Vercel**
2. **Deploy Python API to a separate service:**
   - Railway (easy Python support)
   - Render (free tier available)
   - Fly.io (good for Python apps)

3. **Update API routes** to point to your Python API endpoint

### Option 3: Pre-compute Recommendations

Since the data is synthetic and small, you can pre-compute all recommendations:

```python
# scripts/precompute_recommendations.py
import numpy as np
import json
from lib.ncf_model import ShittyNCF
import torch

# Load model and generate all recommendations
# Save as JSON files
# Serve from Next.js static files
```

Then update the API routes to read from static JSON files instead of calling Python.

## Environment Variables

No environment variables needed for the basic setup. If you add features like:
- Database connections
- External APIs
- Authentication

Add them to `.env.local` and configure in Vercel dashboard.

## Troubleshooting

### Python not found in API routes
- Vercel doesn't support Python in API routes by default
- Use one of the deployment options above
- Or use a Python runtime like Pyodide (browser-based)

### Model files too large
- Git LFS for model files
- Or host models on a CDN
- Or use smaller models (already using tiny embeddings)

### Slow inference
- Pre-compute recommendations
- Use caching (Redis, Vercel KV)
- Optimize model (quantization, pruning)

