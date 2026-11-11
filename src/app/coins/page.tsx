import { Suspense } from 'react';
import { getApprovedCoins } from '@/lib/data';
import { CoinCard } from '@/components/CoinCard';
import { SearchBar } from '@/components/SearchBar';
import { ChainFilter } from '@/components/ChainFilter';
import { SortSelect } from '@/components/SortSelect';
import type { Chain, CoinType } from '@/lib/types';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ q?: string; chain?: string; sort?: string; category?: string; type?: string }>;
}

export default async function CoinsPage({ searchParams: searchParamsPromise }: PageProps) {
  const searchParams = await searchParamsPromise;
  const allCoins = await getApprovedCoins();

  let coins = [...allCoins];

  // Filter by search query
  if (searchParams.q) {
    const q = searchParams.q.toLowerCase();
    coins = coins.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.ticker.toLowerCase().includes(q) ||
        c.contractAddress.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
    );
  }

  // Filter by chain
  if (searchParams.chain && searchParams.chain !== 'all') {
    coins = coins.filter((c) => c.chain === (searchParams.chain as Chain));
  }

  // Filter by coin type
  if (searchParams.type) {
    coins = coins.filter((c) => c.coinType === (searchParams.type as CoinType));
  }

  // Filter by category
  if (searchParams.category) {
    coins = coins.filter((c) => c.category.toLowerCase() === searchParams.category!.toLowerCase());
  }

  // Sort
  switch (searchParams.sort) {
    case 'newest':
      coins.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
      break;
    case 'oldest':
      coins.sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime());
      break;
    case 'votes':
      coins.sort((a, b) => (b.votes ?? 0) - (a.votes ?? 0));
      break;
    case 'trending':
      coins.sort((a, b) => {
        const aScore = (a.trending || a.paidTrending ? 1000 : 0) + (a.votes ?? 0);
        const bScore = (b.trending || b.paidTrending ? 1000 : 0) + (b.votes ?? 0);
        return bScore - aScore;
      });
      break;
    case 'name':
      coins.sort((a, b) => a.name.localeCompare(b.name));
      break;
    default:
      // Default: featured first, then by votes
      coins.sort((a, b) => {
        if (a.featured !== b.featured) return b.featured ? 1 : -1;
        return (b.votes ?? 0) - (a.votes ?? 0);
      });
  }

  return (
    <div>
      {/* Header */}
      <div className="bg-gradient-to-b from-navy-50 to-white border-b border-navy-100">
        <div className="container-main py-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-navy-100 text-navy-600 px-3 py-1.5 rounded-full text-sm font-medium mb-4">
              <span className="w-2 h-2 rounded-full bg-brand-500" />
              {allCoins.length} coins submitted
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-navy-900">
              Memescope Monday Directory
            </h1>
            <p className="text-navy-500 mt-2 max-w-lg mx-auto">
              Browse community-submitted memecoins. Upvote your favorites to help them trend.
            </p>
          </div>

          <Suspense fallback={<div className="h-12" />}>
            <SearchBar />
          </Suspense>
        </div>
      </div>

      <div className="container-main py-8">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <Suspense fallback={<div className="h-10" />}>
            <ChainFilter />
          </Suspense>

          <div className="flex items-center gap-3">
            {/* Type filter */}
            <Suspense fallback={<div className="h-10" />}>
              <TypeFilter currentType={searchParams.type} />
            </Suspense>
            <Suspense fallback={<div className="h-10" />}>
              <SortSelect />
            </Suspense>
          </div>
        </div>

        {/* Results */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-navy-500">
            Showing <span className="font-semibold text-navy-700">{coins.length}</span>{' '}
            {coins.length === 1 ? 'coin' : 'coins'}
            {searchParams.q && (
              <span>
                {' '}for &ldquo;<span className="font-medium text-navy-700">{searchParams.q}</span>&rdquo;
              </span>
            )}
          </p>
        </div>

        {coins.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {coins.map((coin) => (
              <CoinCard key={coin.id} coin={coin} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-navy-900 mb-2">No coins found</h3>
            <p className="text-navy-500 text-sm mb-6">
              Try adjusting your search or filters, or submit a new coin.
            </p>
            <a href="/submit" className="btn-primary">
              Submit a Coin
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

function TypeFilter({ currentType }: { currentType?: string }) {
  return (
    <div className="flex items-center gap-1 bg-navy-50 rounded-lg p-1">
      <a
        href="/coins"
        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
          !currentType ? 'bg-white shadow-sm text-navy-900' : 'text-navy-500 hover:text-navy-700'
        }`}
      >
        All
      </a>
      <a
        href="/coins?type=existing"
        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
          currentType === 'existing' ? 'bg-white shadow-sm text-navy-900' : 'text-navy-500 hover:text-navy-700'
        }`}
      >
        Live
      </a>
      <a
        href="/coins?type=upcoming"
        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
          currentType === 'upcoming' ? 'bg-white shadow-sm text-amber-700' : 'text-navy-500 hover:text-navy-700'
        }`}
      >
        Upcoming
      </a>
    </div>
  );
}
