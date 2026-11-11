import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { upvoteCoin } from '@/lib/data';

export async function POST(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Sign in to vote' }, { status: 401 });
  }

  try {
    const result = await upvoteCoin(slug, user.id);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Coin not found' }, { status: 404 });
  }
}
