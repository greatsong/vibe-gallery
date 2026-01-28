import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 개발 모드에서 Supabase 미설정 시 더미 클라이언트 제공
const isDemoMode = !supabaseUrl || supabaseUrl === 'your_supabase_project_url';

export const supabase = isDemoMode
  ? null
  : createClient(supabaseUrl, supabaseAnonKey);

export const isDemo = isDemoMode;

// ===== Google OAuth Functions =====

/**
 * Google 로그인 시작
 */
export async function signInWithGoogle() {
  if (isDemo) {
    // 데모 모드에서는 가짜 로그인
    return {
      user: {
        id: 'demo-user-1',
        email: 'demo@teacher.com',
        user_metadata: {
          full_name: '데모 선생님',
          avatar_url: null
        }
      },
      error: null
    };
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  return { data, error };
}

/**
 * 로그아웃
 */
export async function signOut() {
  if (isDemo) {
    return { error: null };
  }

  const { error } = await supabase.auth.signOut();
  return { error };
}

/**
 * 현재 사용자 세션 가져오기
 */
export async function getSession() {
  if (isDemo) {
    return { session: null };
  }

  const { data: { session } } = await supabase.auth.getSession();
  return { session };
}

/**
 * 인증 상태 변화 리스너
 */
export function onAuthStateChange(callback) {
  if (isDemo) {
    return { data: { subscription: { unsubscribe: () => { } } } };
  }

  return supabase.auth.onAuthStateChange(callback);
}

// ===== Demo Data =====
export const demoData = {
  categories: [
    { id: 1, name: 'AI수업자료', icon: '🤖', display_order: 1 },
    { id: 2, name: '알고리즘수업자료', icon: '📊', display_order: 2 },
    { id: 3, name: '데이터수업자료', icon: '📈', display_order: 3 },
    { id: 4, name: '업무자동화', icon: '⚙️', display_order: 4 },
    { id: 5, name: '기타', icon: '📁', display_order: 99 },
  ],
  events: [
    { id: 1, name: '2026년 3월 바이브코딩 연수', is_active: true },
    { id: 2, name: '2026년 정보교사 커뮤니티 해커톤', is_active: true },
  ],
  licenses: [
    { id: 1, name: 'MIT License', short_name: 'MIT', description: '가장 자유로운 오픈소스 라이센스. 상업적 사용, 수정, 배포 모두 가능.', url: 'https://opensource.org/licenses/MIT', allow_commercial: true, require_attribution: true, allow_modification: true },
    { id: 2, name: 'Apache License 2.0', short_name: 'Apache-2.0', description: 'MIT와 유사하지만 특허권 보호가 추가됨.', url: 'https://opensource.org/licenses/Apache-2.0', allow_commercial: true, require_attribution: true, allow_modification: true },
    { id: 3, name: 'GPL v3', short_name: 'GPL-3.0', description: '파생 작업도 반드시 GPL로 공개해야 합니다.', url: 'https://www.gnu.org/licenses/gpl-3.0.html', allow_commercial: true, require_attribution: true, allow_modification: true },
    { id: 4, name: 'CC BY 4.0', short_name: 'CC-BY', description: '크리에이티브 커먼즈. 출처 표시만 하면 자유롭게 사용 가능.', url: 'https://creativecommons.org/licenses/by/4.0/', allow_commercial: true, require_attribution: true, allow_modification: true },
    { id: 5, name: 'CC BY-NC 4.0', short_name: 'CC-BY-NC', description: '비상업적 용도로만 사용 가능. 교육 자료에 적합.', url: 'https://creativecommons.org/licenses/by-nc/4.0/', allow_commercial: false, require_attribution: true, allow_modification: true },
    { id: 6, name: 'CC BY-NC-SA 4.0', short_name: 'CC-BY-NC-SA', description: '비상업적 + 동일조건변경허락. 교육 커뮤니티에서 인기.', url: 'https://creativecommons.org/licenses/by-nc-sa/4.0/', allow_commercial: false, require_attribution: true, allow_modification: true },
  ],
  projects: [
    {
      id: '1',
      title: 'AI 챗봇 수업 도우미',
      description: 'Google Gemini API를 활용한 수업 질문 답변 챗봇입니다. 학생들이 수업 중 궁금한 점을 바로 질문하고 답변받을 수 있습니다.',
      deploy_url: 'https://ai-classroom-helper.vercel.app',
      github_url: 'https://github.com/teacher/ai-helper',
      thumbnail_url: 'https://picsum.photos/seed/ai-helper/400/300',
      category: { id: 1, name: 'AI수업자료', icon: '🤖' },
      event: { id: 1, name: '2026년 3월 바이브코딩 연수' },
      license: { id: 1, short_name: 'MIT' },
      user: { username: 'kimteacher', display_name: '김선생' },
      view_count: 150,
      like_count: 42,
      comment_count: 8,
      created_at: '2026-01-25T10:00:00Z',
    },
    {
      id: '2',
      title: '정렬 알고리즘 시각화',
      description: '버블정렬, 퀵정렬, 병합정렬 등 다양한 정렬 알고리즘을 시각적으로 비교할 수 있는 교육용 웹앱입니다.',
      deploy_url: 'https://sorting-visualizer-edu.vercel.app',
      github_url: 'https://github.com/teacher/sorting-viz',
      thumbnail_url: 'https://picsum.photos/seed/sorting/400/300',
      category: { id: 2, name: '알고리즘수업자료', icon: '📊' },
      event: { id: 1, name: '2026년 3월 바이브코딩 연수' },
      license: { id: 4, short_name: 'CC-BY' },
      user: { username: 'leeteacher', display_name: '이선생' },
      view_count: 230,
      like_count: 67,
      comment_count: 15,
      created_at: '2026-01-24T14:30:00Z',
    },
    {
      id: '3',
      title: '학급 출석부 자동화',
      description: 'Google Sheets와 연동하여 출석 관리를 자동화하는 웹앱입니다. QR코드 스캔으로 간편하게 출석 체크!',
      deploy_url: 'https://attendance-auto.vercel.app',
      github_url: null,
      thumbnail_url: 'https://picsum.photos/seed/attendance/400/300',
      category: { id: 4, name: '업무자동화', icon: '⚙️' },
      event: { id: 2, name: '2026년 정보교사 커뮤니티 해커톤' },
      license: { id: 5, short_name: 'CC-BY-NC' },
      user: { username: 'parkteacher', display_name: '박선생' },
      view_count: 89,
      like_count: 31,
      comment_count: 5,
      created_at: '2026-01-23T09:15:00Z',
    },
    {
      id: '4',
      title: '데이터 시각화 대시보드',
      description: '공공데이터 API를 활용한 인터랙티브 대시보드입니다. 학생들이 실제 데이터로 분석 실습을 할 수 있습니다.',
      deploy_url: 'https://data-dashboard-edu.vercel.app',
      github_url: 'https://github.com/teacher/data-dashboard',
      thumbnail_url: 'https://picsum.photos/seed/dashboard/400/300',
      category: { id: 3, name: '데이터수업자료', icon: '📈' },
      event: { id: 1, name: '2026년 3월 바이브코딩 연수' },
      license: { id: 1, short_name: 'MIT' },
      user: { username: 'choiteacher', display_name: '최선생' },
      view_count: 175,
      like_count: 58,
      comment_count: 12,
      created_at: '2026-01-22T16:45:00Z',
    },
  ],
  comments: {
    '1': [
      { id: 'c1', user: { display_name: '이선생' }, content: '정말 유용한 챗봇이네요! 수업에 바로 활용해봤습니다.', created_at: '2026-01-25T12:00:00Z' },
      { id: 'c2', user: { display_name: '박선생' }, content: 'API 키 발급 과정도 설명해주시면 좋겠어요~', created_at: '2026-01-25T14:30:00Z' },
    ],
    '2': [
      { id: 'c3', user: { display_name: '김선생' }, content: '시각화가 정말 깔끔하네요. 학생들이 좋아할 것 같아요!', created_at: '2026-01-24T16:00:00Z' },
    ],
  },
};
