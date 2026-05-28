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
        const data = await api.getAds(); // Fetch all ads regardless of zone
        setAds(data);
      } catch {
        // ignore
      }
    }
    loadAds();
  }, []);

  useEffect(() => {
    if (ads.length === 0) return;

    // Wait a bit to ensure the DOM is fully rendered
    const timeoutId = setTimeout(() => {
      // Find candidate elements to inject ads after
      const candidates = Array.from(document.querySelectorAll('p, section, article > div, .sk-section-heading'));
      
      // Filter candidates to ensure they are visible and have some content
      const validCandidates = candidates.filter((el) => {
        const text = el.textContent?.trim() || '';
        return text.length > 20 && !el.closest('.sk-random-ad') && !el.closest('aside') && !el.closest('header') && !el.closest('footer') && !el.closest('.grid') && !el.closest('.flex');
      });

      // Pick up to 10 random valid candidates
      const numAds = Math.min(10, ads.length);
      const shuffled = validCandidates.sort(() => 0.5 - Math.random()).slice(0, numAds);

      const points = shuffled.map((node, i) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'my-6 sk-random-ad';
        node.parentNode?.insertBefore(wrapper, node.nextSibling);
        return { id: `ad-point-${i}`, node: wrapper };
      });

      setInjectionPoints(points);
    }, 500);

    return () => {
      clearTimeout(timeoutId);
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
        const ad = ads[i % ads.length];
        return createPortal(<AdSlot adOverride={ad} />, point.node);
      })}
    </>
  );
}
