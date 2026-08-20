import { SkeletonHeader } from "@/components/site/skeleton-header";

export default function InstructorLoading() {
  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md text-body-md">
      <SkeletonHeader />
      <main className="flex-1 w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg flex flex-col gap-stack-lg">
        <div className="h-8 w-40 rounded bg-surface-container-high animate-pulse" />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-gutter">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-surface-container-high animate-pulse" />
          ))}
        </div>

        <div className="h-20 rounded-xl bg-surface-container-high animate-pulse" />

        <div className="flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-20 rounded-xl bg-surface-container-high animate-pulse" />
          ))}
        </div>
      </main>
    </div>
  );
}
