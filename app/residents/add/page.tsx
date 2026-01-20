"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AddResidentPage() {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    status: 'aktif',
  });
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    setTimeout(() => {
      setSuccess('✓ Warga berhasil ditambahkan!');
      setFormData({ name: '', address: '', phone: '', email: '', status: 'aktif' });
      setIsLoading(false);
      
      setTimeout(() => router.push('/residents'), 1500);
    }, 600);
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <Link href="/residents" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 font-medium text-sm">
          ← Kembali ke Daftar Warga
        </Link>
        <h2 className="text-3xl font-bold text-gray-900">Tambah Warga Baru</h2>
        <p className="text-gray-600 mt-1">Isikan data warga untuk menambahkan ke sistem</p>
      </div>

      {success && (
        <div className="mb-6 px-4 py-3 bg-green-50 border border-green-200 text-green-700 rounded-lg font-medium animate-pulse">
          {success}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name Input */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Nama Lengkap *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Contoh: Budi Santoso"
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                    />
                  </div>

                  {/* Email Input */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="budi@contoh.com"
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                    />
                  </div>

                  {/* Phone Input */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Telepon *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="08123456789"
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                    />
                  </div>

                  {/* Status Select */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                    >
                      <option value="aktif">✓ Aktif</option>
                      <option value="tidak aktif">✕ Tidak Aktif</option>
                    </select>
                  </div>
                </div>

                {/* Address Input - Full Width */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Alamat *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Contoh: Jl. Mawar No. 10, RT 01, RW 02"
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        Menyimpan...
                      </>
                    ) : (
                      '✓ Simpan'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push('/residents')}
                    className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-lg transition-all duration-200"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      }
