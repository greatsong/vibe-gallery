// Microlink API를 사용한 URL 스크린샷 캡처

const MICROLINK_API = 'https://api.microlink.io';

/**
 * URL에서 스크린샷을 캡처합니다.
 * @param {string} url - 캡처할 웹페이지 URL
 * @returns {Promise<string|null>} - 스크린샷 이미지 URL 또는 null
 */
export async function captureScreenshot(url) {
    try {
        const params = new URLSearchParams({
            url: url,
            screenshot: 'true',
            meta: 'false',
            embed: 'screenshot.url',
            waitForTimeout: '3000', // 페이지 로딩 대기
            viewport: JSON.stringify({ width: 1280, height: 800 }),
        });

        const response = await fetch(`${MICROLINK_API}?${params}`);
        const data = await response.json();

        if (data.status === 'success' && data.data?.screenshot?.url) {
            return data.data.screenshot.url;
        }

        console.warn('Screenshot capture returned no data:', data);
        return null;
    } catch (error) {
        console.error('Screenshot capture failed:', error);
        return null;
    }
}

/**
 * URL에서 메타데이터(제목, 설명, 아이콘 등)를 가져옵니다.
 * @param {string} url - 메타데이터를 가져올 URL
 * @returns {Promise<object|null>} - 메타데이터 객체 또는 null
 */
export async function getUrlMetadata(url) {
    try {
        const params = new URLSearchParams({
            url: url,
        });

        const response = await fetch(`${MICROLINK_API}?${params}`);
        const data = await response.json();

        if (data.status === 'success') {
            return {
                title: data.data.title,
                description: data.data.description,
                image: data.data.image?.url,
                logo: data.data.logo?.url,
                publisher: data.data.publisher,
            };
        }

        return null;
    } catch (error) {
        console.error('Metadata fetch failed:', error);
        return null;
    }
}
