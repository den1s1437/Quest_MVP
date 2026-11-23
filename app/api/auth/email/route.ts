// POST /api/auth/email — вход по одной почте, без письма и кода (решение Дениса 23.11.2026).
// Если введённая почта совпадает с ALLOWED_EMAIL, сервер сам входит в аккаунт внутренним паролем
// LOGIN_SECRET (он есть только в переменных Vercel и в базе, наружу не уходит) и ставит cookies сессии.
// Риск принят осознанно: войти может любой, кто знает почту.
import { createClient } from '@/lib/supabase/server';
import { ALLOWED_EMAIL, CONFIGURED } from '@/lib/supabase/env';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const secret = process.env.LOGIN_SECRET ?? '';
  if (!CONFIGURED || !ALLOWED_EMAIL || !secret) return Response.json({ error: 'Вход по почте не настроен' }, { status: 503 });
  const body = await req.json().catch(() => null) as { email?: unknown } | null;
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (email !== ALLOWED_EMAIL) return Response.json({ error: 'Эта почта не пускается в гильдию' }, { status: 403 });
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password: secret });
  if (error) return Response.json({ error: 'Не получилось войти: ' + error.message }, { status: 502 });
  return Response.json({ ok: true });
}
