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
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                'Accept-Language': 'en-US,en;q=0.9',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                'Upgrade-Insecure-Requests': '1'
            },
            redirect: 'follow',
            cache: 'no-store'
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
