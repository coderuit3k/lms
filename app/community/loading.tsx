import { SkeletonHeader } from "@/components/site/skeleton-header";

export default function CommunityLoading() {
  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md text-body-md">
      <SkeletonHeader />
      <div className="flex flex-1">
        <aside className="hidden md:flex flex-col w-64 shrink-0 bg-surface-container-low border-r border-outline-variant/30 p-4 gap-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-10 w-full rounded-xl bg-surface-container-high animate-pulse" />
          ))}
        </aside>
        <main className="flex-1 p-margin-mobile md:p-margin-desktop w-full max-w-container-max mx-auto">
          <div className="h-9 w-56 rounded bg-surface-container-high animate-pulse mb-2" />
          <div className="h-4 w-80 rounded bg-surface-container-high animate-pulse mb-stack-lg" />

          <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
            <div className="md:col-span-12 h-40 rounded-xl bg-surface-container-high animate-pulse" />
            <div className="md:col-span-8 h-96 rounded-xl bg-surface-container-high animate-pulse" />
            <div className="md:col-span-4 h-64 rounded-xl bg-surface-container-high animate-pulse" />
          </div>
        </main>
      </div>
    </div>
  );
}
