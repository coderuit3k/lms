import { SkeletonHeader } from "@/components/site/skeleton-header";

export default function DashboardLoading() {
  return (
    <div className="bg-background text-on-background h-screen font-body-md text-body-md flex flex-col overflow-hidden">
      <SkeletonHeader />
      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden lg:flex flex-col h-full w-64 bg-surface-container-low border-r border-outline-variant/30 flex-shrink-0 p-4 gap-3">
          <div className="h-12 w-full rounded-lg bg-surface-container-high animate-pulse" />
          <div className="h-11 w-full rounded-xl bg-surface-container-high animate-pulse" />
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-10 w-full rounded-lg bg-surface-container-high animate-pulse" />
          ))}
        </aside>
        <main className="flex-1 overflow-y-auto bg-background p-margin-mobile md:p-margin-desktop">
          <div className="max-w-container-max mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-gutter">
            <div className="md:col-span-12 lg:col-span-8 h-40 rounded-xl bg-surface-container-high animate-pulse" />
            <div className="md:col-span-6 lg:col-span-2 h-40 rounded-xl bg-surface-container-high animate-pulse" />
            <div className="md:col-span-6 lg:col-span-2 h-40 rounded-xl bg-surface-container-high animate-pulse" />
            <div className="md:col-span-12 lg:col-span-8 lg:row-span-2 h-96 rounded-xl bg-surface-container-high animate-pulse" />
            <div className="md:col-span-12 lg:col-span-4 lg:row-span-2 h-96 rounded-xl bg-surface-container-high animate-pulse" />
          </div>
        </main>
      </div>
    </div>
  );
}
