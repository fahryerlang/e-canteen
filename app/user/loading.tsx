export default function UserLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div>
        <div className="h-8 w-48 bg-stone-200 rounded-lg" />
        <div className="h-4 w-64 bg-stone-100 rounded mt-2" />
      </div>

      {/* Grid cards skeleton (menu/canteen style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
            <div className="h-40 bg-stone-200" />
            <div className="p-4 space-y-2">
              <div className="h-5 w-3/4 bg-stone-200 rounded" />
              <div className="h-4 w-1/2 bg-stone-100 rounded" />
              <div className="h-4 w-1/3 bg-stone-100 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
