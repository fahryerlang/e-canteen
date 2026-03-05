export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div>
        <div className="h-8 w-48 bg-stone-200 rounded-lg" />
        <div className="h-4 w-72 bg-stone-100 rounded mt-2" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-40 bg-stone-100 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
