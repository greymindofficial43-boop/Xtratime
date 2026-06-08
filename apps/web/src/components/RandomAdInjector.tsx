'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { api, type Advertisement } from '@/lib/api';
import { AdSlot } from './AdSlot';

export function RandomAdInjector() {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [injectionPoints, setInjectionPoints] = useState<{ id: string; node: HTMLElement }[]>([]);

  useEffect(() => {
    async function loadAds() {
      try {
        // Only the generic "inline" slot is scattered randomly; ads assigned to
        // a fixed slot (home-top, article-bottom, sidebar, ...) stay in that slot.
        const data = await api.getAds('inline');
        setAds(data);
      } catch {
        // ignore
      }
    }
    loadAds();
  }, []);

  useEffect(() => {
    if (ads.length === 0) return;

    // Function to scatter ads randomly
    const scatterAds = () => {
      setInjectionPoints((prev) => {
        // Clean up previous points
        prev.forEach((p) => p.node.remove());
        
      // Find safe candidates
        const candidates = Array.from(document.querySelectorAll('p, section, article, .sk-section-heading, h2, h3, .sk-scorecard, .sk-category-card'));
        const validCandidates = candidates.filter((el) => {
          const text = el.textContent?.trim() || '';
          return (text.length > 20 || el.classList.contains('sk-scorecard')) && 
                 !el.closest('.sk-random-ad') && 
                 !el.closest('aside') && 
                 !el.closest('header') && 
                 !el.closest('footer') &&
                 !el.closest('a') &&
                 !el.closest('button');
        });

        const numPoints = Math.min(8, ads.length);
        const shuffled = validCandidates.sort(() => 0.5 - Math.random()).slice(0, numPoints);

        const newPoints = shuffled.map((node, i) => {
          const wrapper = document.createElement('div');
          // Removed margin from wrapper so it takes 0 space if empty.
          wrapper.className = 'sk-random-ad w-full flex justify-center animate-in fade-in zoom-in duration-500';
          
          // Randomly insert before or after the node to mix it up
          if (Math.random() > 0.5 && node.nextSibling) {
            node.parentNode?.insertBefore(wrapper, node.nextSibling);
          } else {
            node.parentNode?.insertBefore(wrapper, node);
          }
          return { id: `ad-point-${Math.random()}`, node: wrapper };
        });

        return newPoints;
      });
    };

    // Initial scatter after a short delay to let DOM render
    const initialTimeout = setTimeout(scatterAds, 1000);

    // Re-shuffle ads completely every 20 seconds as requested
    const shuffleInterval = setInterval(scatterAds, 20000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(shuffleInterval);
      setInjectionPoints((prev) => {
        prev.forEach((p) => p.node.remove());
        return [];
      });
    };
  }, [ads]);

  if (injectionPoints.length === 0) return null;

  return (
    <>
      {injectionPoints.map((point, i) => {
        const ad = ads[i];
        if (!ad) return null;

        return createPortal(
          <div className="w-full max-w-4xl mx-auto my-6 px-4">
            <AdSlot adOverride={ad} />
          </div>,
          point.node
        );
      })}
    </>
  );
}
