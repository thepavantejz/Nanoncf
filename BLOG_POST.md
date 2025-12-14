# Why This Neural Collaborative Filtering Implementation Is Shitty (And Why That Matters)

*Or: What I learned by building a deliberately bad recommendation system*

## The Setup

I read the [Neural Collaborative Filtering paper](https://arxiv.org/abs/1708.05031) and thought: "This is cool, but what if I built a version that's intentionally bad?" So I did. And here's why it's shitty, and more importantly, why understanding *why* it's shitty teaches you more than building a polished version ever could.

## What Is This Thing?

Neural Collaborative Filtering (NCF) is a neural network approach to recommendation systems. Instead of using matrix factorization (which uses an inner product to model user-item interactions), NCF uses a multi-layer perceptron to learn more complex interaction patterns.

The paper shows impressive results. My implementation... doesn't. And that's the point.

## Why It's Shitty

### 1. CPU-Only, Tiny Embeddings

**The Problem:** I used 16-32 dimensional embeddings and trained on CPU. Production systems use 128-512 dimensions and train on GPUs.

**Why It Matters:** Embedding dimensions determine how much information you can encode about users and items. With 16 dimensions, you're basically saying "users can be described by 16 numbers." That's... reductive. Real systems need more dimensions to capture nuanced preferences.

**The Trade-off:** Smaller embeddings = faster training, less memory, but worse recommendations. This is a fundamental trade-off in ML: model capacity vs. computational cost.

### 2. Synthetic Data That Doesn't Reflect Reality

**The Problem:** I generated fake user interactions using simple statistical patterns. Real user behavior is messy, non-stationary, and full of edge cases.

**Why It Matters:** Real recommendation systems fail because:
- Users change preferences over time (concept drift)
- Items have lifecycles (trending → popular → niche)
- External events affect behavior (viral content, news cycles)
- Cold start problems (new users, new items)

My synthetic data has none of these. It's clean, predictable, and perfect for overfitting.

**The Lesson:** Data quality > model complexity. A simple model on good data beats a complex model on bad data.

### 3. No Proper Validation

**The Problem:** I didn't split the data into train/validation/test sets. I just trained on everything and called it a day.

**Why It Matters:** Without validation, you have no idea if your model generalizes. You could be:
- Overfitting to training data
- Memorizing patterns that don't exist in real data
- Failing silently on edge cases

**The Lesson:** Validation isn't optional. It's how you know your model actually works.

### 4. Overfitting Is a Feature, Not a Bug

**The Problem:** The model memorizes the synthetic data patterns. On the training data, it performs perfectly. On anything else? Who knows.

**Why It Matters:** Overfitting is the #1 problem in ML. Real systems need:
- Regularization (dropout, L2, etc.)
- Early stopping
- Cross-validation
- Ensemble methods

I used none of these. The model overfits, and that's fine for a demo, but it would fail catastrophically in production.

**The Lesson:** A model that performs well on training data but fails on new data is worse than useless—it gives false confidence.

### 5. No Hard Negative Mining

**The Problem:** I generate negative samples randomly. Real systems use hard negative mining (sampling items that are similar to positive items but not interacted with).

**Why It Matters:** Random negatives are easy to distinguish. Hard negatives are similar to positives, making the learning task harder and the model better.

**The Lesson:** The quality of your negative samples matters as much as your positive samples.

### 6. Missing Production Features

**The Problem:** This implementation has:
- No A/B testing framework
- No online learning (can't update with new data)
- No cold start handling (new users/items)
- No explainability (why did you recommend this?)
- No diversity constraints (all recommendations might be similar)
- No fairness considerations (might bias against certain groups)

**Why It Matters:** Production recommendation systems are complex not because the algorithm is hard, but because the real world is messy. You need:
- Infrastructure for serving predictions at scale
- Monitoring for model drift
- Feedback loops for continuous improvement
- Ethical considerations for fairness and transparency

**The Lesson:** The algorithm is 10% of the work. The other 90% is making it work in production.

## What This Teaches Us

### 1. Simplicity Has Value

By stripping away all the complexity, I can see what the core algorithm actually needs:
- Embeddings for users and items
- A way to combine them (concatenation + MLP)
- A loss function (binary cross-entropy)
- An optimizer (Adam)

Everything else is optimization, not fundamental.

### 2. Understanding Limitations > Chasing Performance

Most ML demos show you the polished version. They hide the failures, the edge cases, the trade-offs. This implementation shows you:
- What happens when you use tiny embeddings
- What happens when you overfit
- What happens when you use bad data

Understanding these failures teaches you more than seeing a model that "works."

### 3. The Gap Between Research and Production

The paper shows impressive results on real datasets. My implementation shows what happens when you:
- Don't have access to real data
- Don't have GPU compute
- Don't have time to tune hyperparameters
- Don't have infrastructure for production

The gap between "this works in a paper" and "this works in production" is huge.

### 4. Recommendation Systems Are Hard

Not because the math is hard (it's not), but because:
- User behavior is unpredictable
- Data is sparse and noisy
- Requirements change constantly
- Scale matters (100 users vs. 100M users)
- Ethics matter (filter bubbles, echo chambers, bias)

A simple model that works is better than a complex model that doesn't.

## The Real Question

Is this implementation actually shitty? Or is it just... minimal?

I think it's both. It's shitty for production use, but it's good for learning. It shows you:
- What the algorithm needs (minimal viable implementation)
- What production needs (everything else)
- The trade-offs you make (simplicity vs. performance)

And that's valuable.

## What Would Make It Less Shitty?

If I wanted to make this production-ready (which I don't), I would:

1. **Use real data** - Real user interactions, real items, real patterns
2. **Proper validation** - Train/val/test splits, cross-validation, holdout sets
3. **Regularization** - Dropout, L2, early stopping
4. **Better negatives** - Hard negative mining, popularity-based sampling
5. **Larger embeddings** - 128+ dimensions, trained on GPU
6. **Production infrastructure** - Model serving, monitoring, A/B testing
7. **Cold start handling** - Content-based features, popularity fallbacks
8. **Explainability** - Why did you recommend this? Show the reasoning
9. **Diversity** - Ensure recommendations aren't all similar
10. **Fairness** - Monitor for bias, ensure equal representation

But that would defeat the purpose. This is intentionally minimal. It's a learning tool, not a production system.

## The Takeaway

Building a "shitty" version of something teaches you:
1. What's actually necessary vs. what's nice-to-have
2. The trade-offs you make in real systems
3. Why production systems are complex (they solve problems this doesn't)
4. How to debug when things go wrong

Most importantly, it teaches you humility. ML isn't magic. It's engineering. And engineering is about making trade-offs, understanding limitations, and building systems that work in the real world.

So yes, this implementation is shitty. And that's exactly why it's useful.

---

*Want to try it yourself? Check out the [GitHub repo](https://github.com/yourusername/shitty-ncf) and see how bad it really is.*

*Have thoughts? Disagree? Think I'm missing something? [Let me know on Twitter](https://twitter.com/yourusername). This is meant to be educational and opinionated. Let's argue about it.*

