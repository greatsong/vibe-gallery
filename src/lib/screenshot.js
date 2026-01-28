// 스크린샷 캡처 - 여러 방법 시도

/**
 * URL에서 스크린샷을 캡처합니다.
 * Microlink API 무료 티어 사용 (fallback 포함)
 * @param {string} url - 캡처할 웹페이지 URL
 * @returns {Promise<string|null>} - 스크린샷 이미지 URL 또는 null
 */
export async function captureScreenshot(url) {
    // 방법 1: Microlink API
    try {
        const params = new URLSearchParams({
            url: url,
            screenshot: 'true',
            meta: 'false',
            embed: 'screenshot.url',
        });

        const response = await fetch(`https://api.microlink.io?${params}`);
        const data = await response.json();

        if (data.status === 'success' && data.data?.screenshot?.url) {
            return data.data.screenshot.url;
        }
    } catch (error) {
        console.warn('Microlink failed:', error);
    }

    // 방법 2: Screenshot Machine (무료 체험)
    try {
        const screenshotUrl = `https://image.thum.io/get/width/1280/crop/800/${encodeURIComponent(url)}`;
        // 이미지가 유효한지 확인
        const testImg = new Image();
        return new Promise((resolve) => {
            testImg.onload = () => resolve(screenshotUrl);
            testImg.onerror = () => resolve(null);
            testImg.src = screenshotUrl;
            // 5초 타임아웃
            setTimeout(() => resolve(null), 5000);
        });
    } catch (error) {
        console.warn('Thum.io failed:', error);
    }

    // 방법 3: 랜덤 placeholder 이미지 사용
    const seed = encodeURIComponent(url);
    return `https://picsum.photos/seed/${seed}/400/300`;
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

        const response = await fetch(`https://api.microlink.io?${params}`);
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
