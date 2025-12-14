# Shitty NCF: A Deliberately Bad Neural Collaborative Filtering Demo

> "The best way to learn why something works is to build a version that doesn't." - Me, probably

This is a **deliberately simplified and opinionated** implementation of Neural Collaborative Filtering (NCF) from the paper ["Neural Collaborative Filtering"](https://arxiv.org/abs/1708.05031). 

## Why This Exists

Most ML demos show you the polished, production-ready version. This one shows you the **shitty** version - the one that runs on your laptop CPU, uses synthetic data, and makes questionable design choices. Why? Because understanding the limitations and trade-offs is just as important as understanding the algorithm.

## What's "Shitty" About It?

1. **CPU-only**: No GPU acceleration, because not everyone has one
2. **Tiny embeddings**: 16-32 dimensions because we're not training on Netflix-scale data
3. **Synthetic data**: Generated OTT/media/social media interactions that don't reflect real user behavior
4. **No proper validation**: Train/test split? What's that?
5. **Overfitting is a feature**: The model will memorize your synthetic data and you'll like it
6. **Opinionated architecture**: Made choices that make sense for a demo, not production

## Tech Stack

- **Frontend**: Next.js + React (deployed on Vercel)
- **Backend**: Flask API (can be serverless)
- **Model**: PyTorch (CPU-only, small models)
- **Data**: NumPy-generated synthetic data

## Quick Start

```bash
# Install Python dependencies
pip install -r requirements.txt

# Generate synthetic data
python scripts/generate_synthetic_data.py

# Train the model (optional, pre-trained weights included)
python scripts/train_model.py

# Install Node dependencies
npm install

# Run dev server
npm run dev
```

## Project Structure

```
.
├── app/                    # Next.js app directory
├── components/            # React components
├── lib/                   # Model and utilities
│   ├── ncf_model.py      # The "shitty" NCF implementation
│   └── data_generator.py  # Synthetic data generator
├── scripts/               # Training and data generation scripts
├── public/                # Static assets
└── api/                   # API routes (if using Next.js API)
```

## The Model

Our NCF implementation is intentionally minimal:
- **Embedding layers** for users and items (tiny dimensions)
- **Multi-layer perceptron** for learning interactions (2-3 layers max)
- **Binary cross-entropy loss** for implicit feedback
- **No fancy tricks**: No dropout, no batch norm, no attention, no transformers

## Synthetic Data

We generate fake interactions for:
- **OTT platforms**: Netflix-style watch history
- **Social media**: Twitter-like engagement patterns
- **Media**: YouTube-style video preferences

The data is **obviously synthetic** - that's the point. Real recommendation systems need real data, and real data is messy.

## Why This Matters

Building a "shitty" version teaches you:
1. What the algorithm actually needs vs. what's nice-to-have
2. The trade-offs between simplicity and performance
3. Why production systems are complex (they solve problems this doesn't)
4. How to debug ML models when things go wrong

## License

MIT - Do whatever you want with this. It's intentionally shitty, so expectations are low.

## Contributing

This is intentionally minimal. If you want to make it less shitty, fork it and make your own version. The whole point is to show the bare minimum that "works."

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions, including Vercel setup.

## Blog Post

Read [BLOG_POST.md](BLOG_POST.md) for a deep dive into why this implementation is shitty and what that teaches us about recommendation systems.

## License

MIT - See [LICENSE](LICENSE) for details.

---

**Built with ❤️ and intentionally minimal code.**
