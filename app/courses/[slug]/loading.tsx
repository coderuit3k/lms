import { SkeletonHeader } from "@/components/site/skeleton-header";

export default function CourseDetailLoading() {
  return (
    <div className="bg-background text-on-background antialiased min-h-screen flex flex-col">
      <SkeletonHeader />
      <main className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg flex flex-col lg:flex-row gap-gutter">
        <div className="flex-1 max-w-[720px] lg:max-w-none lg:w-2/3 flex flex-col gap-stack-lg">
          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <div className="h-6 w-20 rounded-full bg-surface-container-high animate-pulse" />
              <div className="h-6 w-24 rounded-full bg-surface-container-high animate-pulse" />
            </div>
            <div className="h-10 w-full max-w-xl rounded bg-surface-container-high animate-pulse" />
            <div className="h-4 w-full max-w-lg rounded bg-surface-container-high animate-pulse" />
            <div className="h-4 w-2/3 rounded bg-surface-container-high animate-pulse" />
          </div>
          <div className="flex flex-col gap-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="h-14 rounded-lg bg-surface-container-high animate-pulse" />
            ))}
          </div>
        </div>
        <div className="lg:w-1/3 shrink-0">
          <div className="h-80 rounded-xl bg-surface-container-high animate-pulse" />
        </div>
      </main>
    </div>
  );
}
