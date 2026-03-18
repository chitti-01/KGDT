'use client'

import { useState, useEffect } from 'react'
import { Search, FileText, Download, Printer, Edit2, Trash2 } from 'lucide-react'
import { generateLRPdf, generateMultipleLRPdf, generate3LRsPerPagePdf } from '@/utils/pdfGenerator'

type LR = {
    id: number;
    lrNumber: number;
    bookingDate: string;
    consignor: { name: string };
    consignee: { name: string };
    fromLocation: string;
    toLocation: string;
    totalAmount: number;
    status: string;
}

export default function LRHistoryPage() {
    const [lrs, setLrs] = useState<LR[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [loading, setLoading] = useState(true)
    const [isDeleting, setIsDeleting] = useState<number | null>(null)

    useEffect(() => {
        fetchLRs()
    }, [])

    const fetchLRs = async (query = '') => {
        setLoading(true)
        try {
            const url = query ? `/api/lr?q=${encodeURIComponent(query)}` : '/api/lr'
            const res = await fetch(url)
            const data = await res.json()
            setLrs(data)
        } catch (error) {
            console.error('Failed to fetch LRs', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        fetchLRs(searchQuery)
    }

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this LR permanently? This action cannot be undone.')) {
            return;
        }

        setIsDeleting(id);
        try {
            const res = await fetch(`/api/lr/${id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                // Remove LR from UI without reloading page
                setLrs(lrs.filter(lr => lr.id !== id));
            } else {
                alert('Failed to delete LR');
            }
        } catch (error) {
            console.error('Error deleting LR', error);
            alert('An error occurred while deleting.');
        } finally {
            setIsDeleting(null);
        }
    }

    return (
        <div>
            <header className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h2 className="title">LR History</h2>
                    <p className="subtitle">View and manage all your logistic receipts.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => generateMultipleLRPdf(lrs, startDate, endDate)} className="btn" style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: 'var(--shadow-sm)' }}>
                        <Printer size={18} color="var(--primary)" /> Summary PDF
                    </button>
                    <button onClick={() => generate3LRsPerPagePdf(lrs, startDate, endDate)} className="btn" style={{ background: 'var(--primary)', border: 'none', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: 'var(--shadow-sm)' }}>
                        <Download size={18} color="white" /> Format 3-LRs
                    </button>
                </div>
            </header>

            <div className="card glass" style={{ marginBottom: '2.5rem', padding: '1.5rem' }}>
                <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
                        <Search size={20} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary)' }} />
                        <input
                            type="text"
                            placeholder="Search by LR number, customer name, or city..."
                            className="input"
                            style={{ paddingLeft: '3.5rem', fontSize: '1rem', border: '1px solid var(--border)', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <input type="date" className="input" style={{ width: 'auto', padding: '0.875rem' }} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                        <span style={{ color: 'var(--secondary)', fontWeight: 500 }}>to</span>
                        <input type="date" className="input" style={{ width: 'auto', padding: '0.875rem' }} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                    </div>
                    <button type="submit" className="btn-primary" style={{ padding: '0.875rem 2rem' }}>Search / Filter</button>
                </form>
            </div>

            <div className="card glass" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--border)' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: 'var(--input)', borderBottom: '2px solid var(--border)' }}>
                                <th style={{ padding: '1.25rem 1rem', fontWeight: '600', color: 'var(--secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>LR No.</th>
                                <th style={{ padding: '1.25rem 1rem', fontWeight: '600', color: 'var(--secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</th>
                                <th style={{ padding: '1.25rem 1rem', fontWeight: '600', color: 'var(--secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Consignor</th>
                                <th style={{ padding: '1.25rem 1rem', fontWeight: '600', color: 'var(--secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Consignee</th>
                                <th style={{ padding: '1.25rem 1rem', fontWeight: '600', color: 'var(--secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Route</th>
                                <th style={{ padding: '1.25rem 1rem', fontWeight: '600', color: 'var(--secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Amount</th>
                                <th style={{ padding: '1.25rem 1rem', fontWeight: '600', color: 'var(--secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                                <th style={{ padding: '1.25rem 1rem', fontWeight: '600', color: 'var(--secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={8} style={{ padding: '4rem', textAlign: 'center', color: 'var(--secondary)' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ width: '2rem', height: '2rem', border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                                            <p>Loading records...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : lrs.length === 0 ? (
                                <tr>
                                    <td colSpan={8} style={{ padding: '4rem', textAlign: 'center', color: 'var(--secondary)' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                                            <FileText size={48} opacity={0.2} />
                                            <p style={{ fontSize: '1.1rem' }}>No records found.</p>
                                            <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>Try adjusting your search or create a new LR.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                lrs.map((lr) => (
                                    <tr key={lr.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s ease' }} className="table-row-hover">
                                        <td style={{ padding: '1.25rem 1rem', fontWeight: '600', color: 'var(--foreground)' }}>#{String(lr.lrNumber).padStart(4, '0')}</td>
                                        <td style={{ padding: '1.25rem 1rem', color: 'var(--secondary)', fontSize: '0.9rem' }}>{new Date(lr.bookingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                                        <td style={{ padding: '1.25rem 1rem', fontWeight: '500' }}>{lr.consignor?.name}</td>
                                        <td style={{ padding: '1.25rem 1rem', fontWeight: '500' }}>{lr.consignee?.name}</td>
                                        <td style={{ padding: '1.25rem 1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                                                <span>Vijayawada</span>
                                                <span style={{ color: 'var(--secondary)' }}>→</span>
                                                <span>Eluru</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.25rem 1rem', fontWeight: '700', color: 'var(--foreground)' }}>₹{lr.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                        <td style={{ padding: '1.25rem 1rem' }}>
                                            <span className={`badge ${lr.status === 'Created' ? 'badge-blue' : lr.status === 'Delivered' ? 'badge-green' : 'badge-amber'}`}>
                                                {lr.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1.25rem 1rem', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                <button onClick={() => window.location.href = `/edit-lr/${lr.id}`} className="btn" style={{ background: 'transparent', border: '1px solid var(--border)', padding: '0.5rem 1rem', fontSize: '0.875rem', borderRadius: '2rem', display: 'inline-flex', alignItems: 'center' }}>
                                                    <Edit2 size={16} style={{ marginRight: '0.5rem' }} /> Edit
                                                </button>
                                                <button onClick={() => generateLRPdf(lr)} className="btn" style={{ background: 'transparent', border: '1px solid var(--border)', padding: '0.5rem 1rem', fontSize: '0.875rem', borderRadius: '2rem', display: 'inline-flex', alignItems: 'center' }}>
                                                    <Printer size={16} style={{ marginRight: '0.5rem' }} /> Print PDF
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(lr.id)} 
                                                    disabled={isDeleting === lr.id}
                                                    className="btn" 
                                                    style={{ 
                                                        background: 'transparent', 
                                                        border: '1px solid #ef4444', 
                                                        color: '#ef4444', 
                                                        padding: '0.5rem 1rem', 
                                                        fontSize: '0.875rem', 
                                                        borderRadius: '2rem', 
                                                        display: 'inline-flex', 
                                                        alignItems: 'center',
                                                        opacity: isDeleting === lr.id ? 0.5 : 1,
                                                        cursor: isDeleting === lr.id ? 'not-allowed' : 'pointer'
                                                    }}>
                                                    {isDeleting === lr.id ? (
                                                        <div style={{ width: '16px', height: '16px', border: '2px solid #ef4444', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', marginRight: '0.5rem' }}></div>
                                                    ) : (
                                                        <Trash2 size={16} style={{ marginRight: '0.5rem' }} />
                                                    )}
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
