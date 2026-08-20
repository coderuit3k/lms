"use client";

import { useState } from "react";
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

  return (
    <div className="relative md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Đóng menu điều hướng" : "Mở menu điều hướng"}
        aria-expanded={open}
        className="text-on-surface-variant hover:text-primary hover:bg-surface-container-high rounded-full p-2 transition-colors"
      >
        <MaterialIcon name={open ? "close" : "menu"} className="text-[22px]" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-56 bg-surface border border-outline-variant/30 rounded-xl shadow-lg z-50 flex flex-col p-2">
            {navLinks.map((link) => (
              <Link
                key={link.key}
                href={link.href}
                onClick={() => setOpen(false)}
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
          </div>
        </>
      )}
    </div>
  );
}
