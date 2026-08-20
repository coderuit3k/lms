export function SkeletonHeader() {
  return (
    <header className="bg-surface sticky top-0 z-50 w-full border-b border-outline-variant/30">
      <div className="flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto h-16">
        <div className="flex items-center gap-6">
          <div className="h-6 w-24 rounded bg-surface-container-high animate-pulse" />
          <div className="hidden md:block h-9 w-72 rounded-full bg-surface-container-high animate-pulse" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-surface-container-high animate-pulse" />
          <div className="h-9 w-9 rounded-full bg-surface-container-high animate-pulse" />
        </div>
      </div>
    </header>
  );
}
