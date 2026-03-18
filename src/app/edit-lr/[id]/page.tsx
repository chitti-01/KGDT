'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import LRForm from '@/components/LRForm'
import { format } from 'date-fns'

export default function EditLRPage() {
    const params = useParams()
    const router = useRouter()
    const id = params.id as string

    const [lrData, setLrData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (id) {
            fetch(`/api/lr/${id}`)
                .then(async res => {
                    const data = await res.json()
                    if (!res.ok) throw new Error(data.error || 'Failed to fetch LR')
                    return data
                })
                .then(data => {
                    setLrData({
                        ...data,
                        bookingDate: format(new Date(data.bookingDate), 'yyyy-MM-dd'),
                        deliveryDate: data.deliveryDate ? format(new Date(data.deliveryDate), 'yyyy-MM-dd') : '',
                        consignorName: data.consignor?.name || '',
                        consignorGst: data.consignor?.gstNumber || '',
                        consigneeName: data.consignee?.name || '',
                        consigneeGst: data.consignee?.gstNumber || '',
                        quantity: data.quantity ? data.quantity.toString() : '',
                        weight: data.weight ? data.weight.toString() : '',
                        freightAmount: data.freightAmount ? data.freightAmount.toString() : '',
                        otherCharges: data.otherCharges ? data.otherCharges.toString() : '',
                        gstRate: data.gstRate ? data.gstRate.toString() : '5',
                    })
                    setLoading(false)
                })
                .catch(err => {
                    console.error('Failed to fetch LR', err)
                    setLoading(false)
                })
        }
    }, [id])

    if (loading) {
        return (
            <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--secondary)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '2rem', height: '2rem', border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                    <p>Loading LR data...</p>
                </div>
            </div>
        )
    }

    if (!lrData) {
        return <div style={{ textAlign: 'center', padding: '2rem' }}>LR not found</div>
    }

    return (
        <div>
            <header className="header">
                <div>
                    <h2 className="title">Edit LR: #{String(lrData.lrNumber).padStart(4, '0')}</h2>
                    <p className="subtitle">Update details for the selected logistic receipt.</p>
                </div>
            </header>

            <LRForm initialData={lrData} lrId={id} />
        </div>
    )
}
