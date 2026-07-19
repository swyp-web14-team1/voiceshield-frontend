"use client";

import { useRef } from "react";
import { CATEGORY_META } from "@/lib/case-meta";
import type { CaseCategory } from "@/types";

interface CategoryTagRowProps {
  value: "all" | CaseCategory;
  onChange: (value: "all" | CaseCategory) => void;
}

export function CategoryTagRow({ value, onChange }: CategoryTagRowProps) {
  const tagRowRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, startX: 0, startScrollLeft: 0, moved: false });

  const handleMouseDown = (e: React.MouseEvent) => {
    const el = tagRowRef.current;
    if (!el) return;
    drag.current = { active: true, startX: e.clientX, startScrollLeft: el.scrollLeft, moved: false };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const el = tagRowRef.current;
    if (!el || !drag.current.active) return;
    const delta = e.clientX - drag.current.startX;
    if (Math.abs(delta) > 3) drag.current.moved = true;
    el.scrollLeft = drag.current.startScrollLeft - delta;
  };

  const endDrag = () => {
    drag.current.active = false;
  };

  const handleClickCapture = (e: React.MouseEvent) => {
    if (drag.current.moved) {
      e.stopPropagation();
      e.preventDefault();
    }
  };

  return (
    <div
      ref={tagRowRef}
      className="no-scrollbar -my-1 flex cursor-pointer overflow-x-auto py-1"
      style={{ touchAction: "pan-x", WebkitOverflowScrolling: "touch", gap: "clamp(5px, 1.8cqw, 10px)" }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={endDrag}
      onMouseLeave={endDrag}
      onClickCapture={handleClickCapture}
    >
      <button
        type="button"
        onClick={() => onChange("all")}
        className={`shrink-0 rounded-full text-[clamp(12px,3.2cqw,14px)] font-medium whitespace-nowrap ${
          value === "all" ? "bg-gray-600 text-white" : "bg-white text-gray-600 shadow-[0px_1px_1.5px_rgba(0,0,0,0.1)]"
        }`}
        style={{ paddingInline: "clamp(12px, 4cqw, 16px)", paddingBlock: "clamp(4px, 1cqw, 6px)" }}
      >
        전체
      </button>
      {(Object.keys(CATEGORY_META) as CaseCategory[]).map((key) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className={`shrink-0 rounded-full text-[clamp(12px,3.2cqw,14px)] font-semibold whitespace-nowrap ${
            value === key ? "bg-gray-600 text-white" : "bg-white text-gray-600 shadow-[0px_1px_1.5px_rgba(0,0,0,0.1)]"
          }`}
          style={{ paddingInline: "clamp(12px, 4cqw, 16px)", paddingBlock: "clamp(3px, 1.3cqw, 4px)" }}
        >
          {CATEGORY_META[key].label}
        </button>
      ))}
    </div>
  );
}
