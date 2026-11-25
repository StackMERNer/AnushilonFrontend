'use client';
import dynamic from 'next/dynamic';

const Reader = dynamic(() => import('./Reader'), {
    ssr: false,
    loading: () => <p style={{ padding: 16 }}>Loading reader...</p>,
});

export default function Page() {
    return <Reader />;
}