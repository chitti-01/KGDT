'use client'

import { useState, useEffect } from 'react'
import { Truck, Users, FileText, IndianRupee, Loader2, History } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
    const [stats, setStats] = useState({
        totalLRs: 0,
        totalCustomers: 0,
        mtdRevenue: 0,
        activeShipments: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                const res = await fetch('/api/stats');
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (error) {
                console.error("Failed to fetch stats");
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, []);

    const formatCurrency = (amount: number) => {
        if (amount >= 100000) {
            return `₹${(amount / 100000).toFixed(2)}L`;
        }
        return `₹${amount.toLocaleString('en-IN')}`;
    }

    return (
        <div>
            <header className="header">
                <h2 className="title">Dashboard</h2>
                <p className="subtitle">Welcome back to KG Transport Management</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                <StatCard
                    title="Total LRs"
                    value={loading ? <Loader2 className="animate-spin" /> : stats.totalLRs.toLocaleString()}
                    icon={<FileText size={22} color="#4f46e5" />}
                    trend="All Time"
                />
                <StatCard
                    title="Total Customers"
                    value={loading ? <Loader2 className="animate-spin" /> : stats.totalCustomers.toLocaleString()}
                    icon={<Users size={22} color="#059669" />}
                    trend="Registered"
                />
                <StatCard
                    title="Revenue (MTD)"
                    value={loading ? <Loader2 className="animate-spin" /> : formatCurrency(stats.mtdRevenue)}
                    icon={<IndianRupee size={22} color="#0f766e" />}
                    trend="This Month"
                />
                <StatCard
                    title="Active Shipments"
                    value={loading ? <Loader2 className="animate-spin" /> : stats.activeShipments.toLocaleString()}
                    icon={<Truck size={22} color="#ea580c" />}
                    trend="In Transit"
                />
            </div>

            <div className="card glass">
                <h3 style={{ marginBottom: '1.5rem', fontWeight: 'bold', fontSize: '1.25rem' }}>Quick Actions</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                    <Link href="/create-lr" style={{ textDecoration: 'none' }}>
                        <button className="btn-primary" style={{ width: '100%' }}>
                            <FileText size={18} /> New LR Entry
                        </button>
                    </Link>
                    <Link href="/history" style={{ textDecoration: 'none' }}>
                        <button className="btn" style={{ width: '100%', background: 'var(--card)', border: '1px solid var(--border)' }}>
                            <History size={18} /> View History
                        </button>
                    </Link>
                    <button className="btn" style={{ width: '100%', background: 'var(--card)', border: '1px solid var(--border)' }}>
                        <Users size={18} /> Customer Records
                    </button>
                </div>
            </div>
        </div>
    )
}

function StatCard({ title, value, icon, trend }: { title: string, value: React.ReactNode, icon: React.ReactNode, trend: string }) {
    return (
        <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div style={{
                    padding: '0.75rem',
                    borderRadius: '0.75rem',
                    background: 'var(--accent-light)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    {icon}
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{trend}</span>
            </div>
            <p style={{ color: 'var(--secondary)', fontSize: '0.9rem', fontWeight: '500', marginBottom: '0.25rem' }}>{title}</p>
            <h4 style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--foreground)' }}>{value}</h4>
        </div>
    )
}
