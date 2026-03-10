export default function ProfileLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div>
        <div className="h-8 w-24 bg-stone-200 rounded-lg" />
        <div className="h-4 w-40 bg-stone-100 rounded mt-2" />
      </div>
      <div className="bg-white rounded-2xl border border-stone-100 p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-stone-200 rounded-full" />
          <div>
            <div className="h-5 w-36 bg-stone-200 rounded mb-2" />
            <div className="h-4 w-48 bg-stone-100 rounded" />
          </div>
        </div>
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i}>
              <div className="h-4 w-20 bg-stone-100 rounded mb-2" />
              <div className="h-10 w-full bg-stone-100 rounded-lg" />
            </div>
          ))}
        </div>
        <div className="h-11 w-full bg-green-100 rounded-xl mt-6" />
      </div>
    </div>
  );
}
