export function DemoBanner({ isDemo }: { isDemo: boolean }) {
  if (!isDemo) return null;
  return (
    <div className="bg-amber-50 border-b border-amber-200 px-6 py-2 flex items-center justify-center gap-2.5">
      <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
      <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
        Mode démonstration
      </span>
      <span className="text-xs text-amber-500 hidden sm:inline">
        — données fictives isolées des vraies
      </span>
    </div>
  );
}
