import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { isDemo, demoData, signInWithGoogle, signOut, getSession, onAuthStateChange } from './lib/supabase';
import HomePage from './pages/HomePage';
import ProjectPage from './pages/ProjectPage';
import SubmitPage from './pages/SubmitPage';
import './index.css';

// Header Component with Auth
function Header({ user, onLogin, onLogout }) {
  const location = useLocation();

  return (
    <header className="header">
      <div className="container header-content">
        <Link to="/" className="logo">
          <span className="logo-icon">🚀</span>
          <span className="logo-text">Vibe Gallery</span>
        </Link>

        <nav className="nav">
          <Link
            to="/"
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            갤러리
          </Link>
          <Link
            to="/submit"
            className={`nav-link ${location.pathname === '/submit' ? 'active' : ''}`}
          >
            프로젝트 등록
          </Link>
          {isDemo && (
            <span className="badge" style={{ background: 'var(--color-warning)', color: '#000' }}>
              데모 모드
            </span>
          )}
        </nav>

        <div className="nav">
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                {user.user_metadata?.avatar_url ? (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt="Profile"
                    style={{ width: 32, height: 32, borderRadius: '50%' }}
                  />
                ) : (
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'var(--gradient-accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 600,
                    fontSize: 'var(--text-sm)'
                  }}>
                    {(user.user_metadata?.full_name || user.email)?.[0]?.toUpperCase()}
                  </div>
                )}
                <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
                  {user.user_metadata?.full_name || user.email}
                </span>
              </div>
              <button className="btn btn-ghost" onClick={onLogout}>
                로그아웃
              </button>
            </div>
          ) : (
            <button className="btn btn-primary" onClick={onLogin}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ marginRight: 6 }}>
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google로 로그인
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

// AI Chat FAB Component
function AIChatFAB({ onClick }) {
  return (
    <button className="ai-chat-fab" onClick={onClick} title="AI 검색">
      🤖
    </button>
  );
}

