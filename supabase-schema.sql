-- ================================================
-- Vibe Gallery - Supabase 데이터베이스 스키마
-- Supabase SQL Editor에서 실행하세요
-- ================================================

-- 1. 사용자 프로필 테이블
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 카테고리 테이블
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT DEFAULT '📁',
  display_order INT DEFAULT 99,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 기본 카테고리 데이터
INSERT INTO categories (name, icon, display_order) VALUES
  ('AI수업자료', '🤖', 1),
  ('알고리즘수업자료', '📊', 2),
  ('데이터수업자료', '📈', 3),
  ('업무자동화', '⚙️', 4),
  ('기타', '📁', 99)
ON CONFLICT DO NOTHING;

-- 3. 행사/연수 테이블
CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 기본 행사 데이터
INSERT INTO events (name, description, is_active) VALUES
  ('2026년 3월 바이브코딩 연수', '선생님들을 위한 바이브코딩 입문 연수', TRUE),
  ('2026년 정보교사 커뮤니티 해커톤', '정보교사 커뮤니티 해커톤 이벤트', TRUE)
ON CONFLICT DO NOTHING;

-- 4. 라이센스 테이블
CREATE TABLE IF NOT EXISTS licenses (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  description TEXT,
  url TEXT,
  allow_commercial BOOLEAN DEFAULT TRUE,
  require_attribution BOOLEAN DEFAULT TRUE,
  allow_modification BOOLEAN DEFAULT TRUE
);

-- 기본 라이센스 데이터
INSERT INTO licenses (name, short_name, description, url, allow_commercial, require_attribution, allow_modification) VALUES
  ('MIT License', 'MIT', '가장 자유로운 오픈소스 라이센스. 상업적 사용, 수정, 배포 모두 가능.', 'https://opensource.org/licenses/MIT', TRUE, TRUE, TRUE),
  ('Apache License 2.0', 'Apache-2.0', 'MIT와 유사하지만 특허권 보호가 추가됨.', 'https://opensource.org/licenses/Apache-2.0', TRUE, TRUE, TRUE),
  ('GPL v3', 'GPL-3.0', '파생 작업도 반드시 GPL로 공개해야 합니다.', 'https://www.gnu.org/licenses/gpl-3.0.html', TRUE, TRUE, TRUE),
  ('CC BY 4.0', 'CC-BY', '크리에이티브 커먼즈. 출처 표시만 하면 자유롭게 사용 가능.', 'https://creativecommons.org/licenses/by/4.0/', TRUE, TRUE, TRUE),
  ('CC BY-NC 4.0', 'CC-BY-NC', '비상업적 용도로만 사용 가능. 교육 자료에 적합.', 'https://creativecommons.org/licenses/by-nc/4.0/', FALSE, TRUE, TRUE),
  ('CC BY-NC-SA 4.0', 'CC-BY-NC-SA', '비상업적 + 동일조건변경허락. 교육 커뮤니티에서 인기.', 'https://creativecommons.org/licenses/by-nc-sa/4.0/', FALSE, TRUE, TRUE)
ON CONFLICT DO NOTHING;

-- 5. 프로젝트 테이블
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  deploy_url TEXT,
  github_url TEXT,
  thumbnail_url TEXT,
  category_id INT REFERENCES categories(id),
  event_id INT REFERENCES events(id),
  license_id INT REFERENCES licenses(id),
  view_count INT DEFAULT 0,
  like_count INT DEFAULT 0,
  comment_count INT DEFAULT 0,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. 좋아요 테이블
CREATE TABLE IF NOT EXISTS likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, project_id)
);

-- 7. 댓글 테이블
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- RLS (Row Level Security) 정책
-- ================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Profiles: 누구나 읽기 가능, 본인만 수정
CREATE POLICY "Profiles viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Projects: 누구나 읽기, 본인만 작성/수정
CREATE POLICY "Projects viewable by everyone" ON projects FOR SELECT USING (is_published = true);
CREATE POLICY "Users can create projects" ON projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own projects" ON projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own projects" ON projects FOR DELETE USING (auth.uid() = user_id);

-- Likes: 누구나 읽기, 로그인 사용자만 작성/삭제
CREATE POLICY "Likes viewable by everyone" ON likes FOR SELECT USING (true);
CREATE POLICY "Users can like" ON likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike" ON likes FOR DELETE USING (auth.uid() = user_id);

-- Comments: 누구나 읽기, 로그인 사용자만 작성, 본인만 수정/삭제
CREATE POLICY "Comments viewable by everyone" ON comments FOR SELECT USING (true);
CREATE POLICY "Users can comment" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own comments" ON comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON comments FOR DELETE USING (auth.uid() = user_id);

-- ================================================
-- 트리거: 좋아요/댓글 카운트 자동 업데이트
-- ================================================

-- 좋아요 추가 시 카운트 증가
CREATE OR REPLACE FUNCTION increment_like_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE projects SET like_count = like_count + 1 WHERE id = NEW.project_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_like_added
  AFTER INSERT ON likes
  FOR EACH ROW EXECUTE FUNCTION increment_like_count();

-- 좋아요 삭제 시 카운트 감소
CREATE OR REPLACE FUNCTION decrement_like_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE projects SET like_count = like_count - 1 WHERE id = OLD.project_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_like_removed
  AFTER DELETE ON likes
  FOR EACH ROW EXECUTE FUNCTION decrement_like_count();

-- 댓글 추가 시 카운트 증가
CREATE OR REPLACE FUNCTION increment_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE projects SET comment_count = comment_count + 1 WHERE id = NEW.project_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_comment_added
  AFTER INSERT ON comments
  FOR EACH ROW EXECUTE FUNCTION increment_comment_count();

-- 댓글 삭제 시 카운트 감소
CREATE OR REPLACE FUNCTION decrement_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE projects SET comment_count = comment_count - 1 WHERE id = OLD.project_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_comment_removed
  AFTER DELETE ON comments
  FOR EACH ROW EXECUTE FUNCTION decrement_comment_count();

-- ================================================
-- 새 사용자 가입 시 자동으로 프로필 생성
-- ================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'preferred_username',
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ================================================
-- 완료! 🎉
-- ================================================
