# Quick Setup Guide

## Prerequisites

- Python 3.8+
- Node.js 18+
- pip
- npm

## One-Time Setup

```bash
# 1. Clone the repo
git clone https://github.com/yourusername/shitty-ncf.git
cd shitty-ncf

# 2. Install Python dependencies
pip install -r requirements.txt

# 3. Generate synthetic data
python scripts/generate_synthetic_data.py

# 4. Train models (this might take a few minutes on CPU)
python scripts/train_model.py --data-type ott
python scripts/train_model.py --data-type social
python scripts/train_model.py --data-type media

# 5. Install Node dependencies
npm install
```

## Running Locally

```bash
# Start the dev server
npm run dev

# Open http://localhost:3000
```

## Optional: Pre-compute Recommendations

For faster API responses, pre-compute all recommendations:

```bash
python scripts/precompute_recommendations.py --data-type all
```

Then update the API routes to use the pre-computed JSON files instead of calling Python.

## Troubleshooting

### "Model not found" error
- Make sure you've trained the models: `python scripts/train_model.py --data-type ott`

### "Python not found" in API routes
- This is expected on Vercel. Use pre-computed recommendations or deploy Python API separately.

### Slow inference
- That's the point! It's running on CPU with tiny models. Pre-compute recommendations for faster responses.

