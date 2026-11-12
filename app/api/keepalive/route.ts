// GET /api/keepalive — раз в сутки его вызывает расписание Vercel (vercel.json → crons).
// Бесплатный проект Supabase встаёт на паузу после 7 дней без запросов, и тогда сайт не пускает
// и не показывает прогресс (так было 12.11.2026). Один запрос к events публичным ключом держит базу живой:
// без входа RLS вернёт пустой список, но запрос дойдёт до Postgres. Данных наружу не отдаёт.
import { createClient } from '@supabase/supabase-js';
import { CONFIGURED, SUPABASE_KEY, SUPABASE_URL } from '@/lib/supabase/env';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!CONFIGURED) return Response.json({ ok: false, reason: 'Supabase не настроен' }, { status: 503 });
  const db = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });
  const { error } = await db.from('events').select('id', { head: true, count: 'exact' }).limit(1);
  if (error) return Response.json({ ok: false, reason: error.message }, { status: 502 });
  return Response.json({ ok: true, at: new Date().toISOString() });
}
