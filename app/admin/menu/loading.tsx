export default function MenuLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="transition-all duration-300 in-[.sidebar-closed]:pl-12">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <div>
            <div className="h-8 w-40 bg-stone-200 rounded-lg" />
            <div className="h-4 w-56 bg-stone-100 rounded mt-2" />
          </div>
          <div className="h-10 w-36 bg-green-100 rounded-xl" />
        </div>
      </div>
      <div className="flex gap-2 mb-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-9 w-24 bg-stone-100 rounded-lg" />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
            <div className="h-40 bg-stone-200" />
            <div className="p-4 space-y-2">
              <div className="h-5 w-3/4 bg-stone-200 rounded" />
              <div className="h-4 w-1/2 bg-stone-100 rounded" />
              <div className="flex justify-between items-center mt-3">
                <div className="h-5 w-20 bg-stone-200 rounded" />
                <div className="h-8 w-24 bg-stone-100 rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
