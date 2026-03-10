export default function SellerOrdersLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="transition-all duration-300 in-[.sidebar-closed]:pl-12">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <div>
            <div className="h-8 w-44 bg-stone-200 rounded-lg" />
            <div className="h-4 w-56 bg-stone-100 rounded mt-2" />
          </div>
          <div className="h-9 w-28 bg-stone-100 rounded-lg" />
        </div>
      </div>
      <div className="flex gap-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-9 w-28 bg-stone-100 rounded-full" />
        ))}
      </div>
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-stone-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-stone-200 rounded-full" />
                <div>
                  <div className="h-4 w-32 bg-stone-200 rounded mb-1" />
                  <div className="h-3 w-24 bg-stone-100 rounded" />
                </div>
              </div>
              <div className="h-6 w-20 bg-stone-100 rounded-full" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-full bg-stone-50 rounded" />
              <div className="h-4 w-2/3 bg-stone-50 rounded" />
            </div>
            <div className="flex justify-between mt-3">
              <div className="h-5 w-24 bg-stone-200 rounded" />
              <div className="flex gap-2">
                <div className="h-8 w-20 bg-stone-100 rounded-lg" />
                <div className="h-8 w-20 bg-green-100 rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
