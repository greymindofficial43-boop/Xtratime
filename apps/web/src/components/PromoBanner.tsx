import Image from 'next/image';
import { api } from '@/lib/api';

const GRADIENTS = [
  'from-blue-950 to-indigo-900',
  'from-orange-950 to-red-900',
  'from-emerald-950 to-teal-900',
  'from-fuchsia-950 to-purple-900',
];

export async function PromoBanner() {
  const promos = await api.getPromos().catch(() => []);
  const active = promos.filter((p) => p.enabled).sort((a, b) => a.sortOrder - b.sortOrder);

  if (active.length === 0) return null;

  return (
    <div className="mt-10 grid gap-4 sm:grid-cols-2">
      {active.map((promo, i) => (
        <a
          key={promo.id}
          href={promo.href}
          target={promo.openInNewTab ? '_blank' : undefined}
          rel={promo.openInNewTab ? 'noopener noreferrer' : undefined}
          className={`group relative flex min-h-[130px] items-end overflow-hidden rounded-xl bg-gradient-to-r ${GRADIENTS[i % GRADIENTS.length]} p-5 transition`}
        >
          {promo.imageUrl && (
            <Image
              src={promo.imageUrl}
              alt={promo.title}
              fill
              className="object-cover opacity-30 transition duration-500 group-hover:opacity-40 group-hover:scale-105"
            />
          )}
          <div className="relative z-10 pr-12">
            {promo.label && (
              <span className="text-[10px] font-black uppercase tracking-widest text-white/60">
                {promo.label}
              </span>
            )}
            <p className="mt-1 text-base font-bold leading-snug text-white group-hover:text-[var(--sk-accent)] md:text-lg">
              {promo.title}
            </p>
          </div>
          {promo.emoji && (
            <span className="absolute right-5 top-4 text-3xl opacity-80">{promo.emoji}</span>
          )}
        </a>
      ))}
    </div>
  );
}
