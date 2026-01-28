import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { isDemo, demoData } from '../lib/supabase';

// Calculate hotness (like ratio)
const calculateHotness = (project) => {
    if (project.view_count === 0) return 0;
    return (project.like_count / project.view_count) * 100;
};

// Format date
const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return '오늘';
    if (days === 1) return '어제';
    if (days < 7) return `${days}일 전`;
    return date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });
};

// Project Card Component
function ProjectCard({ project }) {
    const hotness = calculateHotness(project);
    const isHot = hotness > 20; // 좋아요 비율 20% 이상이면 Hot

    return (
        <Link to={`/project/${project.id}`} className="card project-card">
            <div className="project-card-thumbnail">
                <img
                    src={project.thumbnail_url || 'https://picsum.photos/seed/default/400/300'}
                    alt={project.title}
                    loading="lazy"
                />
                <div className="project-card-badge">
                    {isHot && <span className="badge badge-hot">🔥 HOT</span>}
                    {project.license && (
                        <span className="badge">{project.license.short_name}</span>
                    )}
                </div>
            </div>

            <div className="project-card-content">
                <span className="project-card-category">
                    {project.category?.icon} {project.category?.name}
                </span>
                <h3 className="project-card-title">{project.title}</h3>
                <p className="project-card-description">{project.description}</p>
            </div>

            <div className="project-card-footer">
                <div className="project-card-author">
                    <span>{project.user?.display_name || '익명'}</span>
                    <span>·</span>
                    <span>{formatDate(project.created_at)}</span>
                </div>
                <div className="project-card-stats">
                    <span className="stat">
                        👁️ {project.view_count}
                    </span>
                    <span className="stat stat-like">
                        ❤️ {project.like_count}
                    </span>
                    <span className="stat">
                        💬 {project.comment_count}
                    </span>
                </div>
            </div>
        </Link>
    );
}

// Filter Tab Component
function FilterTabs({ options, value, onChange, label }) {
    return (
        <div className="filter-group">
            {label && <span className="filter-label">{label}</span>}
            <div className="filter-tabs">
                {options.map(option => (
                    <button
                        key={option.value}
                        className={`filter-tab ${value === option.value ? 'active' : ''}`}
                        onClick={() => onChange(option.value)}
                    >
                        {option.label}
                    </button>
                ))}
            </div>
        </div>
    );
}

// Home Page
export default function HomePage() {
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [eventFilter, setEventFilter] = useState('all');
    const [sortBy, setSortBy] = useState('latest');

    // Get data (demo or real)
    const categories = isDemo ? demoData.categories : [];
    // 최신 행사가 맨 위로 오도록 역순 정렬
    const events = isDemo ? [...demoData.events].reverse() : [];
    const allProjects = isDemo ? demoData.projects : [];

    // Filter and sort projects
    const filteredProjects = useMemo(() => {
        let result = [...allProjects];

        // Category filter
        if (categoryFilter !== 'all') {
            result = result.filter(p => p.category?.id === parseInt(categoryFilter));
        }

        // Event filter
        if (eventFilter !== 'all') {
            result = result.filter(p => p.event?.id === parseInt(eventFilter));
        }

        // Sort
        switch (sortBy) {
            case 'latest':
                result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                break;
            case 'likes':
                result.sort((a, b) => b.like_count - a.like_count);
                break;
            case 'views':
                result.sort((a, b) => b.view_count - a.view_count);
                break;
            case 'hotness':
                result.sort((a, b) => calculateHotness(b) - calculateHotness(a));
                break;
            default:
                break;
        }

        return result;
    }, [allProjects, categoryFilter, eventFilter, sortBy]);

    // Stats
    const totalProjects = allProjects.length;
    const totalLikes = allProjects.reduce((sum, p) => sum + p.like_count, 0);
    const totalComments = allProjects.reduce((sum, p) => sum + p.comment_count, 0);

    return (
        <div className="container">
            {/* Hero Section */}
            <section className="hero">
                <h1 className="hero-title">
                    선생님들의 <span className="highlight">바이브코딩</span> 작품 갤러리
                </h1>
                <p className="hero-subtitle">
                    AI와 함께 만든 교육용 웹 프로젝트들을 공유하고, 함께 성장하는 공간입니다.
                    영감을 주고받고, 서로의 코드에서 배워보세요!
                </p>
                <div className="hero-stats">
                    <div className="hero-stat">
                        <div className="hero-stat-value">{totalProjects}</div>
                        <div className="hero-stat-label">프로젝트</div>
                    </div>
                    <div className="hero-stat">
                        <div className="hero-stat-value">{totalLikes}</div>
                        <div className="hero-stat-label">좋아요</div>
                    </div>
                    <div className="hero-stat">
                        <div className="hero-stat-value">{totalComments}</div>
                        <div className="hero-stat-label">댓글</div>
                    </div>
                </div>
            </section>

            {/* Filter Bar */}
            <div className="filter-bar">
                <FilterTabs
                    label="주제"
                    value={categoryFilter}
                    onChange={setCategoryFilter}
                    options={[
                        { value: 'all', label: '전체' },
                        ...categories.map(c => ({ value: c.id.toString(), label: `${c.icon} ${c.name}` }))
                    ]}
                />

                <div className="filter-group">
                    <span className="filter-label">행사/연수</span>
                    <select
                        className="form-select"
                        value={eventFilter}
                        onChange={(e) => setEventFilter(e.target.value)}
                        style={{
                            background: 'var(--color-bg-tertiary)',
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-md)',
                            padding: 'var(--spacing-sm) var(--spacing-md)',
                            color: 'var(--color-text-primary)',
                            fontSize: 'var(--text-sm)',
                            cursor: 'pointer',
                            minWidth: '200px'
                        }}
                    >
                        <option value="all">전체 행사</option>
                        {events.map(e => (
                            <option key={e.id} value={e.id.toString()}>{e.name}</option>
                        ))}
                    </select>
                </div>

                <div style={{ flex: 1 }} />

                <FilterTabs
                    label="정렬"
                    value={sortBy}
                    onChange={setSortBy}
                    options={[
                        { value: 'latest', label: '최신순' },
                        { value: 'likes', label: '좋아요순' },
                        { value: 'views', label: '조회순' },
                        { value: 'hotness', label: '🔥 HOT' },
                    ]}
                />
            </div>

            {/* Project Grid */}
            {filteredProjects.length > 0 ? (
                <div className="project-grid">
                    {filteredProjects.map(project => (
                        <ProjectCard key={project.id} project={project} />
                    ))}
                </div>
            ) : (
                <div className="empty-state">
                    <div className="empty-state-icon">📭</div>
                    <h3>프로젝트가 없습니다</h3>
                    <p>선택한 필터에 해당하는 프로젝트가 없습니다.</p>
                </div>
            )}
        </div>
    );
}
