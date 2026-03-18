'use client';

import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';

export default function InstallPrompt() {
    const [installPrompt, setInstallPrompt] = useState<any>(null);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        // Safe update flow: listen for service worker updates and reload only once
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
            if (process.env.NODE_ENV === 'development') {
                // In dev mode, unregister any existing service workers since Serwist is disabled
                navigator.serviceWorker.getRegistrations().then(function(registrations) {
                    for (let registration of registrations) {
                        registration.unregister();
                    }
                }).catch(function(err) {
                    console.log('Service Worker registration failed: ', err);
                });
            } else {
                navigator.serviceWorker.register('/sw.js').then((registration) => {
                    console.log('Service Worker registered with scope:', registration.scope);
                }).catch((error) => {
                    console.error('Service Worker registration failed:', error);
                });

                let refreshing = false;
                navigator.serviceWorker.addEventListener('controllerchange', () => {
                    if (!refreshing) {
                        refreshing = true;
                        window.location.reload();
                    }
                });
            }
        }

        // Install prompt logic
        const handleBeforeInstallPrompt = (e: Event) => {
            // We do NOT call preventDefault() here as per request. 
            // This clears the console warning and allows the browser to show its native "Install" infobar/icon,
            // while we ALSO capture the event to power our custom "Install App" button below.
            setInstallPrompt(e);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Detect if already installed natively
        if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
            setIsInstalled(true);
        }

        const handleAppInstalled = () => {
            setIsInstalled(true);
            setInstallPrompt(null);
        };

        window.addEventListener('appinstalled', handleAppInstalled);

        // Cleanup listeners on unmount
        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const handleInstall = async () => {
        if (!installPrompt) return;
        
        try {
            // Show the install prompt
            installPrompt.prompt();
            
            // Wait for the user to respond to the prompt
            const { outcome } = await installPrompt.userChoice;
            console.log(`User response to the install prompt: ${outcome}`);
            
            if (outcome === 'accepted') {
                setIsInstalled(true);
            }
        } catch (error) {
            console.error('Error during install prompt:', error);
        } finally {
            // We've used the prompt, and can't use it again, throw it away
            setInstallPrompt(null);
        }
    };

    if (!installPrompt || isInstalled) {
        return null; // Don't show if already installed or prompt unavailable
    }

    return (
        <button 
            onClick={handleInstall}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                background: 'var(--primary)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius)',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500'
            }}
        >
            <Download size={16} />
            Install App
        </button>
    );
}
