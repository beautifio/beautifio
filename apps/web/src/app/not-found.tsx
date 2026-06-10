import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-6">
      <div className="max-w-content mx-auto text-center">
        <div className="w-24 h-24 rounded-full bg-primary/5 flex items-center justify-center mx-auto mb-6">
          <span className="text-5xl font-bold text-primary">?</span>
        </div>
        <h1 className="text-4xl font-bold text-text-primary mb-2">404</h1>
        <p className="text-lg font-semibold text-text-primary mb-2">
          Halaman tidak ditemukan
        </p>
        <p className="text-sm text-text-secondary mb-8">
          Halaman yang kamu cari mungkin telah dipindahkan atau tidak tersedia.
        </p>
        <Link
          href="/"
          className="inline-flex h-12 px-8 rounded-sm bg-primary text-primary-foreground text-sm font-bold items-center justify-center hover:bg-primary/90 transition-colors"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
