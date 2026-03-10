export default function UserCanteensLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div>
        <div className="h-8 w-32 bg-stone-200 rounded-lg" />
        <div className="h-4 w-48 bg-stone-100 rounded mt-2" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-stone-100 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-stone-200 rounded-xl shrink-0" />
              <div>
                <div className="h-5 w-32 bg-stone-200 rounded mb-1" />
                <div className="h-3 w-20 bg-stone-100 rounded" />
              </div>
            </div>
            <div className="h-4 w-full bg-stone-100 rounded mb-2" />
            <div className="h-4 w-2/3 bg-stone-100 rounded" />
            <div className="mt-3 h-9 w-full bg-green-50 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}
