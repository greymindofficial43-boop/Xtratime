import { ArticleForm } from '@/components/ArticleForm';

export default function NewArticlePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">New Article</h1>
      <p className="mt-1 text-slate-500">Publish sports news to the public site</p>
      <div className="mt-6">
        <ArticleForm />
      </div>
    </div>
  );
}
