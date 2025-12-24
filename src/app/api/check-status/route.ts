import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const country = searchParams.get('country');

    if (!country) {
        return NextResponse.json({ error: 'Country code required' }, { status: 400 });
    }

    const targetUrl = `https://www.samsung.com/${country}/tvs/help-me-choose/`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

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
            cache: 'no-store',
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        let isLive = response.status === 200;
        let status = isLive ? 'live' : 'down';

        if (isLive) {
            const html = await response.text();
            const lowerHtml = html.toLowerCase();

            // 1. Content Check: "Page Not Found" indicators
            const errorPhrases = [
                'page not found',
                '페이지를 찾을 수가 없어요', // KR
                'seite nicht gefunden', // DE
                'page introuvable', // FR
                'página no encontrada' // ES
            ];

            if (errorPhrases.some(phrase => lowerHtml.includes(phrase))) {
                isLive = false;
                status = 'down';
            } else {
                // 2. Title Check: Heuristic for generic homepage redirects
                const titleMatch = html.match(/<title>(.*?)<\/title>/i);
                const title = titleMatch ? titleMatch[1].trim() : '';
                const lowerTitle = title.toLowerCase();

                // Valid HMC pages usually have these keywords
                // Added Chinese keywords for HK/TW support
                const validKeywords = [
                    'tv', 'choose', 'finder', 'guide', 'selector', 'television', 'fernseher',
                    '電視', '顯示器'
                ];

                // If title is short (likely "Samsung [Country]") and lacks HMC keywords, it's likely a redirect to home
                if (title.length < 35 && !validKeywords.some(w => lowerTitle.includes(w))) {
                    isLive = false;
                    status = 'down';
                }
            }
        }

        return NextResponse.json({
            country,
            status: status as any,
            httpCode: response.status,
            finalUrl: response.url
        });
    } catch (error) {
        return NextResponse.json({ country, status: 'error', message: String(error) }, { status: 500 });
    }
}
