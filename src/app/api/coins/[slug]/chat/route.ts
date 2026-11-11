import { NextResponse } from 'next/server';
import { getChatMessages, addChatMessage, getCoinBySlug } from '@/lib/data';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { searchParams } = new URL(request.url);
  const after = searchParams.get('after') ?? undefined;

  const messages = await getChatMessages(slug, after);
  return NextResponse.json({ messages });
}

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const coin = await getCoinBySlug(slug);
    if (!coin) {
      return NextResponse.json({ error: 'Coin not found' }, { status: 404 });
    }

    const user = await getCurrentUser();
    const body = await request.json();
    const { text } = body;
    // Use username if logged in, otherwise use provided author
    const author = user ? user.username : (body.author || 'Anon');

    if (!text || typeof text !== 'string' || !text.trim()) {
      return NextResponse.json({ error: 'text is required' }, { status: 400 });
    }

    if (text.length > 280) {
      return NextResponse.json({ error: 'Message too long (max 280 chars)' }, { status: 400 });
    }

    const message = await addChatMessage(slug, author, text.trim(), user?.id);
    return NextResponse.json({ message }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
