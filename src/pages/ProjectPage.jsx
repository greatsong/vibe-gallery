import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { isDemo, demoData, supabase, getProject } from '../lib/supabase';

// Format date
const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// Comment Component
function Comment({ comment }) {
    const initial = comment.user?.display_name?.[0] || '?';

    return (
        <div className="comment">
            <div className="comment-avatar">{initial}</div>
            <div className="comment-content">
                <div className="comment-author">{comment.user?.display_name || '익명'}</div>
                <div className="comment-text">{comment.content}</div>
                <div className="comment-time">{formatDate(comment.created_at)}</div>
            </div>
        </div>
    );
}

// License Info Component
function LicenseInfo({ license }) {
    if (!license) return null;

    return (
        <div className="license-info">
            <h4 className="license-info-title">📜 {license.name}</h4>
            <p className="license-info-description">{license.description}</p>
            <div className="license-badges">
                <span className={`license-badge ${license.allow_commercial ? 'allowed' : 'restricted'}`}>
                    {license.allow_commercial ? '✅ 상업적 이용 가능' : '⚠️ 비상업적만'}
                </span>
                <span className={`license-badge ${license.require_attribution ? 'restricted' : 'allowed'}`}>
                    {license.require_attribution ? '📝 출처 표시 필요' : '✅ 출처 표시 불필요'}
                </span>
                <span className={`license-badge ${license.allow_modification ? 'allowed' : 'restricted'}`}>
                    {license.allow_modification ? '✅ 수정 가능' : '⚠️ 수정 불가'}
                </span>
            </div>
            {license.url && (
                <a
                    href={license.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'inline-block', marginTop: 'var(--spacing-md)', fontSize: 'var(--text-sm)' }}
                >
                    라이센스 전문 보기 →
                </a>
            )}
        </div>
    );
}

// Project Page
export default function ProjectPage({ user }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);

    useEffect(() => {
        // Load project data
        if (isDemo) {
            const found = demoData.projects.find(p => p.id === id);
            if (found) {
                setProject(found);
                setLikeCount(found.like_count);
                setComments(demoData.comments[id] || []);
            }
        }
        // TODO: Real Supabase query
    }, [id]);

    const handleLike = () => {
        if (isLiked) {
            setLikeCount(prev => prev - 1);
        } else {
            setLikeCount(prev => prev + 1);
        }
        setIsLiked(!isLiked);
    };

    const handleAddComment = () => {
        if (!newComment.trim()) return;

        const comment = {
            id: `c${Date.now()}`,
            user: { display_name: '나' },
            content: newComment.trim(),
            created_at: new Date().toISOString()
        };

        setComments(prev => [...prev, comment]);
        setNewComment('');
    };

    if (!project) {
        return (
            <div className="container">
                <div className="loading">
                    <div className="loading-spinner"></div>
                    <p>프로젝트를 불러오는 중...</p>
                </div>
            </div>
        );
    }

    const hotness = project.view_count > 0
        ? ((project.like_count / project.view_count) * 100).toFixed(1)
        : 0;

    return (
        <div className="container project-detail">
            {/* Breadcrumb */}
            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                <Link to="/" style={{ color: 'var(--color-text-muted)' }}>
                    ← 갤러리로 돌아가기
                </Link>
            </div>

            {/* Header */}
            <div className="project-detail-header">
                <div className="project-detail-meta">
                    <span className="badge" style={{ background: 'var(--color-accent)' }}>
                        {project.category?.icon} {project.category?.name}
                    </span>
                    {project.event && (
                        <span className="badge">
                            📅 {project.event.name}
                        </span>
                    )}
                </div>

                <h1 className="project-detail-title">{project.title}</h1>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--spacing-lg)',
                    color: 'var(--color-text-secondary)',
                    fontSize: 'var(--text-sm)'
                }}>
                    <span>👤 {project.user?.display_name}</span>
                    <span>📅 {formatDate(project.created_at)}</span>
                    <span>👁️ 조회 {project.view_count}</span>
                    <span>🔥 Hotness {hotness}%</span>
                </div>
            </div>

            {/* Thumbnail */}
            <div className="project-detail-thumbnail">
                <img
                    src={project.thumbnail_url || 'https://picsum.photos/seed/default/800/450'}
                    alt={project.title}
                />
            </div>

            {/* Action Buttons */}
            <div className="project-detail-actions">
                <a
                    href={project.deploy_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                >
                    🚀 사이트 방문하기
                </a>
                {project.github_url && (
                    <a
                        href={project.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary"
                    >
                        📦 GitHub 보기
                    </a>
                )}
                <button
                    className={`btn btn-secondary btn-like ${isLiked ? 'liked' : ''}`}
                    onClick={handleLike}
                >
                    {isLiked ? '❤️' : '🤍'} 좋아요 {likeCount}
                </button>

                {/* 본인 글 수정 버튼 */}
                {user && project.user_id === user.id && (
                    <button
                        className="btn btn-secondary"
                        onClick={() => navigate(`/edit/${project.id}`)}
                    >
                        ✏️ 수정하기
                    </button>
                )}
            </div>

            {/* Description */}
            <div className="project-detail-description">
                {project.description}
            </div>

            {/* License Info */}
            {project.license && <LicenseInfo license={project.license} />}

            {/* Comments Section */}
            <section className="comments-section">
                <h2 className="comments-title">💬 댓글 {comments.length}개</h2>

                <div className="comment-form">
                    <input
                        type="text"
                        className="form-input comment-form-input"
                        placeholder="댓글을 입력하세요..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                    />
                    <button className="btn btn-primary" onClick={handleAddComment}>
                        작성
                    </button>
                </div>

                <div className="comment-list">
                    {comments.length > 0 ? (
                        comments.map(comment => (
                            <Comment key={comment.id} comment={comment} />
                        ))
                    ) : (
                        <div className="empty-state">
                            <p>아직 댓글이 없습니다. 첫 댓글을 남겨보세요!</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
