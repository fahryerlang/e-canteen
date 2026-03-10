export default function CartLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div>
        <div className="h-8 w-36 bg-stone-200 rounded-lg" />
        <div className="h-4 w-48 bg-stone-100 rounded mt-2" />
      </div>
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-stone-100 p-4 flex items-center gap-4">
            <div className="w-20 h-20 bg-stone-200 rounded-xl shrink-0" />
            <div className="flex-1">
              <div className="h-5 w-40 bg-stone-200 rounded mb-2" />
              <div className="h-4 w-24 bg-stone-100 rounded mb-2" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-stone-100 rounded-lg" />
                <div className="w-8 h-8 bg-stone-100 rounded" />
                <div className="w-8 h-8 bg-stone-100 rounded-lg" />
              </div>
            </div>
            <div className="h-5 w-20 bg-stone-200 rounded" />
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-stone-100 p-5">
        <div className="flex justify-between mb-4">
          <div className="h-5 w-20 bg-stone-200 rounded" />
          <div className="h-5 w-28 bg-stone-200 rounded" />
        </div>
        <div className="h-11 w-full bg-green-100 rounded-xl" />
      </div>
    </div>
  );
}
