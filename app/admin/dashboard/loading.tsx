export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="transition-all duration-300 in-[.sidebar-closed]:pl-12">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <div>
            <div className="h-8 w-40 bg-stone-200 rounded-lg" />
            <div className="h-4 w-72 bg-stone-100 rounded mt-2" />
          </div>
          <div className="h-8 w-48 bg-stone-100 rounded-lg" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-stone-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 bg-stone-200 rounded-xl" />
              <div className="w-16 h-6 bg-stone-100 rounded-full" />
            </div>
            <div className="h-4 w-24 bg-stone-100 rounded mb-2" />
            <div className="h-7 w-32 bg-stone-200 rounded" />
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-stone-100 p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="h-6 w-48 bg-stone-200 rounded" />
          <div className="h-8 w-24 bg-stone-100 rounded-lg" />
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-2">
              <div className="w-8 h-8 bg-stone-100 rounded-lg shrink-0" />
              <div className="flex-1 h-4 bg-stone-100 rounded" />
              <div className="w-16 h-4 bg-stone-100 rounded" />
              <div className="w-20 h-6 bg-stone-100 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
