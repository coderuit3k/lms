import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import Provider from "./provider";

export const metadata: Metadata = {
  title: "Scholaris - Nền tảng học trực tuyến",
  description: "Làm chủ tương lai, từng chương một.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <ClerkProvider>
      <html lang="vi" className="h-full antialiased">
        <head>
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
            rel="stylesheet"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
            rel="stylesheet"
          />
        </head>
        <body className="min-h-full flex flex-col">
          <Provider>
            {children}
          </Provider>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "var(--color-surface-container-lowest)",
                color: "var(--color-on-surface)",
                border: "1px solid var(--color-outline-variant)",
              },
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  );
}
