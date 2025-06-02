'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Settings, Home, BarChart2, LogOut, BookOpen, TrendingUp } from 'lucide-react';

export function Navigation() {
  const { data: session } = useSession();
  const pathname = usePathname() || '/';

  if (!session) return null;

  const links = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/trends', label: 'Trends', icon: TrendingUp },
    { href: '/analytics', label: 'Analytics', icon: BarChart2 },
    { href: '/settings', label: 'Settings', icon: Settings },
    { href: '/guide', label: 'Writing Guide', icon: BookOpen },
  ];

  return (
    <nav className="fixed top-4 right-4 z-50 flex items-center gap-2">
      {links.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            className={`relative px-4 py-2 text-sm font-medium transition-colors ${
              isActive
                ? 'text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <span className="flex items-center gap-2">
              <Icon className="h-4 w-4" />
              {label}
              {isActive && (
                <motion.div
                  className="absolute inset-0 -z-10 bg-white/10 rounded-md"
                  layoutId="navbar"
                  transition={{
                    type: "spring",
                    stiffness: 350,
                    damping: 30,
                  }}
                />
              )}
            </span>
          </Link>
        );
      })}
      <button
        onClick={() => signOut()}
        className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors flex items-center gap-2"
      >
        <LogOut className="h-4 w-4" />
        Sign Out
      </button>
    </nav>
  );
} 