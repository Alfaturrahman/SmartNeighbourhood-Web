import Link from 'next/link';

export default function Home() {
  const features = [
    { href: '/login', label: '🔐 Masuk', desc: 'Login ke sistem' },
    { href: '/dashboard', label: '📊 Dashboard', desc: 'Lihat ringkasan data' },
    { href: '/residents', label: '👥 Manajemen Warga', desc: 'Kelola data warga' },
    { href: '/security-schedule', label: '🔒 Jadwal Keamanan', desc: 'Atur jadwal petugas' },
    { href: '/feedback', label: '💬 Feedback', desc: 'Terima masukan warga' },
    { href: '/announcements', label: '📢 Pengumuman', desc: 'Bagikan informasi' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#003366] via-[#004d80] to-[#003366] relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-[#66CC66] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute top-40 right-20 w-72 h-72 bg-[#FF9500] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-2000"></div>
      <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-[#FFD700] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-4000"></div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-6xl">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-[#FF9500] rounded-2xl flex items-center justify-center text-white text-4xl shadow-2xl">
                🏘️
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight">
              Smart Neighborhood
            </h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Platform modern untuk mengelola komunitas perumahan Anda dengan mudah, efisien, dan transparan
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {features.map((feature) => (
              <Link
                key={feature.href}
                href={feature.href}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#FF9500] to-[#FFD700] rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-500 group-hover:blur-lg"></div>
                <div className="relative bg-white/95 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:border-white/40 transition-all duration-200 transform group-hover:scale-105">
                  <div className="text-3xl mb-3">{feature.label.split(' ')[0]}</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {feature.label.split(' ').slice(1).join(' ')}
                  </h3>
                  <p className="text-sm text-gray-600">{feature.desc}</p>
                  <div className="mt-4 text-[#003366] font-medium text-sm group-hover:translate-x-1 transition-transform">
                    Kunjungi →
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* CTA Section */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-3">Siap Mulai?</h2>
            <p className="text-gray-300 mb-6">
              Demo mode aktif - gunakan email dan password apapun untuk login
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-8 py-3 bg-[#FF9500] hover:bg-[#FF8C00] text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
            >
              Masuk Sekarang →
            </Link>
          </div>

          {/* Footer Note */}
          <div className="text-center mt-12">
            <p className="text-gray-400 text-sm">
              Aplikasi demonstrasi • Semua data adalah dummy data
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
