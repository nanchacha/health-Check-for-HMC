'use client';

import { useState, useEffect } from 'react';
import WorldMap from '../components/WorldMap';

type Status = 'live' | 'down' | 'error' | 'loading' | 'idle';

interface CountryStatus {
    status: Status;
    httpCode?: number;
    finalUrl?: string;
}

// Full list derived from user request
// Specific list provided by user
const DEFAULT_COUNTRIES = [
    'ae', 'ae_ar', 'ar', 'at', 'au', 'be', 'be_fr', 'br', 'ca', 'ca_fr',
    'ch', 'ch_fr', 'cl', 'co', 'cz', 'de', 'dk', 'ee', 'eg', 'es', 'fi',
    'fr', 'gr', 'hk', 'hk_en', 'hr', 'hu', 'id', 'in', 'iq_ar', 'iq_ku',
    'it', 'kz_kz', 'kz_ru', 'levant', 'levant_ar', 'lt', 'lv', 'mx', 'my',
    'n_africa', 'nl', 'no', 'nz', 'pe', 'ph', 'pk', 'pl', 'pt', 'py',
    'ro', 'sa', 'sa_en', 'se', 'sg', 'si', 'sk', 'th', 'tr', 'tw', 'ua',
    'uk', 'vn', 'za'
];

export default function Home() {
    const [countries, setCountries] = useState<string[]>(DEFAULT_COUNTRIES);
    const [statuses, setStatuses] = useState<Record<string, CountryStatus>>({});
    const [newCountry, setNewCountry] = useState('');

    const checkStatus = async (country: string) => {
        setStatuses(prev => ({
            ...prev,
            [country]: { status: 'loading' }
        }));

        try {
            const res = await fetch(`/api/check-status?country=${country}`);
            const data = await res.json();
            setStatuses(prev => ({
                ...prev,
                [country]: {
                    status: data.status,
                    httpCode: data.httpCode,
                    finalUrl: data.finalUrl
                }
            }));
        } catch (error) {
            setStatuses(prev => ({
                ...prev,
                [country]: { status: 'error' }
            }));
        }
    };

    const checkAll = () => {
        countries.forEach(c => checkStatus(c));
    };

    useEffect(() => {
        // Stagger initial checks to avoid overwhelming network/browser
        const batchSize = 10;
        for (let i = 0; i < DEFAULT_COUNTRIES.length; i += batchSize) {
            setTimeout(() => {
                DEFAULT_COUNTRIES.slice(i, i + batchSize).forEach(checkStatus);
            }, i * 100); // 100ms delay between batches
        }
    }, []);

    const handleAddCountry = (e: React.FormEvent) => {
        e.preventDefault();
        const code = newCountry.trim().toLowerCase();
        if (code && !countries.includes(code)) {
            setCountries(prev => [...prev, code]);
            checkStatus(code);
            setNewCountry('');
        }
    };

    const handleRemoveCountry = () => {
        const code = newCountry.trim().toLowerCase();
        if (code && countries.includes(code)) {
            setCountries(prev => prev.filter(c => c !== code));
            // Also optionally remove status, but strictly not necessary as it will just disappear
            setStatuses(prev => {
                const next = { ...prev };
                delete next[code];
                return next;
            });
            setNewCountry('');
        }
    };

    const getStatusColor = (status: Status) => {
        switch (status) {
            case 'live': return 'status-green';
            case 'down': return 'status-red';
            case 'error': return 'status-red';
            case 'loading': return 'status-loading';
            default: return 'bg-gray-200';
        }
    };

    const getStatusText = (s: CountryStatus) => {
        if (s.status === 'loading') return 'Checking...';
        if (s.status === 'live') return 'Live';
        if (s.status === 'down') return 'Down';
        if (s.status === 'error') return 'Error';
        return 'Unknown';
    };

    const getFontSize = (code: string) => {
        if (code.length > 8) return '0.75rem';
        if (code.length > 5) return '0.9rem';
        return '1.05rem';
    };

    return (
        <main className="main-container">
            <header className="header-container">
                <div>
                    <h1 className="header-title">Samsung HMC Health Check</h1>
                    <p style={{ color: '#666' }}>Monitoring Help Me Choose pages availability</p>
                </div>
                <button
                    onClick={() => countries.forEach(checkStatus)}
                    className="refresh-button"
                >
                    Refresh All
                </button>
            </header>

            <WorldMap statuses={statuses} />

            <div className="input-form-container">
                <form onSubmit={handleAddCountry} className="input-form">
                    <input
                        type="text"
                        value={newCountry}
                        onChange={(e) => setNewCountry(e.target.value)}
                        placeholder="Enter country code (e.g. jp)"
                        className="country-input"
                    />
                    <button
                        type="submit"
                        className="add-button"
                    >
                        Add
                    </button>
                    <button
                        type="button"
                        onClick={handleRemoveCountry}
                        className="remove-button"
                    >
                        Remove
                    </button>
                </form>
            </div>

            <div className="status-grid">
                {countries.map(country => {
                    const s = statuses[country] || { status: 'idle' };
                    return (
                        <div key={country} className="status-card">
                            <h2 style={{ fontSize: getFontSize(country), fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '1rem' }}>{country}</h2>
                            <div
                                className={`status-indicator ${getStatusColor(s.status)}`}
                                title={getStatusText(s)}
                            />
                            <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#888' }}>
                                {s.status === 'loading' ? 'Checking...' : (
                                    <>
                                        <span style={{ fontWeight: 'bold', color: s.status === 'live' ? '#22c55e' : '#ef4444' }}>{s.status.toUpperCase()}</span>
                                        {s.httpCode && <span style={{ marginLeft: '8px' }}>({s.httpCode})</span>}
                                    </>
                                )}
                            </div>
                            {s.finalUrl && (
                                <div style={{ fontSize: '0.7rem', marginTop: '0.5rem', wordBreak: 'break-all', color: '#aaa' }}>
                                    <a href={s.finalUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>Visit &rarr;</a>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </main>
    );
}
