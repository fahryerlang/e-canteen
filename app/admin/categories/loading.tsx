export default function CategoriesLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="transition-all duration-300 in-[.sidebar-closed]:pl-12">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <div>
            <div className="h-8 w-44 bg-stone-200 rounded-lg" />
            <div className="h-4 w-56 bg-stone-100 rounded mt-2" />
          </div>
          <div className="h-10 w-40 bg-green-100 rounded-xl" />
        </div>
      </div>
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-stone-100 p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-stone-100 rounded-xl shrink-0" />
              <div className="flex-1">
                <div className="h-5 w-28 bg-stone-200 rounded mb-2" />
                <div className="flex gap-2">
                  <div className="h-4 w-20 bg-stone-100 rounded" />
                  <div className="h-4 w-16 bg-stone-100 rounded" />
                </div>
              </div>
              <div className="flex gap-2">
                <div className="w-9 h-9 bg-stone-100 rounded-xl" />
                <div className="w-9 h-9 bg-stone-100 rounded-xl" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
