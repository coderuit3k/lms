import { SkeletonHeader } from "@/components/site/skeleton-header";

export default function EditCourseLoading() {
  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md text-body-md">
      <SkeletonHeader />
      <main className="flex-1 w-full max-w-3xl mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg flex flex-col gap-stack-lg">
        <div className="h-5 w-32 rounded bg-surface-container-high animate-pulse" />
        <div className="h-9 w-2/3 rounded bg-surface-container-high animate-pulse" />
        <div className="h-72 rounded-xl bg-surface-container-high animate-pulse" />
        <div className="flex flex-col gap-4">
          {[0, 1].map((i) => (
            <div key={i} className="h-40 rounded-xl bg-surface-container-high animate-pulse" />
          ))}
        </div>
      </main>
    </div>
  );
}
