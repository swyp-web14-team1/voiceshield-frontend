"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROUTES } from "@/lib/routes";

const NAV_ITEMS = [
  { label: "홈", href: ROUTES.home },
  { label: "사례", href: ROUTES.cases },
  { label: "기록", href: ROUTES.history },
  { label: "신고안내", href: ROUTES.report },
  { label: "설정", href: ROUTES.settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 border-t border-zinc-200 bg-white/95 backdrop-blur dark:border-zinc-800 dark:bg-black/95">
      <ul className="mx-auto flex max-w-xl items-stretch justify-between px-2">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === ROUTES.home
              ? pathname === item.href
              : pathname.startsWith(item.href);

          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={`flex flex-col items-center gap-1 py-3 text-sm font-medium ${
                  isActive
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-zinc-500 dark:text-zinc-400"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
