import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { isDemo, demoData, supabase, updateProject, getProject } from '../lib/supabase';

// Edit Page - 프로젝트 수정
export default function EditPage({ user }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        deploy_url: '',
        github_url: '',
        category_id: '',
        event_id: '',
        license_id: '',
        author_name: ''
    });

    const [selectedLicense, setSelectedLicense] = useState(null);

    const categories = demoData.categories;
    const events = [...demoData.events].reverse();
    const licenses = demoData.licenses;

    useEffect(() => {
        async function fetchProject() {
            if (isDemo) {
                const found = demoData.projects.find(p => p.id === id);
                if (found) {
                    setFormData({
                        title: found.title || '',
                        description: found.description || '',
                        deploy_url: found.deploy_url || '',
                        github_url: found.github_url || '',
                        category_id: found.category_id?.toString() || '',
                        event_id: found.event_id?.toString() || '',
                        license_id: found.license_id?.toString() || '',
                        author_name: found.author_name || ''
                    });
                }
                setIsFetching(false);
                return;
            }

            // Supabase에서 프로젝트 가져오기
            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                console.error('Fetch error:', error);
                alert('프로젝트를 불러오는데 실패했습니다.');
                navigate('/');
                return;
            }

            // 본인 글인지 확인
            if (user && data.user_id !== user.id) {
                alert('수정 권한이 없습니다.');
                navigate(`/project/${id}`);
                return;
            }

            setFormData({
                title: data.title || '',
                description: data.description || '',
                deploy_url: data.deploy_url || '',
                github_url: data.github_url || '',
                category_id: data.category_id?.toString() || '',
                event_id: data.event_id?.toString() || '',
                license_id: data.license_id?.toString() || '',
                author_name: data.author_name || ''
            });
            setIsFetching(false);
        }

        fetchProject();
    }, [id, user, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'license_id' && value) {
            const license = licenses.find(l => l.id === parseInt(value));
            setSelectedLicense(license);
        } else if (name === 'license_id') {
            setSelectedLicense(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

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
        if (!formData.author_name.trim()) {
            alert('닉네임(학교명)을 입력해주세요.');
            return;
        }

        setIsLoading(true);

        try {
            if (!isDemo && supabase) {
                const projectData = {
                    title: formData.title.trim(),
                    description: formData.description.trim(),
                    deploy_url: formData.deploy_url.trim(),
                    github_url: formData.github_url.trim() || null,
                    category_id: formData.category_id ? parseInt(formData.category_id) : null,
                    event_id: formData.event_id ? parseInt(formData.event_id) : null,
                    license_id: formData.license_id ? parseInt(formData.license_id) : null,
                    author_name: formData.author_name.trim()
                };

                const { error } = await supabase
                    .from('projects')
                    .update(projectData)
                    .eq('id', id);

                if (error) {
                    console.error('Update error:', error);
                    alert('수정 중 오류가 발생했습니다: ' + error.message);
                    return;
                }

                alert('✅ 프로젝트가 수정되었습니다!');
            } else {
                await new Promise(resolve => setTimeout(resolve, 1000));
                alert('✅ 프로젝트가 수정되었습니다! (데모 모드)');
            }

            navigate(`/project/${id}`);

        } catch (error) {
            console.error('Submit error:', error);
            alert('수정 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching) {
        return (
            <div className="container" style={{ textAlign: 'center', padding: 'var(--spacing-2xl)' }}>
                <div className="loading-spinner"></div>
                <p>프로젝트 정보를 불러오는 중...</p>
            </div>
        );
    }

    return (
        <div className="container" style={{ maxWidth: '800px', padding: 'var(--spacing-2xl) var(--spacing-lg)' }}>
            <h1 style={{ marginBottom: 'var(--spacing-lg)' }}>✏️ 프로젝트 수정</h1>

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

                {/* 닉네임 (학교명) */}
                <div className="form-group">
                    <label className="form-label">
                        닉네임 (학교명) <span className="required">*</span>
                    </label>
                    <input
                        type="text"
                        name="author_name"
                        className="form-input"
                        placeholder="ex) ○○초등학교"
                        value={formData.author_name}
                        onChange={handleChange}
                    />
                    <p className="form-help" style={{ color: 'var(--color-warning)' }}>
                        ⚠️ 소속 학교 이름이 아닌 경우 관리자에 의해 비활성화될 수 있습니다.
                    </p>
                </div>

                {/* Deploy URL */}
                <div className="form-group">
                    <label className="form-label">
                        배포된 링크 <span className="required">*</span>
                    </label>
                    <input
                        type="url"
                        name="deploy_url"
                        className="form-input"
                        placeholder="https://my-project.vercel.app"
                        value={formData.deploy_url}
                        onChange={handleChange}
                    />
                </div>

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
                </div>

                {/* Description */}
                <div className="form-group">
                    <label className="form-label">
                        프로젝트 설명 <span className="required">*</span>
                    </label>
                    <textarea
                        name="description"
                        className="form-textarea"
                        placeholder="프로젝트에 대해 설명해주세요."
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
                </div>

                {/* Buttons */}
                <div style={{ display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'flex-end' }}>
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => navigate(`/project/${id}`)}
                    >
                        취소
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isLoading}
                    >
                        {isLoading ? '저장 중...' : '✅ 수정 완료'}
                    </button>
                </div>

            </form>
        </div>
    );
}
