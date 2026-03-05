'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'

export default function LRForm() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        bookingDate: format(new Date(), 'yyyy-MM-dd'),
        deliveryDate: '',
        billingType: 'ToPay',
        consignorName: '',
        consignorGst: '',
        consigneeName: '',
        consigneeGst: '',
        fromLocation: '',
        toLocation: '',
        goodsDescription: '',
        quantity: '',
        weight: '',
        freightAmount: '',
        otherCharges: '',
        gstRate: '5',
    })

    // Suggestion logic can be expanded. Here we simulate basic handling.
    // In a full implementation, these would fetch from the APIs dynamically on typed input.

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await fetch('/api/lr', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })
            if (!res.ok) throw new Error('Failed to create LR')

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
                   <h4 style="margin:0; font-weight:600; font-size:1rem;">LR Created</h4>
                   <p style="margin:0; color:var(--secondary); font-size:0.875rem;">LR Number: <strong>${newLr.lrNumber}</strong> generated successfully.</p>
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
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '2rem' }}>

            {/* Header Info */}
            <div className="card glass">
                <h3 style={{ marginBottom: '1.5rem', fontWeight: 'bold', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', display: 'inline-block' }}></span>
                    General Information
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--secondary)' }}>Booking Date</label>
                        <input type="date" name="bookingDate" value={formData.bookingDate} onChange={handleChange} className="input" required />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--secondary)' }}>Delivery Date (Est)</label>
                        <input type="date" name="deliveryDate" value={formData.deliveryDate} onChange={handleChange} className="input" />
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
                <div className="card glass">
                    <h3 style={{ marginBottom: '1.5rem', fontWeight: 'bold', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }}></span>
                        Consignor Details
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--secondary)' }}>Consignor Name</label>
                            <input type="text" name="consignorName" value={formData.consignorName} onChange={handleChange} className="input" placeholder="e.g. Acme Corp" required disabled={loading} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--secondary)' }}>GST Number</label>
                            <input type="text" name="consignorGst" value={formData.consignorGst} onChange={handleChange} className="input" placeholder="22AAAAA0000A1Z5" />
                        </div>
                    </div>
                </div>

                <div className="card glass">
                    <h3 style={{ marginBottom: '1.5rem', fontWeight: 'bold', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
                        Consignee Details
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--secondary)' }}>Consignee Name</label>
                            <input type="text" name="consigneeName" value={formData.consigneeName} onChange={handleChange} className="input" placeholder="e.g. Global Logistics" required />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--secondary)' }}>GST Number</label>
                            <input type="text" name="consigneeGst" value={formData.consigneeGst} onChange={handleChange} className="input" placeholder="22AAAAA0000A1Z5" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Journey & Goods */}
            <div className="card glass">
                <h3 style={{ marginBottom: '1.5rem', fontWeight: 'bold', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }}></span>
                    Shipment Details
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--secondary)' }}>From Location</label>
                        <input type="text" name="fromLocation" value={formData.fromLocation} onChange={handleChange} className="input" placeholder="e.g. Mumbai" required />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--secondary)' }}>To Location</label>
                        <input type="text" name="toLocation" value={formData.toLocation} onChange={handleChange} className="input" placeholder="e.g. Pune" required />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--secondary)' }}>Goods Description</label>
                        <input type="text" name="goodsDescription" value={formData.goodsDescription} onChange={handleChange} className="input" placeholder="e.g. Electronic Items" required />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--secondary)' }}>Quantity (Pieces)</label>
                        <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} className="input" placeholder="e.g. 50" min="1" required />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--secondary)' }}>Weight (Kg)</label>
                        <input type="number" step="0.01" name="weight" value={formData.weight} onChange={handleChange} className="input" placeholder="e.g. 1500" required />
                    </div>
                </div>
            </div>

            {/* Financials */}
            <div className="card glass">
                <h3 style={{ marginBottom: '1.5rem', fontWeight: 'bold', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#8b5cf6', display: 'inline-block' }}></span>
                    Charges & Billing
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--secondary)' }}>Freight Amount (₹)</label>
                        <input type="number" step="0.01" name="freightAmount" value={formData.freightAmount} onChange={handleChange} className="input" placeholder="1000.00" required />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--secondary)' }}>Other Charges (₹)</label>
                        <input type="number" step="0.01" name="otherCharges" value={formData.otherCharges} onChange={handleChange} className="input" placeholder="100.00" />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--secondary)' }}>GST Rate (%)</label>
                        <select name="gstRate" value={formData.gstRate} onChange={handleChange} className="input">
                            <option value="0">0%</option>
                            <option value="5">5%</option>
                            <option value="12">12%</option>
                            <option value="18">18%</option>
                        </select>
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
                    ) : 'Generate LR'}
                </button>
            </div>
        </form>
    )
}
