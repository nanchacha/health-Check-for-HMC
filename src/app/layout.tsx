import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Samsung HMC Health Check',
    description: 'Health check dashboard for Samsung Help Me Choose pages',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
