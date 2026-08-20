"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MaterialIcon } from "@/components/site/material-icon";

type NavLink = { key: string; label: string; href: string };

export function MobileNav({
  navLinks,
  active,
  signedIn,
}: {
  navLinks: NavLink[];
  active?: string;
  signedIn: boolean;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Mở menu điều hướng"
        aria-expanded={open}
        className="text-on-surface-variant hover:text-primary hover:bg-surface-container-high rounded-full p-2 transition-colors"
      >
        <MaterialIcon name="menu" className="text-[22px]" />
      </button>

      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        aria-hidden="true"
        className={
          open
            ? "fixed inset-0 bg-on-surface/40 z-40 transition-opacity duration-300 opacity-100"
            : "fixed inset-0 bg-on-surface/40 z-40 transition-opacity duration-300 opacity-0 pointer-events-none"
        }
      />

      {/* Off-canvas drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Menu điều hướng"
        className={
          open
            ? "fixed inset-y-0 left-0 z-50 w-72 max-w-[80vw] bg-surface shadow-lg flex flex-col transition-transform duration-300 ease-out translate-x-0"
            : "fixed inset-y-0 left-0 z-50 w-72 max-w-[80vw] bg-surface shadow-lg flex flex-col transition-transform duration-300 ease-out -translate-x-full"
        }
      >
        <div className="flex items-center justify-between p-4 border-b border-outline-variant/30">
          <span className="font-display text-headline-md font-bold text-primary">Scholaris</span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Đóng menu điều hướng"
            className="text-on-surface-variant hover:text-primary hover:bg-surface-container-high rounded-full p-2 transition-colors"
          >
            <MaterialIcon name="close" className="text-[22px]" />
          </button>
        </div>

        <nav className="flex-1 flex flex-col gap-1 p-3" aria-label="Điều hướng chính">
          {navLinks.map((link) => (
            <Link
              key={link.key}
              href={link.href}
              onClick={() => setOpen(false)}
              aria-current={active === link.key ? "page" : undefined}
              className={
                active === link.key
                  ? "px-3 py-2.5 rounded-lg font-label-md text-label-md bg-primary/10 text-primary font-semibold"
                  : "px-3 py-2.5 rounded-lg font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors"
              }
            >
              {link.label}
            </Link>
          ))}
          {!signedIn && (
            <>
              <div className="my-1 border-t border-outline-variant/30" />
              <Link
                href="/sign-in"
                onClick={() => setOpen(false)}
                className="px-3 py-2.5 rounded-lg font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors"
              >
                Đăng nhập
              </Link>
            </>
          )}
        </nav>
      </div>
    </div>
  );
}
