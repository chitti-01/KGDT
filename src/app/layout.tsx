import type { Metadata } from 'next'
import './globals.css'
import Link from 'next/link'
import { LayoutDashboard, PlusCircle, History, Truck } from 'lucide-react'

export const metadata: Metadata = {
    title: 'KG Transport System - Premium Dashboard',
    description: 'Digital LR Management System',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body suppressHydrationWarning>
                <div className="layout-grid">
                    <aside className="sidebar glass">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem' }}>
                            <div style={{ background: 'var(--primary)', padding: '0.5rem', borderRadius: '0.5rem', color: 'white' }}>
                                <Truck size={24} />
                            </div>
                            <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>KG Transport</h1>
                        </div>

                        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <NavItem href="/" icon={<LayoutDashboard size={20} />} label="Dashboard" />
                            <NavItem href="/create-lr" icon={<PlusCircle size={20} />} label="Create LR" />
                            <NavItem href="/history" icon={<History size={20} />} label="LR History" />
                        </nav>
                    </aside>

                    <main className="main-content">
                        {children}
                    </main>
                </div>
            </body>
        </html>
    )
}

function NavItem({ href, icon, label }: { href: string, icon: React.ReactNode, label: string }) {
    return (
        <Link
            href={href}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius)',
                color: 'inherit',
                textDecoration: 'none',
                transition: 'all 0.2s',
            }}
            className="nav-link-hover"
        >
            {icon}
            <span>{label}</span>
        </Link>
    )
}
