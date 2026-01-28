import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isDemo, demoData } from '../lib/supabase';
import { captureScreenshot } from '../lib/screenshot';

// Submit Page
export default function SubmitPage() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [isCapturing, setIsCapturing] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        deploy_url: '',
        github_url: '',
        category_id: '',
        event_id: '',
        license_id: '',
        thumbnail_url: ''
    });

    const [selectedLicense, setSelectedLicense] = useState(null);

    // 데모 데이터 사용 (Supabase 연결 여부와 관계없이)
    const categories = demoData.categories;
    const events = [...demoData.events].reverse(); // 최신 행사가 위로
    const licenses = demoData.licenses;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Update selected license for info display
        if (name === 'license_id' && value) {
            const license = licenses.find(l => l.id === parseInt(value));
            setSelectedLicense(license);
        } else if (name === 'license_id') {
            setSelectedLicense(null);
        }
    };

    const handleCaptureScreenshot = async () => {
        if (!formData.deploy_url) {
            alert('먼저 배포된 링크를 입력해주세요.');
            return;
        }

        setIsCapturing(true);
        try {
            const screenshotUrl = await captureScreenshot(formData.deploy_url);
            if (screenshotUrl) {
                setFormData(prev => ({ ...prev, thumbnail_url: screenshotUrl }));
            } else {
                alert('스크린샷 캡처에 실패했습니다. 직접 이미지 URL을 입력해주세요.');
            }
        } catch (error) {
            console.error('Screenshot error:', error);
            alert('스크린샷 캡처 중 오류가 발생했습니다.');
        } finally {
            setIsCapturing(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.title.trim()) {
            alert('프로젝트 제목을 입력해주세요.');
            return;
        }
        if (!formData.deploy_url.trim()) {
            alert('배포된 링크를 입력해주세요.');
            return;
        }
        if (!formData.description.trim()) {
            alert('프로젝트 설명을 입력해주세요.');
            return;
        }

        setIsLoading(true);

        try {
            // 썸네일이 없으면 기본 이미지 사용
            const thumbnailUrl = formData.thumbnail_url ||
                `https://picsum.photos/seed/${encodeURIComponent(formData.title)}/400/300`;

            // 성공 시뮬레이션 (나중에 Supabase 연동)
            await new Promise(resolve => setTimeout(resolve, 1000));
            alert('🎉 프로젝트가 성공적으로 등록되었습니다!');
            navigate('/');

        } catch (error) {
            console.error('Submit error:', error);
            alert('프로젝트 등록 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container" style={{ maxWidth: '800px', padding: 'var(--spacing-2xl) var(--spacing-lg)' }}>
            <h1 style={{ marginBottom: 'var(--spacing-lg)' }}>🚀 프로젝트 등록</h1>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-2xl)' }}>
                바이브코딩으로 만든 멋진 프로젝트를 공유해주세요! 다른 선생님들에게 영감을 줄 수 있습니다.
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)' }}>

                {/* Title */}
                <div className="form-group">
                    <label className="form-label">
                        프로젝트 제목 <span className="required">*</span>
                    </label>
                    <input
                        type="text"
                        name="title"
                        className="form-input"
                        placeholder="ex) AI 챗봇 수업 도우미"
                        value={formData.title}
                        onChange={handleChange}
                    />
                </div>

                {/* Deploy URL */}
                <div className="form-group">
                    <label className="form-label">
                        배포된 링크 <span className="required">*</span>
                    </label>
                    <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                        <input
                            type="url"
                            name="deploy_url"
                            className="form-input"
                            placeholder="https://my-project.vercel.app"
                            value={formData.deploy_url}
                            onChange={handleChange}
                            style={{ flex: 1 }}
                        />
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={handleCaptureScreenshot}
                            disabled={isCapturing}
                        >
                            {isCapturing ? '캡처 중...' : '📸 스크린샷'}
                        </button>
                    </div>
                    <p className="form-help">Vercel, Netlify, GitHub Pages 등에 배포된 URL을 입력하세요.</p>
                </div>

                {/* Thumbnail Preview */}
                {formData.thumbnail_url && (
                    <div className="form-group">
                        <label className="form-label">미리보기</label>
                        <div style={{
                            borderRadius: 'var(--border-radius-lg)',
                            overflow: 'hidden',
                            border: '1px solid var(--border-color)'
                        }}>
                            <img
                                src={formData.thumbnail_url}
                                alt="Preview"
                                style={{ width: '100%', display: 'block' }}
                            />
                        </div>
                    </div>
                )}

                {/* GitHub URL */}
                <div className="form-group">
                    <label className="form-label">GitHub 저장소 (선택)</label>
                    <input
                        type="url"
                        name="github_url"
                        className="form-input"
                        placeholder="https://github.com/username/repo"
                        value={formData.github_url}
                        onChange={handleChange}
                    />
                    <p className="form-help">코드를 공개하면 다른 분들이 배울 수 있어요!</p>
                </div>

                {/* Description */}
                <div className="form-group">
                    <label className="form-label">
                        프로젝트 설명 <span className="required">*</span>
                    </label>
                    <textarea
                        name="description"
                        className="form-textarea"
                        placeholder="프로젝트에 대해 설명해주세요. 어떤 문제를 해결하나요? 어떤 기술을 사용했나요? 수업에서 어떻게 활용할 수 있나요?"
                        value={formData.description}
                        onChange={handleChange}
                        rows={5}
                    />
                </div>

                {/* Category & Event */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-lg)' }}>
                    <div className="form-group">
                        <label className="form-label">주제 분류</label>
                        <select
                            name="category_id"
                            className="form-select"
                            value={formData.category_id}
                            onChange={handleChange}
                        >
                            <option value="">선택하세요</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.icon} {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">행사/연수 (선택)</label>
                        <select
                            name="event_id"
                            className="form-select"
                            value={formData.event_id}
                            onChange={handleChange}
                        >
                            <option value="">해당 없음</option>
                            {events.map(evt => (
                                <option key={evt.id} value={evt.id}>
                                    {evt.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* License */}
                <div className="form-group">
                    <label className="form-label">라이센스 (선택)</label>
                    <select
                        name="license_id"
                        className="form-select"
                        value={formData.license_id}
                        onChange={handleChange}
                    >
                        <option value="">라이센스 선택 안함</option>
                        {licenses.map(lic => (
                            <option key={lic.id} value={lic.id}>
                                {lic.short_name} - {lic.name}
                            </option>
                        ))}
                    </select>
                    <p className="form-help">
                        라이센스를 지정하면 다른 분들이 어떻게 활용할 수 있는지 명확해져요.
                    </p>

                    {/* License Info */}
                    {selectedLicense && (
                        <div className="license-info" style={{ marginTop: 'var(--spacing-md)' }}>
                            <h4 className="license-info-title">📜 {selectedLicense.name}</h4>
                            <p className="license-info-description">{selectedLicense.description}</p>
                            <div className="license-badges">
                                <span className={`license-badge ${selectedLicense.allow_commercial ? 'allowed' : 'restricted'}`}>
                                    {selectedLicense.allow_commercial ? '✅ 상업적 이용 가능' : '⚠️ 비상업적만'}
                                </span>
                                <span className={`license-badge ${selectedLicense.require_attribution ? 'restricted' : 'allowed'}`}>
                                    {selectedLicense.require_attribution ? '📝 출처 표시 필요' : '✅ 출처 표시 불필요'}
                                </span>
                                <span className={`license-badge ${selectedLicense.allow_modification ? 'allowed' : 'restricted'}`}>
                                    {selectedLicense.allow_modification ? '✅ 수정 가능' : '⚠️ 수정 불가'}
                                </span>
                            </div>
                            {selectedLicense.url && (
                                <a
                                    href={selectedLicense.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ display: 'inline-block', marginTop: 'var(--spacing-md)', fontSize: 'var(--text-sm)' }}
                                >
                                    라이센스 전문 보기 →
                                </a>
                            )}
                        </div>
                    )}
                </div>

                {/* License Guide */}
                <div style={{
                    background: 'var(--color-bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--border-radius-lg)',
                    padding: 'var(--spacing-lg)'
                }}>
                    <h4 style={{ marginBottom: 'var(--spacing-md)' }}>💡 라이센스 선택 가이드</h4>
                    <div style={{
                        display: 'grid',
                        gap: 'var(--spacing-md)',
                        fontSize: 'var(--text-sm)',
                        color: 'var(--color-text-secondary)'
                    }}>
                        <p>
                            <strong>MIT / Apache-2.0</strong>: 가장 자유로운 라이센스. 누구나 자유롭게 사용, 수정, 배포 가능.
                            출처만 표시하면 됩니다.
                        </p>
                        <p>
                            <strong>CC BY-NC</strong>: 비상업적 용도로만 사용 가능. 교육 자료 공유에 적합합니다.
                            학교나 연수 등에서는 자유롭게 사용할 수 있지만, 상업적 판매는 불가.
                        </p>
                        <p>
                            <strong>GPL-3.0</strong>: 수정한 코드도 같은 라이센스로 공개해야 합니다.
                            오픈소스 정신을 지키고 싶을 때 선택하세요.
                        </p>
                        <p>
                            <strong>라이센스 미선택</strong>: 저작권법에 따라 기본적으로 모든 권리가 저작자에게 있습니다.
                            다른 분들이 활용하기 어려울 수 있어요.
                        </p>
                    </div>
                </div>

                {/* Submit Button */}
                <div style={{ display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'flex-end' }}>
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => navigate('/')}
                    >
                        취소
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isLoading}
                    >
                        {isLoading ? '등록 중...' : '🚀 프로젝트 등록하기'}
                    </button>
                </div>

            </form>
        </div>
    );
}
