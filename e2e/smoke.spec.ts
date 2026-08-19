import { test, expect } from "@playwright/test";

// Smoke tests cho phần không cần đăng nhập — không có Clerk test-mode/token nào được cấu hình
// trong dự án nên các luồng cần auth thật (sign-up, thanh toán, tạo course, role guard khi ĐÃ
// đăng nhập sai role) chưa tự động hoá được ở đây. Xem ghi chú "Việc chưa làm" trong
// docs/phases/16-testing-qa.md.

test("trang chủ hiển thị đúng nội dung", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Master the future")).toBeVisible();
});

test("trang catalog khoá học load được", async ({ page }) => {
  await page.goto("/courses");
  await expect(page.getByRole("heading", { name: "Khám phá khoá học" })).toBeVisible();
});

test("khoá học không tồn tại trả 404", async ({ page }) => {
  const response = await page.goto("/courses/khoa-hoc-khong-ton-tai-xyz");
  expect(response?.status()).toBe(404);
});

test.describe("route guard — chưa đăng nhập bị chặn", () => {
  for (const path of ["/dashboard", "/settings", "/profile", "/instructor", "/admin"]) {
    test(`${path} redirect về /sign-in`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveURL(/\/sign-in/);
    });
  }
});

test("ô tìm kiếm trên header điều hướng đúng /courses?q=...", async ({ page }) => {
  await page.goto("/");
  const searchInput = page.getByPlaceholder("Tìm khoá học, chủ đề...");
  await searchInput.fill("react");
  await searchInput.press("Enter");
  await expect(page).toHaveURL(/\/courses\?q=react/);
});
