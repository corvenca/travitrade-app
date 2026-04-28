import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  (await cookies()).delete('travitrade_session');
  return NextResponse.json({ success: true });
}

export async function GET(req: Request) {
  (await cookies()).delete('travitrade_session');
  return NextResponse.redirect(new URL('/login', req.url));
}
