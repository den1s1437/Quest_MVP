'use client';
// Вход по одной почте: вводишь свою почту — сразу внутри, без письма и кода (решение Дениса 23.11.2026).
// Проверку почты и вход делает сервер: /api/auth/email.
import { useEffect, useState } from 'react';
import { CONFIGURED } from '@/lib/supabase/env';

export default function Login() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'error'>('idle');
  const [msg, setMsg] = useState('');
  useEffect(() => { if (new URLSearchParams(location.search).has('error')) setState('error'); }, []);
  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    setState('sending');
    const res = await fetch('/api/auth/email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: email.trim() }) });
    if (res.ok) { location.href = '/'; return; }
    const data = await res.json().catch(() => ({}));
    setState('error'); setMsg(data.error || 'Не получилось войти. Попробуй ещё раз.');
  };
  return (
    <main className="gutter" style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
      <form className="sheet" onSubmit={send}>
        <span className="pin" aria-hidden="true" />
        <span className="kicker">Путь проводника</span>
        <h2>Вход в гильдию</h2>
        {!CONFIGURED ? <p className="brief">Сайт не подключён к базе: задай NEXT_PUBLIC_SUPABASE_URL и NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (см. .env.example) и пересобери.</p>
          : <>
            <p className="brief">Введи свою почту — и ты внутри.</p>
            <label className="f" htmlFor="email">Почта</label>
            <input type="text" inputMode="email" autoComplete="email" id="email" required value={email} onChange={e => setEmail(e.target.value)}
              style={{ width: '100%', borderRadius: 6, padding: '10px 12px', fontSize: 14.5, background: '#FBF4E4', border: '1px solid #C2A877', color: 'var(--pink)' }} />
            {state === 'error' && <p className="story">{msg || 'Не получилось войти. Попробуй ещё раз.'}</p>}
            <div className="acts"><button className="btn rust" type="submit" disabled={state === 'sending'}>{state === 'sending' ? 'Вхожу…' : 'Войти'}</button></div>
          </>}
      </form>
    </main>
  );
}
