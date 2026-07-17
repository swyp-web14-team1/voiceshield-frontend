import Link from "next/link";
import { FiChevronLeft } from "react-icons/fi";

interface BackHeaderProps {
  title: string;
  backHref: string;
}

export function BackHeader({ title, backHref }: BackHeaderProps) {
  return (
    <header className="flex items-center gap-1 px-4 py-4">
      <Link
        href={backHref}
        className="text-gray-700 transition-colors [@media(hover:hover)_and_(pointer:fine)]:hover:text-gray-900"
      >
        <FiChevronLeft size={24} />
      </Link>
      <h1 className="text-xl font-bold text-gray-700">{title}</h1>
    </header>
  );
}
