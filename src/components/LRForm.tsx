'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { addDays, format } from 'date-fns'

export default function LRForm({ initialData, lrId }: { initialData?: any, lrId?: string }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [consignorSuggestions, setConsignorSuggestions] = useState<any[]>([])
    const [showConsignorSuggestions, setShowConsignorSuggestions] = useState(false)
    const [consigneeSuggestions, setConsigneeSuggestions] = useState<any[]>([])
    const [showConsigneeSuggestions, setShowConsigneeSuggestions] = useState(false)
    const consignorRef = useRef<HTMLDivElement>(null)
    const consigneeRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (consignorRef.current && !consignorRef.current.contains(event.target as Node)) {
                setShowConsignorSuggestions(false)
            }
            if (consigneeRef.current && !consigneeRef.current.contains(event.target as Node)) {
                setShowConsigneeSuggestions(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [])

    const fetchSuggestions = async (query: string, type: 'consignor' | 'consignee', searchBy: 'gst' | 'name' = 'gst') => {
        if (query.length < 2) {
            if (type === 'consignor') {
                setConsignorSuggestions([])
                setShowConsignorSuggestions(false)
            } else {
                setConsigneeSuggestions([])
                setShowConsigneeSuggestions(false)
            }
            return
        }

        try {
            const url = searchBy === 'gst' ? `/api/customers?gst=${query}` : `/api/customers?q=${query}`
            const res = await fetch(url)
            if (res.ok) {
                const data = await res.json()
                if (type === 'consignor') {
                    setConsignorSuggestions(data)
                    setShowConsignorSuggestions(data.length > 0)
                } else {
                    setConsigneeSuggestions(data)
                    setShowConsigneeSuggestions(data.length > 0)
                }
            }
        } catch (error) {
            console.error('Error fetching suggestions:', error)
        }
    }

    const handleSuggestionSelect = (customer: any, type: 'consignor' | 'consignee') => {
        setFormData((prev: any) => ({
            ...prev,
            [type === 'consignor' ? 'consignorName' : 'consigneeName']: customer.name || '',
            [type === 'consignor' ? 'consignorGst' : 'consigneeGst']: customer.gstNumber || '',
        }))
        if (type === 'consignor') {
            setShowConsignorSuggestions(false)
        } else {
            setShowConsigneeSuggestions(false)
        }
    }

    const [formData, setFormData] = useState(initialData || {
        bookingDate: format(new Date(), 'yyyy-MM-dd'),
        deliveryDate: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
        billingType: 'ToPay',
        consignorName: '',
        consignorGst: '',
        consigneeName: '',
        consigneeGst: '',
        fromLocation: 'Vijayawada',
        toLocation: 'Eluru',
        goodsDescription: '',
        invoiceNumber: '',
        quantity: '',
        weight: '',
        freightAmount: '',
    })

    // Suggestion logic can be expanded. Here we simulate basic handling.
    // In a full implementation, these would fetch from the APIs dynamically on typed input.

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        let { name, value } = e.target;
        if (name === 'consignorGst' || name === 'consigneeGst') {
            value = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
            fetchSuggestions(value, name === 'consignorGst' ? 'consignor' : 'consignee', 'gst');
        } else if (name === 'consignorName' || name === 'consigneeName') {
            value = value.toUpperCase();
            fetchSuggestions(value, name === 'consignorName' ? 'consignor' : 'consignee', 'name');
        } else if (name === 'invoiceNumber') {
            value = value.toUpperCase();
        } else if (name === 'bookingDate') {
            if (value && value.includes('-')) {
                const parts = value.split('-');
                if (parts.length === 3) {
                    const nextDay = addDays(new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])), 1);
                    setFormData((prev: any) => ({ ...prev, bookingDate: value, deliveryDate: format(nextDay, 'yyyy-MM-dd') }));
                    return;
                }
            }
        }
        setFormData((prev: any) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const url = lrId ? `/api/lr/${lrId}` : '/api/lr'
            const method = lrId ? 'PUT' : 'POST'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })
            if (!res.ok) throw new Error(lrId ? 'Failed to update LR' : 'Failed to create LR')

            const newLr = await res.json()

            // Premium custom toast overlay
            const toast = document.createElement('div');
            toast.className = 'glass';
            toast.style.cssText = `
                position: fixed; bottom: 2rem; right: 2rem; z-index: 1000;
                padding: 1rem 1.5rem; border-radius: var(--radius);
                background: var(--card); border-left: 4px solid var(--primary);
                box-shadow: var(--shadow-hover);
                display: flex; align-items: center; gap: 1rem;
                animation: fadeInDown 0.3s ease forwards;
            `;
            toast.innerHTML = `
                <div style="background: rgba(79,70,229,0.1); color: var(--primary); padding: 0.5rem; border-radius: 50%;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>
                </div>
                <div>
                   <h4 style="margin:0; font-weight:600; font-size:1rem;">LR ${lrId ? 'Updated' : 'Created'}</h4>
                   <p style="margin:0; color:var(--secondary); font-size:0.875rem;">LR Number: <strong>${String(newLr.lrNumber).padStart(4, '0')}</strong> ${lrId ? 'updated' : 'generated'} successfully.</p>
                </div>
            `;
            document.body.appendChild(toast);

            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transform = 'translateY(10px)';
                toast.style.transition = 'all 0.3s ease';
                setTimeout(() => toast.remove(), 300);
            }, 3000);

            router.push('/history')
        } catch (err) {
            console.error(err)
            alert('Error creating LR') // Fallback
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>

            {/* Header Info */}
            <div className="card glass" style={{ padding: '1rem' }}>
                <h3 style={{ marginBottom: '0.75rem', fontWeight: 'bold', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', display: 'inline-block' }}></span>
                    General Information
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--secondary)' }}>Booking Date</label>
                        <input type="date" name="bookingDate" value={formData.bookingDate} onChange={handleChange} className="input" required />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--secondary)' }}>Delivery Date (Est)</label>
                        <input type="date" name="deliveryDate" value={formData.deliveryDate} onChange={handleChange} className="input" readOnly style={{ backgroundColor: 'var(--bg-muted)', cursor: 'not-allowed' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--secondary)' }}>Billing Type</label>
                        <select name="billingType" value={formData.billingType} onChange={handleChange} className="input" required>
                            <option value="Paid">Paid</option>
                            <option value="ToPay">To Pay</option>
                            <option value="TBB">To Be Billed (TBB)</option>
                            <option value="FOC">Free of Charge (FOC)</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Customer Info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', position: 'relative', zIndex: 50 }}>
                <div className="card glass" style={{ padding: '1rem', overflow: 'visible', zIndex: 52, transform: 'none' }}>
                    <h3 style={{ marginBottom: '0.75rem', fontWeight: 'bold', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }}></span>
                        Consignor Details
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} ref={consignorRef}>
                        <div style={{ position: 'relative' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--secondary)' }}>Consignor Name</label>
                            <input type="text" name="consignorName" value={formData.consignorName} onChange={handleChange} className="input" placeholder="e.g. Acme Corp" required disabled={loading} onFocus={() => formData.consignorName.length >= 2 && consignorSuggestions.length > 0 && setShowConsignorSuggestions(true)} autoComplete="off" />
                        </div>
                        <div style={{ position: 'relative' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--secondary)' }}>GST Number</label>
                            <input type="text" name="consignorGst" value={formData.consignorGst} onChange={handleChange} className="input" placeholder="22AAAAA0000A1Z5" maxLength={15} onFocus={() => formData.consignorGst.length >= 2 && consignorSuggestions.length > 0 && setShowConsignorSuggestions(true)} autoComplete="off" />
                            {showConsignorSuggestions && (
                                <ul style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', marginTop: '0.5rem', maxHeight: '200px', overflowY: 'auto', listStyle: 'none', padding: 0, boxShadow: 'var(--shadow-md)' }}>
                                    {consignorSuggestions.map((sugg, idx) => (
                                        <li key={idx} onClick={() => handleSuggestionSelect(sugg, 'consignor')} style={{ padding: '0.75rem 1rem', cursor: 'pointer', borderBottom: idx < consignorSuggestions.length - 1 ? '1px solid var(--border)' : 'none', transition: 'background 0.2s ease' }} onMouseOver={(e) => e.currentTarget.style.background = 'var(--bg-muted)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                                            <div style={{ fontWeight: 500, color: 'var(--foreground)' }}>{sugg.gstNumber}</div>
                                            <div style={{ fontSize: '0.9rem', color: 'var(--secondary)' }}>{sugg.name}</div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>

                <div className="card glass" style={{ padding: '1rem', overflow: 'visible', zIndex: 51, transform: 'none' }}>
                    <h3 style={{ marginBottom: '0.75rem', fontWeight: 'bold', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
                        Consignee Details
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} ref={consigneeRef}>
                        <div style={{ position: 'relative' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--secondary)' }}>Consignee Name</label>
                            <input type="text" name="consigneeName" value={formData.consigneeName} onChange={handleChange} className="input" placeholder="e.g. Global Logistics" required onFocus={() => formData.consigneeName.length >= 2 && consigneeSuggestions.length > 0 && setShowConsigneeSuggestions(true)} autoComplete="off" />
                        </div>
                        <div style={{ position: 'relative' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--secondary)' }}>GST Number</label>
                            <input type="text" name="consigneeGst" value={formData.consigneeGst} onChange={handleChange} className="input" placeholder="22AAAAA0000A1Z5" maxLength={15} onFocus={() => formData.consigneeGst.length >= 2 && consigneeSuggestions.length > 0 && setShowConsigneeSuggestions(true)} autoComplete="off" />
                            {showConsigneeSuggestions && (
                                <ul style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', marginTop: '0.5rem', maxHeight: '200px', overflowY: 'auto', listStyle: 'none', padding: 0, boxShadow: 'var(--shadow-md)' }}>
                                    {consigneeSuggestions.map((sugg, idx) => (
                                        <li key={idx} onClick={() => handleSuggestionSelect(sugg, 'consignee')} style={{ padding: '0.75rem 1rem', cursor: 'pointer', borderBottom: idx < consigneeSuggestions.length - 1 ? '1px solid var(--border)' : 'none', transition: 'background 0.2s ease' }} onMouseOver={(e) => e.currentTarget.style.background = 'var(--bg-muted)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                                            <div style={{ fontWeight: 500, color: 'var(--foreground)' }}>{sugg.gstNumber}</div>
                                            <div style={{ fontSize: '0.9rem', color: 'var(--secondary)' }}>{sugg.name}</div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Journey, Goods & Financials */}
            <div className="card glass" style={{ padding: '1rem' }}>
                <h3 style={{ marginBottom: '0.75rem', fontWeight: 'bold', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }}></span>
                    Shipment & Billing Details
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--secondary)' }}>From Location</label>
                        <input type="text" name="fromLocation" value={formData.fromLocation} onChange={handleChange} className="input" placeholder="e.g. Mumbai" required readOnly style={{ backgroundColor: 'var(--bg-muted)', cursor: 'not-allowed' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--secondary)' }}>To Location</label>
                        <input type="text" name="toLocation" value={formData.toLocation} onChange={handleChange} className="input" placeholder="e.g. Pune" required readOnly style={{ backgroundColor: 'var(--bg-muted)', cursor: 'not-allowed' }} />
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--secondary)' }}>Goods Description</label>
                        <input type="text" name="goodsDescription" value={formData.goodsDescription} onChange={handleChange} className="input" placeholder="e.g. Electronic Items" required />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--secondary)' }}>Invoice No</label>
                        <input type="text" name="invoiceNumber" value={formData.invoiceNumber} onChange={handleChange} className="input" placeholder="INV12345" />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--secondary)' }}>Quantity (Pieces)</label>
                        <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} className="input" min="1" required />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--secondary)' }}>Weight (Kg)</label>
                        <input type="number" step="0.01" name="weight" value={formData.weight} onChange={handleChange} className="input" required />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--secondary)' }}>Freight Amount (₹)</label>
                        <input type="number" step="0.01" name="freightAmount" value={formData.freightAmount} onChange={handleChange} className="input" required />
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => router.back()} className="btn" style={{ background: 'transparent', color: 'var(--foreground)', border: '1px solid var(--border)', padding: '0.875rem 2rem', borderRadius: 'var(--radius)' }}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={loading} style={{ padding: '0.875rem 3rem', fontSize: '1.05rem', boxShadow: 'var(--shadow-md)' }}>
                    {loading ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ width: '1rem', height: '1rem', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', display: 'inline-block' }}></span>
                            Saving...
                        </span>
                    ) : (lrId ? 'Update LR' : 'Generate LR')}
                </button>
            </div>
        </form>
    )
}
