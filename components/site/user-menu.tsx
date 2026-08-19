"use client";

import { UserButton } from "@clerk/nextjs";
import { MaterialIcon } from "@/components/site/material-icon";

export function UserMenu({ role }: { role: string | null }) {
  return (
    <UserButton>
      <UserButton.MenuItems>
        <UserButton.Link
          label="Profile"
          href="/profile"
          labelIcon={<MaterialIcon name="person" className="text-[16px]" />}
        />
        <UserButton.Link
          label="Settings"
          href="/settings"
          labelIcon={<MaterialIcon name="settings" className="text-[16px]" />}
        />
        {(role === "instructor" || role === "admin") && (
          <UserButton.Link
            label="Instructor"
            href="/instructor"
            labelIcon={<MaterialIcon name="school" className="text-[16px]" />}
          />
        )}
        {role === "admin" && (
          <UserButton.Link
            label="Admin"
            href="/admin"
            labelIcon={<MaterialIcon name="shield_person" className="text-[16px]" />}
          />
        )}
      </UserButton.MenuItems>
    </UserButton>
  );
}
