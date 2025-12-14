'use client'

import { useState, useEffect } from 'react'
import './globals.css'

interface Recommendation {
  itemId: number
  score: number
}

interface ModelStats {
  nUsers: number
  nItems: number
  nInteractions: number
  sparsity: number
}

export default function Home() {
  const [dataType, setDataType] = useState<string>('ott')
  const [userId, setUserId] = useState<number>(0)
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<ModelStats | null>(null)
  const [maxUserId, setMaxUserId] = useState<number>(199)

  useEffect(() => {
    // Load stats when data type changes
    loadStats()
  }, [dataType])

  const loadStats = async () => {
    try {
      const response = await fetch(`/api/stats?type=${dataType}`)
      if (response.ok) {
        const data = await response.json()
        setStats(data)
        setMaxUserId(data.nUsers - 1)
        setUserId(0)
      }
    } catch (err) {
      console.error('Failed to load stats:', err)
    }
  }

  const getRecommendations = async () => {
    setLoading(true)
    setError(null)
    setRecommendations([])

    try {
      const response = await fetch('/api/recommend-simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dataType,
          userId,
          topK: 10,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to get recommendations')
      }

      const data = await response.json()
      setRecommendations(data.recommendations)
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <div className="header">
        <h1>🎬 Shitty NCF Demo</h1>
        <p>
          A deliberately minimal Neural Collaborative Filtering implementation.
          Built to be educational, not production-ready.
        </p>
      </div>

      <div className="card">
        <h2>Configuration</h2>
        <div className="input-group">
          <label htmlFor="dataType">Data Type</label>
          <select
            id="dataType"
            value={dataType}
            onChange={(e) => setDataType(e.target.value)}
          >
            <option value="ott">OTT (Netflix-like)</option>
            <option value="social">Social Media (Twitter-like)</option>
            <option value="media">Media (YouTube-like)</option>
          </select>
        </div>

        <div className="input-group">
          <label htmlFor="userId">
            User ID (0 - {maxUserId})
          </label>
          <input
            id="userId"
            type="number"
            min="0"
            max={maxUserId}
            value={userId}
            onChange={(e) => setUserId(parseInt(e.target.value) || 0)}
          />
        </div>

        <button
          className="button"
          onClick={getRecommendations}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Get Recommendations'}
        </button>
      </div>

      {stats && (
        <div className="card">
          <h2>Dataset Statistics</h2>
          <div className="stats">
            <div className="stat">
              <div className="stat-value">{stats.nUsers}</div>
              <div className="stat-label">Users</div>
            </div>
            <div className="stat">
              <div className="stat-value">{stats.nItems}</div>
              <div className="stat-label">Items</div>
            </div>
            <div className="stat">
              <div className="stat-value">{stats.nInteractions.toLocaleString()}</div>
              <div className="stat-label">Interactions</div>
            </div>
            <div className="stat">
              <div className="stat-value">{(stats.sparsity * 100).toFixed(1)}%</div>
              <div className="stat-label">Sparsity</div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="error">
          <strong>Error:</strong> {error}
        </div>
      )}

      {loading && (
        <div className="loading">
          Generating recommendations... (this might take a moment on CPU)
        </div>
      )}

      {recommendations.length > 0 && (
        <div className="card">
          <h2>Top Recommendations for User {userId}</h2>
          <div className="recommendations">
            {recommendations.map((rec, idx) => (
              <div key={rec.itemId} className="recommendation-item">
                <div style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                  Item {rec.itemId}
                </div>
                <div className="score">
                  Score: {rec.score.toFixed(4)}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#666', marginTop: '0.5rem' }}>
                  Rank #{idx + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <h2>Why This Is Shitty</h2>
        <ul style={{ lineHeight: '1.8', color: '#ccc' }}>
          <li>Runs on CPU only (no GPU acceleration)</li>
          <li>Tiny embedding dimensions (16-32 vs. 128+ in production)</li>
          <li>Synthetic data that doesn't reflect real user behavior</li>
          <li>No proper train/validation/test split</li>
          <li>Overfits on synthetic data (by design)</li>
          <li>No regularization, dropout, or other fancy tricks</li>
          <li>Simple random negative sampling (no hard negatives)</li>
          <li>No A/B testing, no online learning, no cold start handling</li>
        </ul>
        <p style={{ marginTop: '1rem', color: '#999', fontSize: '0.9rem' }}>
          But that's the point. Understanding limitations teaches you more than
          seeing a polished demo. Read the blog post for a deep dive.
        </p>
      </div>
    </div>
  )
}

