import Navbar from "@/app/components/Navbar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-5 sm:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
