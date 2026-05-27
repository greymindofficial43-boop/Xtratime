'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export type NavItem = {
  label: string;
  href: string;
  badge?: 'NEW';
  children?: NavItem[];
};

function NavDropdown({ item, active }: { item: NavItem; active: boolean }) {
  const [open, setOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setOpen(true);
  };

  const handleMouseLeave = () => {
    timerRef.current = setTimeout(() => {
      setOpen(false);
    }, 150); // slight delay to make moving mouse to dropdown easier
  };

  return (
    <div 
      className="relative flex h-full items-center group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link
        href={item.href}
        className={`sk-nav-link relative shrink-0 whitespace-nowrap px-4 py-[14px] text-sm font-semibold transition flex items-center gap-1 ${
          active || open ? 'text-white' : 'text-[var(--sn-header-nav)] hover:text-white'
        }`}
      >
        {item.label}
        <svg 
          width="10" 
          height="6" 
          viewBox="0 0 10 6" 
          aria-hidden 
          className={`transition-transform duration-200 opacity-60 ${open ? 'rotate-180' : ''}`}
        >
          <path
            d="M1 1.5 5 5 9 1.5"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Link>

      {/* Mega Menu Dropdown */}
      {open && (
        <div 
          className="absolute left-0 top-full z-50 pt-1"
        >
          <div className="w-56 overflow-hidden rounded-xl border border-[#2a2c35] bg-[#1a1c23] shadow-2xl backdrop-blur-xl">
            <div className="p-2">
              <Link
                href={item.href}
                className="block rounded-lg px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[var(--sn-accent)] transition hover:bg-white/5"
                onClick={() => setOpen(false)}
              >
                All {item.label}
              </Link>
              <div className="my-1 h-px bg-[#2a2c35]" />
              {item.children?.map((child) => (
                <Link
                  key={child.label}
                  href={child.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-4 py-2.5 text-sm font-semibold text-[#a0a5b1] transition hover:bg-white/5 hover:text-white"
                >
                  {child.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {active && (
        <div className="absolute bottom-0 left-1/2 h-0 w-0 -translate-x-1/2 border-l-[6px] border-r-[6px] border-b-[6px] border-l-transparent border-r-transparent border-b-[var(--sn-accent)]" />
      )}
    </div>
  );
}

export function HeaderNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  const primary = items.slice(0, 5);
  const overflow = items.slice(5);

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, [open]);

  return (
    <nav className="hidden min-w-0 flex-1 items-center gap-2 lg:flex pl-4">
      {primary.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        
        if (item.children && item.children.length > 0) {
          return <NavDropdown key={item.label} item={item} active={active} />;
        }

        return (
          <div key={item.label} className="relative flex h-full items-center">
            <Link
              href={item.href}
              className={`sk-nav-link relative shrink-0 whitespace-nowrap px-4 py-[14px] text-sm font-semibold transition ${active ? 'text-white' : 'text-[var(--sn-header-nav)] hover:text-white'
                }`}
            >
              {item.label}
              {item.badge && <span className="sk-nav-badge">{item.badge}</span>}
            </Link>
            {active && (
              <div className="absolute bottom-0 left-1/2 h-0 w-0 -translate-x-1/2 border-l-[6px] border-r-[6px] border-b-[6px] border-l-transparent border-r-transparent border-b-[var(--sn-accent)]" />
            )}
          </div>
        );
      })}

      {overflow.length > 0 && (
        <div className="relative flex h-full items-center" ref={dropRef}>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2 whitespace-nowrap px-4 py-[14px] text-sm font-semibold text-[var(--sn-header-nav)] transition hover:text-white"
            aria-expanded={open}
          >
            More
            <svg width="10" height="6" viewBox="0 0 10 6" aria-hidden>
              <path
                d={open ? 'M1 4.5 5 1 9 4.5' : 'M1 1.5 5 5 9 1.5'}
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {open && (
            <div className="absolute left-0 top-full z-50 pt-1">
              <div className="w-52 overflow-hidden rounded-xl border border-[#2a2c35] bg-[#1a1c23] shadow-2xl backdrop-blur-xl">
                <div className="p-2">
                  {overflow.map((item) => {
                    const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                    return (
                      <Link
                        key={item.label}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={`block rounded-lg px-4 py-2.5 text-sm font-semibold transition ${active
                            ? 'text-[var(--sn-accent)]'
                            : 'text-[#a0a5b1] hover:bg-white/5 hover:text-white'
                          }`}
                      >
                        {item.label}
                        {item.badge && (
                          <span className="ml-2 rounded bg-red-600 px-1 py-px text-[9px] font-bold text-white">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
