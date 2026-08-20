"use client";

import { UserButton } from "@clerk/nextjs";
import { MaterialIcon } from "@/components/site/material-icon";

export function UserMenu({ role }: { role: string | null }) {
  return (
    <UserButton appearance={{ elements: { avatarBox: "w-9 h-9" } }}>
      <UserButton.MenuItems>
        <UserButton.Link
          label="Hồ sơ"
          href="/profile"
          labelIcon={<MaterialIcon name="person" className="text-[16px]" />}
        />
        <UserButton.Link
          label="Cài đặt"
          href="/settings"
          labelIcon={<MaterialIcon name="settings" className="text-[16px]" />}
        />
        {(role === "instructor" || role === "admin") && (
          <UserButton.Link
            label="Giảng viên"
            href="/instructor"
            labelIcon={<MaterialIcon name="school" className="text-[16px]" />}
          />
        )}
        {role === "admin" && (
          <UserButton.Link
            label="Quản trị"
            href="/admin"
            labelIcon={<MaterialIcon name="shield_person" className="text-[16px]" />}
          />
        )}
      </UserButton.MenuItems>
    </UserButton>
  );
}
