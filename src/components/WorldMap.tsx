import React, { useState } from 'react';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps';

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Mapping of country codes to coordinates [longitude, latitude]
const COUNTRY_COORDINATES: Record<string, [number, number]> = {
    'ae': [53, 23],
    'ar': [-63, -34],
    'at': [14, 47],
    'au': [133, -25],
    'be': [4, 50],
    'br': [-51, -14],
    'ca': [-106, 56],
    'ch': [8, 46],
    'cl': [-71, -35],
    'co': [-74, 4],
    'cz': [15, 49],
    'de': [10, 51],
    'dk': [9, 56],
    'ee': [25, 58],
    'eg': [30, 26],
    'es': [-3, 40],
    'fi': [25, 61],
    'fr': [2, 46],
    'gr': [21, 39],
    'hk': [114, 22],
    'hr': [15, 45],
    'hu': [19, 47],
    'id': [113, -0.7],
    'in': [78, 20],
    'iq_ar': [43, 33],
    'it': [12, 41],
    'kz_kz': [66, 48],
    'levant': [35, 33],
    'lt': [23, 55],
    'lv': [24, 56],
    'mx': [-102, 23],
    'my': [101, 4],
    'n_africa': [6, 30],
    'nl': [5, 52],
    'no': [8, 60],
    'nz': [174, -40],
    'pe': [-75, -9],
    'ph': [121, 12],
    'pk': [69, 30],
    'pl': [19, 51],
    'pt': [-8, 39],
    'py': [-58, -23],
    'ro': [24, 45],
    'sa': [45, 23],
    'se': [18, 60],
    'sg': [103.8, 1.35],
    'si': [14, 46],
    'sk': [19, 48],
    'th': [100, 15],
    'tr': [35, 39],
    'tw': [121, 23],
    'ua': [31, 48],
    'uk': [-3, 55],
    'vn': [108, 14],
    'za': [22, -30]
};

type Status = 'live' | 'down' | 'error' | 'loading' | 'idle';

interface CountryStatus {
    status: Status;
    httpCode?: number;
    finalUrl?: string;
}

interface WorldMapProps {
    statuses: Record<string, CountryStatus>;
}

const WorldMap: React.FC<WorldMapProps> = ({ statuses }) => {
    const [position, setPosition] = useState({ coordinates: [0, 0], zoom: 1 });

    const handleMove = (position: any) => {
        setPosition(position);
    };

    return (
        <div style={{ width: '100%', background: '#f8f9fa', borderRadius: '12px', overflow: 'hidden', marginBottom: '2rem', border: '1px solid #e1e4e8' }}>
            <ComposableMap
                projection="geoEqualEarth"
                projectionConfig={{ scale: 140 }}
                width={800}
                height={400}
                style={{ width: "100%", height: "auto" }}
            >
                <ZoomableGroup
                    onMove={handleMove}
                    minZoom={1}
                    maxZoom={10}
                >
                    <Geographies geography={geoUrl}>
                        {({ geographies }) =>
                            geographies.map((geo) => (
                                <Geography
                                    key={geo.rsmKey}
                                    geography={geo}
                                    fill="#d1d5db" // Gray-300
                                    stroke="#ffffff"
                                    strokeWidth={0.5}
                                    style={{
                                        default: { outline: "none" },
                                        hover: { fill: "#9ca3af", outline: "none" }, // Gray-400
                                        pressed: { outline: "none" },
                                    }}
                                />
                            ))
                        }
                    </Geographies>

                    {Object.entries(statuses).map(([code, statusData]) => {
                        const coords = COUNTRY_COORDINATES[code];
                        if (!coords) return null;

                        let color = '#d1d5db'; // unknown
                        let size = 2; // Reduced size

                        switch (statusData.status) {
                            case 'live':
                                color = '#22c55e'; // Green
                                size = 3;
                                break;
                            case 'down':
                            case 'error':
                                color = '#ef4444'; // Red
                                size = 3;
                                break;
                            case 'loading':
                                color = '#eab308'; // Yellow
                                break;
                        }

                        // Show text only if zoom level is greater than 2
                        const showText = position.zoom > 2;

                        return (
                            <Marker key={code} coordinates={coords}>
                                <circle r={size + 1} fill={color} opacity={0.3} className="animate-pulse" />
                                <circle r={size} fill={color} stroke="#fff" strokeWidth={1} />
                                {showText && (
                                    <text
                                        textAnchor="middle"
                                        y={-4}
                                        style={{ fontFamily: "system-ui", fill: "#5D5A6D", fontSize: "3.5px", fontWeight: "bold" }}
                                    >
                                        {code.toUpperCase()}
                                    </text>
                                )}
                            </Marker>
                        );
                    })}
                </ZoomableGroup>
            </ComposableMap>
        </div>
    );
};


export default WorldMap;
