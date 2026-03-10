export default function SellerReviewsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="transition-all duration-300 in-[.sidebar-closed]:pl-12">
        <div>
          <div className="h-8 w-28 bg-stone-200 rounded-lg" />
          <div className="h-4 w-48 bg-stone-100 rounded mt-2" />
        </div>
      </div>
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-stone-100 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-stone-200 rounded-full" />
              <div>
                <div className="h-4 w-28 bg-stone-200 rounded mb-1" />
                <div className="h-3 w-20 bg-stone-100 rounded" />
              </div>
            </div>
            <div className="h-4 w-full bg-stone-50 rounded mb-2" />
            <div className="h-4 w-2/3 bg-stone-50 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
