'use client';

export default function OfflinePage() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', textAlign: 'center' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--foreground)' }}>You are Offline</h1>
            <p style={{ color: 'var(--muted)', marginBottom: '2rem' }}>
                Please check your internet connection to access the full application.
                Some previously visited pages may still be available.
            </p>
            <button 
                onClick={() => window.location.reload()}
                className="btn-primary"
            >
                Try Again
            </button>
        </div>
    );
}
