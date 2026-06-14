import { ArticleForm } from '@/components/ArticleForm';

type Props = { searchParams: Promise<{ type?: string }> };

export default async function NewArticlePage({ searchParams }: Props) {
  const { type } = await searchParams;
  const defaultType = type === 'GALLERY' ? 'GALLERY' : 'ARTICLE';

  return (
    <div>
      <h1 className="text-2xl font-bold">{defaultType === 'GALLERY' ? 'New Gallery' : 'New Article'}</h1>
      <p className="mt-1 text-slate-500">
        {defaultType === 'GALLERY' ? 'Create a photo gallery' : 'Publish sports news to the public site'}
      </p>
      <div className="mt-6">
        <ArticleForm defaultType={defaultType} />
      </div>
    </div>
  );
}
