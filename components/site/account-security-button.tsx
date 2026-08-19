"use client";

import { useClerk } from "@clerk/nextjs";
import { MaterialIcon } from "@/components/site/material-icon";

export function AccountSecurityButton() {
  const clerk = useClerk();

  return (
    <button
      type="button"
      onClick={() => clerk.openUserProfile()}
      className="w-full border border-primary text-primary font-label-md text-label-md py-2 rounded-lg hover:bg-surface-container-low transition-colors flex items-center justify-center gap-2"
    >
      <MaterialIcon name="security" className="text-[18px]" />
      Quản lý mật khẩu & bảo mật
    </button>
  );
}
