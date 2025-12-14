# Project Summary: Shitty NCF

## What We Built

A deliberately minimal implementation of Neural Collaborative Filtering (NCF) with:
- **Interactive web UI** (Next.js + React)
- **CPU-only PyTorch model** (tiny embeddings, small MLP)
- **Synthetic data generator** (OTT/media/social media patterns)
- **Educational blog post** explaining why it's intentionally bad

## Project Structure

```
.
├── app/                          # Next.js app
│   ├── api/                      # API routes
│   │   ├── recommend/           # Python-based inference (complex)
│   │   ├── recommend-simple/    # Pre-computed recommendations (easy)
│   │   └── stats/               # Dataset statistics
│   ├── page.tsx                 # Main UI
│   └── layout.tsx               # App layout
├── lib/                          # Core Python code
│   ├── ncf_model.py             # NCF model implementation
│   └── data_generator.py        # Synthetic data generation
├── scripts/                      # Utility scripts
│   ├── generate_synthetic_data.py
│   ├── train_model.py
│   ├── inference.py
│   └── precompute_recommendations.py
├── data/                         # Generated data (gitignored)
├── models/                       # Trained models (gitignored)
└── Documentation files
```

## Key Features

### 1. Minimal NCF Implementation
- User/item embeddings (16-32 dims)
- MLP for interaction learning
- Binary cross-entropy loss
- No regularization, dropout, or fancy tricks

### 2. Synthetic Data
- OTT (Netflix-like): Popular items, power users, genre preferences
- Social Media (Twitter-like): Viral posts, influencers, echo chambers
- Media (YouTube-like): Trending content, watch time preferences

### 3. Interactive UI
- Select data type (OTT/social/media)
- Choose user ID
- Get top-k recommendations
- View dataset statistics

### 4. Educational Content
- Blog post explaining limitations
- README with "why it's shitty" section
- Code comments explaining trade-offs

## Deployment Options

### Option 1: Pre-computed (Easiest for Vercel)
1. Generate data and train models locally
2. Pre-compute all recommendations: `python scripts/precompute_recommendations.py`
3. Deploy to Vercel (static files + API routes)
4. Use `/api/recommend-simple` endpoint

### Option 2: Hybrid
1. Deploy Next.js frontend to Vercel
2. Deploy Python API to Railway/Render/Fly.io
3. Update API routes to point to external API

### Option 3: Serverless Python
1. Use Vercel Serverless Functions with Python runtime
2. Package model files
3. Handle inference in serverless function

## Next Steps for Open Sourcing

1. **Create GitHub repo:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Shitty NCF implementation"
   git remote add origin https://github.com/yourusername/shitty-ncf.git
   git push -u origin main
   ```

2. **Add topics/tags:**
   - machine-learning
   - recommendation-systems
   - neural-networks
   - pytorch
   - nextjs
   - educational
   - collaborative-filtering

3. **Update README:**
   - Add demo link (once deployed)
   - Add Twitter/social links
   - Add blog post link

4. **Deploy:**
   - Deploy to Vercel
   - Update README with live link
   - Share on Twitter/LinkedIn

5. **Write blog post:**
   - Copy content from BLOG_POST.md
   - Publish on Medium/Dev.to/your blog
   - Link from README

## What Makes It "Shitty"

1. **CPU-only** - No GPU acceleration
2. **Tiny embeddings** - 16-32 dims vs. 128+ in production
3. **Synthetic data** - Doesn't reflect real user behavior
4. **No validation** - No train/test split
5. **Overfitting** - Memorizes training data
6. **No regularization** - No dropout, L2, etc.
7. **Simple negatives** - Random sampling, no hard negatives
8. **Missing features** - No A/B testing, online learning, cold start, etc.

## Why This Matters

- Shows what's actually necessary vs. nice-to-have
- Demonstrates trade-offs in ML systems
- Explains why production systems are complex
- Teaches debugging and limitation awareness
- Provides humility about ML capabilities

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Backend**: Next.js API routes (Python scripts for inference)
- **ML**: PyTorch (CPU-only), NumPy, scikit-learn
- **Deployment**: Vercel (frontend), Railway/Render (optional Python API)

## License

MIT - Free to use, modify, and learn from.

