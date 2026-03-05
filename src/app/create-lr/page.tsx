import LRForm from '@/components/LRForm'

export default function CreateLRPage() {
    return (
        <div>
            <header className="header">
                <h2 className="title">Create Logistic Receipt</h2>
                <p className="subtitle">Enter shipment details to generate a new LR.</p>
            </header>

            <div style={{ maxWidth: '1000px' }}>
                <LRForm />
            </div>
        </div>
    )
}
