"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import {
  NavEmergencyIcon,
  NavHistoryIcon,
  NavHomeIcon,
  NavLearnIcon,
  NavSettingsIcon,
} from "@/components/icons/home-icons";

const NAV_ITEMS = [
  { label: "홈", href: ROUTES.home, Icon: NavHomeIcon, placeholder: false },
  { label: "학습", href: ROUTES.home, Icon: NavLearnIcon, placeholder: true },
  { label: "기록", href: ROUTES.home, Icon: NavHistoryIcon, placeholder: true },
  { label: "긴급", href: ROUTES.home, Icon: NavEmergencyIcon, placeholder: true },
  { label: "설정", href: ROUTES.settings, Icon: NavSettingsIcon, placeholder: false },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 h-16.75 border-t border-gray-200 bg-white/95 backdrop-blur dark:border-gray-800 dark:bg-black/95">
      <ul
        className="mx-auto flex h-full w-full max-w-xl items-center justify-center overflow-hidden px-10 @max-[410px]:px-7"
        style={{ gap: "clamp(4px, 6cqw, 40px)" }}
      >
        {NAV_ITEMS.map(({ label, href, Icon, placeholder }, index) => {
          const isActive =
            !placeholder && (href === ROUTES.home ? pathname === href : pathname.startsWith(href));

          return (
            <li key={index} className="min-w-0 flex-1">
              <Link
                href={href}
                className={`flex min-w-0 flex-col items-center gap-1 rounded-2xl py-1 ${
                  isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-400"
                }`}
              >
                <Icon
                  className="shrink-0"
                  style={{ width: "clamp(14px, 4.4cqw, 22px)", height: "clamp(14px, 4.4cqw, 22px)" }}
                />
                <span className="w-full truncate text-center text-xs font-bold">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
