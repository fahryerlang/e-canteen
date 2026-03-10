export default function SellerReportsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="transition-all duration-300 in-[.sidebar-closed]:pl-12">
        <div>
          <div className="h-8 w-32 bg-stone-200 rounded-lg" />
          <div className="h-4 w-48 bg-stone-100 rounded mt-2" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-stone-100 p-6">
            <div className="h-4 w-24 bg-stone-100 rounded mb-2" />
            <div className="h-7 w-32 bg-stone-200 rounded" />
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-stone-100 p-6">
        <div className="h-6 w-48 bg-stone-200 rounded mb-6" />
        <div className="h-64 bg-stone-50 rounded-xl" />
      </div>
    </div>
  );
}