// AI Chat Panel Component with Conversation Memory
function AIChatPanel({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '안녕하세요! 👋 바이브코딩 갤러리에서 원하는 프로젝트를 찾아드릴게요. 무엇을 찾고 계신가요?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    // 먼저 입력창 완전히 비우기
    setInput('');

    const userMessage = trimmedInput;

    const newMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    // 대화 히스토리를 기반으로 응답 생성
    setTimeout(() => {
      const demoResponse = getDemoResponseWithContext(newMessages, userMessage);
      setMessages(prev => [...prev, { role: 'assistant', content: demoResponse }]);
      setIsLoading(false);
    }, 800);
  };

  // 대화 기록을 기억하고 맥락에 맞게 응답
  const getDemoResponseWithContext = (conversationHistory, latestQuery) => {
    const lowQuery = latestQuery.toLowerCase();

    // 이전 대화에서 언급된 주제 파악
    const previousTopics = conversationHistory
      .filter(m => m.role === 'user')
      .map(m => m.content.toLowerCase())
      .join(' ');

    // 후속 질문 처리
    if (lowQuery.includes('더 알려') || lowQuery.includes('자세히') || lowQuery.includes('어떻게')) {
      // 이전에 언급된 주제에 대해 더 자세히 설명
      if (previousTopics.includes('ai') || previousTopics.includes('챗봇')) {
        return '🤖 "AI 챗봇 수업 도우미"에 대해 더 자세히 알려드릴게요!\n\n• **기술 스택**: Google Gemini API, React, Vercel\n• **활용 방법**: 수업 중 학생 질문 답변, 개념 설명\n• **특징**: 한국어 지원, 교육 맥락에 맞춤화\n• **라이센스**: MIT (자유롭게 사용 가능)\n\n갤러리에서 직접 확인해보시겠어요?';
      }
      if (previousTopics.includes('정렬') || previousTopics.includes('알고리즘')) {
        return '📊 "정렬 알고리즘 시각화" 프로젝트에 대해 더 자세히!\n\n• **지원 알고리즘**: 버블정렬, 퀵정렬, 병합정렬, 삽입정렬\n• **특징**: 속도 조절 가능, 스텝별 실행\n• **교육 활용**: 알고리즘 수업 시 시각적 이해 도움\n\n"알고리즘수업자료" 카테고리에서 더 많은 자료를 찾아보세요!';
      }
      if (previousTopics.includes('데이터') || previousTopics.includes('대시보드')) {
        return '📈 "데이터 시각화 대시보드" 상세 정보입니다!\n\n• **데이터 소스**: 공공데이터 포털 API\n• **차트 종류**: 막대, 선, 파이, 히트맵\n• **교육 활용**: 실제 데이터 분석 실습\n\nGitHub 링크도 있어서 코드를 참고하실 수 있어요!';
      }
      return '어떤 프로젝트에 대해 더 알고 싶으신가요? 카테고리(AI수업자료, 알고리즘, 데이터, 업무자동화)를 말씀해주시면 관련 프로젝트를 추천해드릴게요! 🔍';
    }

    // 감사/인사 처리
    if (lowQuery.includes('고마워') || lowQuery.includes('감사') || lowQuery.includes('좋아')) {
      return '도움이 되셨다니 기뻐요! 😊 더 궁금한 점이 있으시면 언제든 물어봐주세요. 다른 카테고리의 프로젝트도 찾아드릴 수 있어요!';
    }

    // 비교 요청 처리
    if (lowQuery.includes('비교') || lowQuery.includes('차이') || lowQuery.includes('뭐가 다')) {
      return '📋 프로젝트 비교해드릴게요!\n\n**AI수업자료** vs **알고리즘수업자료**:\n• AI수업: Gemini/GPT API 활용, 대화형 학습\n• 알고리즘: 시각화 중심, 개념 이해 도움\n\n수업 목표에 따라 선택하시면 됩니다! 어떤 수업에 활용하실 계획이신가요?';
    }

    // 주제별 기본 응답
    if (lowQuery.includes('ai') || lowQuery.includes('챗봇') || lowQuery.includes('인공지능')) {
      return '🤖 AI 관련 프로젝트를 찾으셨네요!\n\n추천 프로젝트: **"AI 챗봇 수업 도우미"**\n• Google Gemini API 활용\n• 수업 중 실시간 Q&A 가능\n• 좋아요 42개로 인기 프로젝트!\n\n더 자세히 알려드릴까요?';
    }
    if (lowQuery.includes('정렬') || lowQuery.includes('알고리즘') || lowQuery.includes('시각화')) {
      return '📊 알고리즘 교육에 관심이 있으시군요!\n\n추천 프로젝트: **"정렬 알고리즘 시각화"**\n• 버블/퀵/병합 정렬 비교 가능\n• 좋아요 67개 - 갤러리 내 최다!\n• CC-BY 라이센스로 자유롭게 활용\n\n자세한 내용이 궁금하신가요?';
    }
    if (lowQuery.includes('데이터') || lowQuery.includes('대시보드') || lowQuery.includes('분석')) {
      return '📈 데이터 관련 프로젝트입니다!\n\n추천: **"데이터 시각화 대시보드"**\n• 공공데이터 API 활용 교육\n• 인터랙티브 차트 제공\n• GitHub 소스 코드 공개\n\n더 알아보시겠어요?';
    }
    if (lowQuery.includes('자동화') || lowQuery.includes('출석') || lowQuery.includes('업무')) {
      return '⚙️ 업무 자동화 도구예요!\n\n추천: **"학급 출석부 자동화"**\n• Google Sheets 연동\n• QR코드 출석 체크 지원\n• 정보교사 해커톤 수상작\n\n상세 정보를 원하시나요?';
    }

    // 프로젝트 개수/통계 질문
    if (lowQuery.includes('몇 개') || lowQuery.includes('얼마나') || lowQuery.includes('통계')) {
      return `📊 현재 갤러리 현황이에요!\n\n• 총 프로젝트: ${demoData.projects.length}개\n• AI수업자료: 1개\n• 알고리즘: 1개\n• 데이터: 1개\n• 업무자동화: 1개\n\n어떤 카테고리가 궁금하세요?`;
    }

    // 기본 응답 (맥락 유지)
    const topicSuggestion = previousTopics.length > 50
      ? '\n\n이전에 나눈 대화를 바탕으로 더 구체적인 질문을 해주셔도 좋아요!'
      : '';

    return `현재 갤러리에는 다양한 바이브코딩 프로젝트가 있어요! 🎨\n\n• 🤖 AI수업자료\n• 📊 알고리즘수업자료\n• 📈 데이터수업자료\n• ⚙️ 업무자동화\n\n어떤 분야에 관심이 있으신가요?${topicSuggestion}`;
  };

  const handleClearChat = () => {
    setMessages([
      { role: 'assistant', content: '대화가 초기화되었어요! 👋 무엇을 도와드릴까요?' }
    ]);
  };

  if (!isOpen) return null;

  return (
    <div className="ai-chat-panel">
      <div className="ai-chat-header">
        <div className="ai-chat-title">
          <span>🤖</span>
          <span>AI 프로젝트 검색</span>
        </div>
        <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
          <button
            className="modal-close"
            onClick={handleClearChat}
            title="대화 초기화"
            style={{ fontSize: 'var(--text-sm)' }}
          >
            🗑️
          </button>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
      </div>

      <div className="ai-chat-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`ai-message ${msg.role}`}>
            {msg.content.split('\n').map((line, i) => (
              <span key={i}>
                {line}
                {i < msg.content.split('\n').length - 1 && <br />}
              </span>
            ))}
          </div>
        ))}
        {isLoading && (
          <div className="ai-message assistant">
            <div className="loading-spinner" style={{ width: 20, height: 20 }}></div>
          </div>
        )}
      </div>

      <div className="ai-chat-input-area">
        <input
          type="text"
          className="form-input"
          placeholder="찾고 싶은 프로젝트를 설명해주세요..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button className="btn btn-primary" onClick={handleSend} disabled={isLoading}>
          전송
        </button>
      </div>
    </div>
  );
}

// Main App
function App() {
  const [user, setUser] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 초기 세션 확인
    getSession().then(({ session }) => {
      setUser(session?.user || null);
      setIsLoading(false);
    });

    // 인증 상태 변화 리스너
    const { data: { subscription } } = onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async () => {
    if (isDemo) {
      // 데모 모드에서는 가짜 로그인
      const { user } = await signInWithGoogle();
      setUser(user);
      return;
    }

    await signInWithGoogle();
  };

  const handleLogout = async () => {
    await signOut();
    setUser(null);
  };

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'var(--color-bg-primary)'
      }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Header user={user} onLogin={handleLogin} onLogout={handleLogout} />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/project/:id" element={<ProjectPage user={user} />} />
          <Route path="/submit" element={<SubmitPage user={user} />} />
        </Routes>
      </main>

      <AIChatFAB onClick={() => setIsChatOpen(!isChatOpen)} />
      <AIChatPanel isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

      <footer style={{
        textAlign: 'center',
        padding: 'var(--spacing-xl)',
        color: 'var(--color-text-muted)',
        borderTop: '1px solid var(--border-color)'
      }}>
        <p>© 2026 Vibe Coding Gallery. 선생님들의 바이브코딩 결과물을 공유하는 공간</p>
      </footer>
    </BrowserRouter>
  );
}

export default App;
