export default function SellerWithdrawalsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="transition-all duration-300 in-[.sidebar-closed]:pl-12">
        <div>
          <div className="h-8 w-40 bg-stone-200 rounded-lg" />
          <div className="h-4 w-48 bg-stone-100 rounded mt-2" />
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-stone-100 p-6 mb-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-4 w-24 bg-stone-100 rounded mb-2" />
            <div className="h-7 w-36 bg-stone-200 rounded" />
          </div>
          <div className="h-10 w-32 bg-green-100 rounded-xl" />
        </div>
      </div>
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-stone-100 p-5 flex items-center gap-4">
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
