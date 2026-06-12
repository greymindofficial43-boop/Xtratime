import { AdSlot } from '@/components/AdSlot';
import { VideosGrid } from '@/components/VideosGrid';
import { fetchYouTubeVideos } from '@/lib/youtube-feed';

export const revalidate = 3600;

export const metadata = {
  title: 'ভিডিও | XtraTime Bangla',
  description: 'XtraTime Bangla এবং XtraTime চ্যানেলের সর্বশেষ ভিডিও।',
};

export default async function VideosPage() {
  const videos = await fetchYouTubeVideos().catch(() => []);

  return (
    <div className="mx-auto max-w-[1200px] px-3 sm:px-5 py-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-600">
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white ml-0.5">
            <polygon points="5,3 19,12 5,21" />
          </svg>
        </div>
        <h1 className="text-2xl font-extrabold">ভিডিও</h1>
      </div>

      <AdSlot zone="article-top" className="mb-6" />

      <VideosGrid videos={videos} />

      <div className="mt-8">
        <AdSlot zone="home-bottom" />
      </div>
    </div>
  );
}
