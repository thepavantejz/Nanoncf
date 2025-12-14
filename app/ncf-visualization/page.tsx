"use client";
import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Line, Html } from '@react-three/drei';
import * as THREE from 'three';
import styles from './styles.module.css';

interface Item {
    id?: string;
    itemId?: number;
    rank: number;
    score?: number;
}

interface ApiResponse {
    userId: string;
    items: Item[];
}

const fetchRecommendations = async (userId: string): Promise<ApiResponse> => {
    if (!userId.trim()) throw new Error("User ID is required");

    try {
        const res = await fetch(`/api/ncf/${encodeURIComponent(userId.trim())}`, {
            headers: {
                'Accept': 'application/json',
                'Cache-Control': 'no-cache'
            }
        });

        if (!res.ok) {
            let errorMsg = `Server error: ${res.status}`;
            try {
                const errorData = await res.json();
                if (errorData.error) errorMsg = errorData.error;
            } catch (e) {
                // ignore json parse error
            }
            throw new Error(errorMsg);
        }
        return res.json();
    } catch (e: any) {
        throw new Error(e.message || "Network error: Failed to reach server");
    }
};

const NCFVisualization: React.FC = () => {
    const [userId, setUserId] = useState('');
    const [data, setData] = useState<ApiResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleShow = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await fetchRecommendations(userId);
            setData(result);
        } catch (e: any) {
            console.error("Fetch error:", e);
            setError(e.message || "Failed to load data");
            setData(null);
        }
        setLoading(false);
    };

    // Compute positions on a sphere for each item
    const positions = data?.items.map((item, idx) => {
        const phi = Math.acos(-1 + (2 * (idx + 1)) / (data.items.length + 1));
        const theta = Math.sqrt((data.items.length + 1) * Math.PI) * phi;

        // Distance based on score: Higher score = Closer to user
        // Score 1.0 -> Radius 3
        // Score 0.0 -> Radius 8
        const r = item.score !== undefined ? 8 - (item.score * 5) : 6;

        const x = r * Math.cos(theta) * Math.sin(phi);
        const y = r * Math.sin(theta) * Math.sin(phi);
        const z = r * Math.cos(phi);
        const displayId = item.id || item.itemId?.toString() || 'unknown';
        return { id: displayId, position: new THREE.Vector3(x, y, z), rank: item.rank, score: item.score };
    });

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Neural Collaborative Filtering – 3D View</h1>
            <div className={styles.inputBox}>
                <input
                    type="text"
                    placeholder="Enter user ID"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    className={styles.textInput}
                />
                <button onClick={handleShow} className={styles.showButton} disabled={loading || !userId}>
                    {loading ? 'Loading…' : 'Show'}
                </button>
            </div>
            {error && <p className={styles.error}>Error: {error}</p>}

            {/* Item list */}
            {data && (
                <div className={styles.itemList}>
                    <h2 className={styles.subTitle}>Recommended Items (ranked)</h2>
                    <ul>
                        {data.items.map((item) => {
                            const displayId = item.id || item.itemId?.toString() || 'unknown';
                            return (
                                <li key={displayId}>
                                    <strong>{displayId}</strong> – rank: {item.rank}{item.score !== undefined ? `, score: ${item.score.toFixed(2)}` : ''}
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}

            {/* 3D Canvas */}
            {data && (
                <div className={styles.canvasWrapper}>
                    <Canvas style={{ width: '100%', height: '100%' }} camera={{ position: [0, 0, 12], fov: 60 }}>
                        <ambientLight intensity={0.5} />
                        <directionalLight position={[5, 5, 5]} intensity={0.8} />
                        <OrbitControls enableZoom={true} />
                        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />
                        {/* User sphere – red */}
                        <mesh>
                            <sphereGeometry args={[0.4, 32, 32]} />
                            <meshStandardMaterial color="#ff6b6b" />
                            <Html position={[0, 0.6, 0]} center zIndexRange={[100, 0]}>
                                <div style={{ color: '#ff6b6b', background: 'rgba(0,0,0,0.8)', padding: '2px 6px', borderRadius: '4px', whiteSpace: 'nowrap', fontSize: '0.8rem', userSelect: 'none', pointerEvents: 'none' }}>
                                    {userId || 'User'}
                                </div>
                            </Html>
                        </mesh>
                        {/* Item spheres and connecting lines */}
                        {positions?.map((p) => (
                            <React.Fragment key={p.id}>
                                <Line
                                    points={[new THREE.Vector3(0, 0, 0), p.position]}
                                    color={p.score !== undefined ? `hsl(${p.score * 120}, 80%, 60%)` : '#61dafb'}
                                    lineWidth={2}
                                    transparent
                                    opacity={0.7}
                                />
                                <mesh position={p.position}>
                                    <sphereGeometry args={[0.2, 16, 16]} />
                                    <meshStandardMaterial color="#61dafb" />
                                    <Html position={[0, 0.3, 0]} center zIndexRange={[100, 0]}>
                                        <div style={{ color: '#61dafb', background: 'rgba(0,0,0,0.7)', padding: '2px 5px', borderRadius: '4px', whiteSpace: 'nowrap', fontSize: '0.7rem', userSelect: 'none', pointerEvents: 'none' }}>
                                            #{p.rank}
                                        </div>
                                    </Html>
                                </mesh>
                            </React.Fragment>
                        ))}
                    </Canvas>
                </div>
            )}

            {/* Explanation / legend */}
            {data && (
                <div className={styles.explanation}>
                    <h2 className={styles.subTitle}>What you see</h2>
                    <p>The red sphere at the centre represents the <strong>user</strong>. Each blue sphere corresponds to an <strong>item</strong> that the model recommends for that user.</p>
                    <p>Lines connect the user to each item, illustrating the relationship learned by the Neural Collaborative Filtering algorithm. The colour of a line indicates the confidence (score) – greener lines mean higher predicted relevance, while default blue indicates no explicit score.</p>
                    <p>The spatial distribution is purely a visual metaphor: items are placed on a sphere to give a clear, 3‑D view of how many recommendations exist and how they relate to the user.</p>
                </div>
            )}

            {/* Algorithm Explanation */}
            {data && (
                <div className={styles.explanation}>
                    <h2 className={styles.subTitle}>Under the Hood: The Math</h2>
                    <p>
                        This visualization is powered by <strong>Neural Collaborative Filtering (NCF)</strong>.
                        Unlike traditional recommendations that just match categories, NCF learns to predict user preferences using deep learning.
                    </p>
                    <div style={{
                        background: 'rgba(255,255,255,0.05)',
                        padding: '1.5rem',
                        borderRadius: '8px',
                        margin: '1.5rem 0',
                        fontFamily: 'monospace',
                        textAlign: 'center'
                    }}>
                        <p style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#61dafb' }}>
                            Prediction(u, i) = f(P<sub>u</sub>, Q<sub>i</sub>)
                        </p>
                        <p style={{ fontSize: '0.9rem', color: '#ccc' }}>
                            Where <strong>P<sub>u</sub></strong> is the User Vector and <strong>Q<sub>i</sub></strong> is the Item Vector.
                        </p>
                    </div>
                    <p>
                        In a simplified Matrix Factorization view (GMF), the score is the dot product of these vectors:
                    </p>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '1rem',
                        margin: '1.5rem 0',
                        fontSize: '1.2rem',
                        fontWeight: 'bold'
                    }}>
                        <span style={{ color: '#ff6b6b' }}>[User]</span>
                        <span>×</span>
                        <span style={{ color: '#61dafb' }}>[Item]</span>
                        <span>=</span>
                        <span style={{ color: '#51cf66' }}>Score</span>
                    </div>
                    <p>
                        The model multiplies the latent features of the <strong>User</strong> (red) and the <strong>Item</strong> (blue).
                        If their vectors point in similar directions in the high-dimensional mathematical space, the resulting <strong>Score</strong> is high (green line).
                        If they are dissimilar, the score is low (red/yellow line).
                    </p>
                </div>
            )}
        </div>
    );
};

export default NCFVisualization;
