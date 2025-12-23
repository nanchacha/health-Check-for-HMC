import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const country = searchParams.get('country');

    if (!country) {
        return NextResponse.json({ error: 'Country code required' }, { status: 400 });
    }

    const targetUrl = `https://www.samsung.com/${country}/tvs/help-me-choose/`;

    try {
        const response = await fetch(targetUrl, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            redirect: 'follow'
        });

        const isLive = response.status === 200; // Only strict 200 counts as live? User said "Loading normally". 
        // redirects might be okay if they go to the slash version?
        // Let's pass the status back.

        return NextResponse.json({
            country,
            status: isLive ? 'live' : 'down',
            httpCode: response.status,
            finalUrl: response.url
        });
    } catch (error) {
        return NextResponse.json({ country, status: 'error', message: String(error) }, { status: 500 });
    }
}
