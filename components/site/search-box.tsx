"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MaterialIcon } from "@/components/site/material-icon";
import { formatPrice } from "@/components/site/course-card";
import type { CourseSearchResult } from "@/lib/queries";

export function SearchBox() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CourseSearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query.trim();
    if (!q) return;

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setResults(data.results ?? []);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="hidden md:block relative">
      <form action="/courses" method="GET" className="flex relative items-center">
        <MaterialIcon
          name="search"
          className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm pointer-events-none"
        />
        <input
          name="q"
          value={query}
          onChange={(e) => {
            const value = e.target.value;
            setQuery(value);
            if (!value.trim()) {
              setResults([]);
              setOpen(false);
            }
          }}
          onFocus={() => results.length > 0 && setOpen(true)}
          autoComplete="off"
          className="pl-10 pr-4 py-2 bg-surface-container-high border border-outline-variant rounded-full text-sm w-64 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-on-surface"
          placeholder="Tìm khoá học, chủ đề..."
          type="text"
        />
      </form>

      {open && (
        <div className="absolute left-0 right-0 mt-2 bg-surface border border-outline-variant/30 rounded-xl shadow-lg z-50 overflow-hidden">
          {loading ? (
            <p className="p-4 text-center font-label-sm text-label-sm text-on-surface-variant">Đang tìm...</p>
          ) : results.length === 0 ? (
            <p className="p-4 text-center font-label-sm text-label-sm text-on-surface-variant">
              Không tìm thấy khoá học nào.
            </p>
          ) : (
            <div className="flex flex-col max-h-96 overflow-y-auto">
              {results.map((course) => (
                <Link
                  key={course.id}
                  href={`/courses/${course.slug}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 p-3 hover:bg-surface-container-low transition-colors border-b border-outline-variant/10 last:border-0"
                >
                  <div className="w-10 h-10 rounded-lg bg-surface-container-high shrink-0 overflow-hidden flex items-center justify-center">
                    {course.thumbnailUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={course.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <MaterialIcon name="school" className="text-primary text-[18px]" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-label-md text-label-md text-on-surface truncate">{course.title}</p>
                    <p className="font-label-sm text-label-sm text-on-surface-variant">
                      {course.category ? `${course.category} · ` : ""}
                      {formatPrice(course.price)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
