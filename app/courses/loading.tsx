import { SkeletonHeader } from "@/components/site/skeleton-header";

export default function CoursesLoading() {
  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col antialiased">
      <SkeletonHeader />
      <main className="flex-1 w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg flex flex-col gap-stack-lg">
        <div className="flex flex-col gap-2">
          <div className="h-8 w-64 rounded bg-surface-container-high animate-pulse" />
          <div className="h-4 w-40 rounded bg-surface-container-high animate-pulse" />
        </div>

        <div className="h-11 w-full max-w-md rounded-full bg-surface-container-high animate-pulse" />

        <div className="flex gap-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-9 w-24 rounded-full bg-surface-container-high animate-pulse" />
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-gutter">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-[240px] rounded-xl bg-surface-container-high animate-pulse" />
          ))}
        </div>
      </main>
    </div>
  );
}
