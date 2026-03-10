export default function UsersLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="transition-all duration-300 in-[.sidebar-closed]:pl-12">
        <div>
          <div className="h-8 w-48 bg-stone-200 rounded-lg" />
          <div className="h-4 w-56 bg-stone-100 rounded mt-2" />
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
        <div className="p-4 border-b border-stone-100 flex items-center gap-3">
          <div className="h-10 flex-1 bg-stone-100 rounded-lg" />
          <div className="h-10 w-32 bg-stone-100 rounded-lg" />
        </div>
        <div className="divide-y divide-stone-100">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4">
              <div className="w-10 h-10 bg-stone-200 rounded-full shrink-0" />
              <div className="flex-1">
                <div className="h-4 w-36 bg-stone-200 rounded mb-1" />
                <div className="h-3 w-48 bg-stone-100 rounded" />
              </div>
              <div className="h-6 w-16 bg-stone-100 rounded-full" />
              <div className="h-8 w-8 bg-stone-100 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
