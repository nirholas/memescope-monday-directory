import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCoinBySlug, getApprovedCoins } from '@/lib/data';
import { fetchTokenByAddress } from '@/lib/dexscreener';
import { calculateSafetyScore, calculateSocialBuzz } from '@/lib/scoring';
import { ChainBadge } from '@/components/ChainBadge';
import { UpvoteButton } from '@/components/UpvoteButton';
import { ChartEmbed } from '@/components/ChartEmbed';
import { LaunchCountdown } from '@/components/LaunchCountdown';
import { CoinChat } from '@/components/CoinChat';
import { PaidFeatures } from '@/components/PaidFeatures';
import { NewsFeed } from '@/components/NewsFeed';
import { SafetyScoreCard } from '@/components/SafetyScore';
import { SocialBuzzCard } from '@/components/SocialBuzz';
import { MarketDataCard } from '@/components/MarketData';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function CoinDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const coin = await getCoinBySlug(slug);

  if (!coin) {
    notFound();
  }

  // Fetch live market data from DexScreener
  const dexData = coin.contractAddress !== 'TBA'
    ? await fetchTokenByAddress(coin.contractAddress)
    : null;

  // Calculate scores
  const safetyScore = calculateSafetyScore(coin, dexData);
  const socialBuzz = calculateSocialBuzz(coin, dexData);

  const allCoins = await getApprovedCoins();
  const related = allCoins
    .filter((c) => c.id !== coin.id && (c.chain === coin.chain || c.category === coin.category))
    .slice(0, 3);

  const links = [
    { label: 'Website', url: coin.websiteUrl, icon: '🌐' },
    { label: 'Twitter / X', url: coin.twitterUrl, icon: '𝕏' },
    { label: 'Telegram', url: coin.telegramUrl, icon: '✈️' },
    { label: 'PumpFun', url: coin.pumpFunUrl, icon: '🚀' },
    { label: 'DexScreener', url: coin.dexScreenerUrl ?? dexData?.url, icon: '📊' },
  ].filter((l) => l.url);

  return (
    <div>
      {/* Breadcrumbs */}
      <div className="bg-navy-50 border-b border-navy-100">
        <div className="container-main py-3">
          <nav className="flex items-center gap-2 text-sm text-navy-500">
            <Link href="/" className="hover:text-navy-700 transition-colors">Home</Link>
            <span>&rsaquo;</span>
            <Link href="/coins" className="hover:text-navy-700 transition-colors">Coins</Link>
            <span>&rsaquo;</span>
            <span className="text-navy-700 font-medium">{coin.name}</span>
          </nav>
        </div>
      </div>

      <div className="container-main py-10">
        <div className="grid lg:grid-cols-3 gap-10">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div className="flex items-start gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-navy-100 to-navy-200 flex items-center justify-center text-2xl font-black text-navy-600 flex-shrink-0">
                {coin.ticker.replace('$', '').slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-3xl font-black text-navy-900">{coin.name}</h1>
                  <ChainBadge chain={coin.chain} size="md" />
                  {coin.coinType === 'upcoming' && (
                    <span className="text-sm font-semibold text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                      Upcoming Launch
                    </span>
                  )}
                  {coin.featured && (
                    <span className="text-sm font-semibold text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                      Featured
                    </span>
                  )}
                  {(coin.trending || coin.paidTrending) && (
                    <span className="text-sm font-semibold text-brand-600 bg-brand-50 px-3 py-1 rounded-full">
                      Trending
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 mt-2 flex-wrap">
                  <p className="text-navy-500 text-lg">{coin.ticker}</p>
                  <UpvoteButton slug={coin.slug} initialVotes={coin.votes ?? 0} />
                  <SafetyScoreCard score={safetyScore} compact />
                  <SocialBuzzCard buzz={socialBuzz} compact />
                </div>
              </div>
            </div>

            {/* Live Market Data (if available) */}
            {dexData && <MarketDataCard data={dexData} />}

            {/* Launch Countdown for upcoming */}
            {coin.coinType === 'upcoming' && coin.launchDate && (
              <LaunchCountdown launchDate={coin.launchDate} />
            )}

            {/* Contract Address */}
            <div className="card p-5">
              <p className="text-xs text-navy-400 uppercase font-semibold mb-2">Contract Address</p>
              <code className="text-sm text-navy-700 font-mono bg-navy-50 px-3 py-2 rounded-lg block overflow-x-auto">
                {coin.contractAddress === 'TBA' ? 'TBA — To be announced at launch' : coin.contractAddress}
              </code>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-lg font-bold text-navy-900 mb-3">About</h2>
              <p className="text-navy-600 leading-relaxed">{coin.description}</p>
            </div>

            {/* Chart Embed for existing coins */}
            {coin.coinType !== 'upcoming' && (
              <ChartEmbed chain={coin.chain} contractAddress={coin.contractAddress} />
            )}

            {/* News Feed */}
            <NewsFeed query={`${coin.name} ${coin.ticker.replace('$', '')}`} />

            {/* Week Label */}
            <div className="card p-5 bg-brand-50 border-brand-200">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📅</span>
                <div>
                  <p className="text-sm font-bold text-brand-800">Memescope Monday</p>
                  <p className="text-sm text-brand-600">{coin.weekLabel}</p>
                </div>
              </div>
            </div>

            {/* Chat / Trollbox */}
            <CoinChat coinSlug={coin.slug} />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Safety Score (full) */}
            <SafetyScoreCard score={safetyScore} />

            {/* Social Buzz (full) */}
            <SocialBuzzCard buzz={socialBuzz} />

            {/* Links */}
            {links.length > 0 && (
              <div className="card p-5">
                <h3 className="font-bold text-navy-900 text-sm mb-4">Links</h3>
                <div className="space-y-2">
                  {links.map((link) => (
                    <a
                      key={link.label}
                      href={link.url!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-4 py-3 rounded-lg border border-navy-200 hover:border-navy-300 hover:bg-navy-50 transition-all text-sm font-medium text-navy-700"
                    >
                      <span>{link.icon}</span>
                      <span>{link.label}</span>
                      <svg className="w-4 h-4 ml-auto text-navy-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Boost listing */}
            <PaidFeatures coinSlug={coin.slug} mode="standalone" />

            {/* Disclaimer */}
            <div className="card p-5 bg-amber-50 border-amber-200">
              <p className="text-xs text-amber-800 leading-relaxed">
                <strong>Disclaimer:</strong> This listing is community-submitted and not an endorsement.
                Safety scores are algorithmic estimates. Memecoins are extremely volatile. Always DYOR.
              </p>
            </div>

            {/* Related */}
            {related.length > 0 && (
              <div>
                <h3 className="font-bold text-navy-900 text-sm mb-4">Related Coins</h3>
                <div className="space-y-3">
                  {related.map((c) => (
                    <Link key={c.id} href={`/coins/${c.slug}`} className="card p-4 flex items-center gap-3 group">
                      <div className="w-9 h-9 rounded-lg bg-navy-100 flex items-center justify-center text-sm font-bold text-navy-600 flex-shrink-0">
                        {c.ticker.replace('$', '').slice(0, 2)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-navy-900 truncate group-hover:text-brand-600 transition-colors">
                          {c.name}
                        </p>
                        <p className="text-xs text-navy-500">{c.ticker} &middot; {c.votes ?? 0} votes</p>
                      </div>
                      <ChainBadge chain={c.chain} />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
