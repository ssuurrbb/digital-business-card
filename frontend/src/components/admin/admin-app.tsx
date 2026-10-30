'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import {
  AdminAuthError,
  checkSession,
  loadAdmin,
  login,
  TOKEN_KEY,
  type AdminBundle,
} from '@/lib/admin-api';
import { ExperienceSection } from './experience-section';
import { LinksSection } from './links-section';
import { ProfileSection } from './profile-section';
import { ProjectsSection } from './projects-section';
import { SkillsSection } from './skills-section';

type AdminAppProps = {
  graphqlUrl: string;
};

type TabId = 'profile' | 'links' | 'skills' | 'experience' | 'projects';

const TABS: { id: TabId; label: string }[] = [
  { id: 'profile', label: 'Профиль' },
  { id: 'links', label: 'Ссылки' },
  { id: 'skills', label: 'Навыки' },
  { id: 'experience', label: 'Опыт' },
  { id: 'projects', label: 'Проекты' },
];

export function AdminApp({ graphqlUrl }: AdminAppProps) {
  const [ready, setReady] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [loginValue, setLoginValue] = useState('');
  const [password, setPassword] = useState('');
  const [authPending, setAuthPending] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [bundle, setBundle] = useState<AdminBundle | null>(null);
  const [tab, setTab] = useState<TabId>('profile');
  const [flash, setFlash] = useState<{ kind: 'ok' | 'err'; text: string } | null>(
    null,
  );
  const [loading, setLoading] = useState(false);

  const showError = useCallback((text: string) => {
    setFlash({ kind: 'err', text });
  }, []);

  const showSaved = useCallback((text: string) => {
    setFlash({ kind: 'ok', text });
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setBundle(null);
    setPassword('');
  }, []);

  const refresh = useCallback(
    async (session = token) => {
      if (!session) {
        return;
      }
      setLoading(true);
      try {
        const next = await loadAdmin(graphqlUrl, session);
        setBundle(next);
      } catch (error) {
        if (error instanceof AdminAuthError) {
          logout();
          setAuthError(error.message);
          return;
        }
        showError(
          error instanceof Error ? error.message : 'Не удалось загрузить данные',
        );
      } finally {
        setLoading(false);
      }
    },
    [graphqlUrl, logout, showError, token],
  );

  useEffect(() => {
    const stored = sessionStorage.getItem(TOKEN_KEY);
    if (!stored) {
      setReady(true);
      return;
    }
    void (async () => {
      try {
        await checkSession(graphqlUrl, stored);
        setToken(stored);
      } catch {
        sessionStorage.removeItem(TOKEN_KEY);
      } finally {
        setReady(true);
      }
    })();
  }, [graphqlUrl]);

  useEffect(() => {
    if (!token) {
      return;
    }
    void refresh(token);
  }, [refresh, token]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthPending(true);
    setAuthError(null);
    try {
      const nextToken = await login(graphqlUrl, loginValue.trim(), password);
      sessionStorage.setItem(TOKEN_KEY, nextToken);
      setToken(nextToken);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Не удалось войти';
      setAuthError(
        message === 'Invalid credentials' ? 'Неверный логин или пароль' : message,
      );
    } finally {
      setAuthPending(false);
    }
  }

  if (!ready) {
    return (
      <main className="admin-boot">
        <p className="kicker">Админка</p>
        <p>Проверяю сессию…</p>
      </main>
    );
  }

  if (!token) {
    return (
      <main className="admin-login">
        <form className="admin-login-card" onSubmit={handleLogin}>
          <p className="kicker">Админка</p>
          <h1>Вход</h1>
          <p className="admin-login-lead">
            Только владелец визитки может менять данные.
          </p>
          <label className="admin-field">
            <span>Логин</span>
            <input
              autoComplete="username"
              required
              value={loginValue}
              onChange={(event) => setLoginValue(event.target.value)}
            />
          </label>
          <label className="admin-field">
            <span>Пароль</span>
            <input
              autoComplete="current-password"
              required
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          {authError ? <p className="admin-flash err">{authError}</p> : null}
          <button className="btn" disabled={authPending} type="submit">
            {authPending ? 'Вхожу…' : 'Войти'}
          </button>
        </form>
      </main>
    );
  }

  const sectionProps = {
    graphqlUrl,
    token,
    onSaved: showSaved,
    onError: (message: string) => {
      if (message === 'Сессия истекла, войдите снова') {
        logout();
        setAuthError(message);
        return;
      }
      showError(message);
    },
    onChanged: () => refresh(),
  };

  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <div className="mark" aria-hidden="true">
          AD
        </div>
        <strong>Админка</strong>
        <nav>
          <a href="/">Визитка</a>
        </nav>
        <button className="btn ghost" type="button" onClick={logout}>
          Выйти
        </button>
      </header>

      <div className="admin-wrap">
        <nav className="admin-tabs" aria-label="Разделы">
          {TABS.map((item) => (
            <button
              key={item.id}
              className={item.id === tab ? 'is-active' : undefined}
              type="button"
              onClick={() => setTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {flash ? (
          <p className={`admin-flash ${flash.kind}`}>{flash.text}</p>
        ) : null}
        {loading && !bundle ? <p className="admin-empty">Загружаю данные…</p> : null}

        {bundle ? (
          <>
            {tab === 'profile' ? (
              <ProfileSection profile={bundle.profile} {...sectionProps} />
            ) : null}
            {tab === 'links' ? (
              <LinksSection profile={bundle.profile} {...sectionProps} />
            ) : null}
            {tab === 'skills' ? (
              <SkillsSection
                profile={bundle.profile}
                skills={bundle.skills}
                {...sectionProps}
              />
            ) : null}
            {tab === 'experience' ? (
              <ExperienceSection profile={bundle.profile} {...sectionProps} />
            ) : null}
            {tab === 'projects' ? (
              <ProjectsSection
                profile={bundle.profile}
                skills={bundle.skills}
                {...sectionProps}
              />
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
}
