export default function WithdrawalsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="transition-all duration-300 in-[.sidebar-closed]:pl-12">
        <div>
          <div className="h-8 w-44 bg-stone-200 rounded-lg" />
          <div className="h-4 w-56 bg-stone-100 rounded mt-2" />
        </div>
      </div>
      <div className="flex gap-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-9 w-28 bg-stone-100 rounded-full" />
        ))}
      </div>
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-stone-100 p-5 flex items-center gap-4">
            <div className="w-10 h-10 bg-stone-200 rounded-full shrink-0" />
            <div className="flex-1">
              <div className="h-4 w-32 bg-stone-200 rounded mb-1" />
              <div className="h-3 w-20 bg-stone-100 rounded" />
            </div>
            <div className="h-5 w-24 bg-stone-200 rounded" />
            <div className="h-6 w-16 bg-stone-100 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
