export default function UserMenuLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div>
        <div className="h-8 w-32 bg-stone-200 rounded-lg" />
        <div className="h-4 w-56 bg-stone-100 rounded mt-2" />
      </div>
      <div className="h-10 w-full bg-stone-100 rounded-xl" />
      <div className="flex gap-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-8 w-20 bg-stone-100 rounded-full" />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
            <div className="h-40 bg-stone-200" />
            <div className="p-4 space-y-2">
              <div className="h-5 w-3/4 bg-stone-200 rounded" />
              <div className="h-4 w-1/2 bg-stone-100 rounded" />
              <div className="h-3 w-1/3 bg-stone-100 rounded" />
              <div className="flex justify-between items-center mt-3">
                <div className="h-5 w-20 bg-stone-200 rounded" />
                <div className="h-9 w-28 bg-green-100 rounded-xl" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
