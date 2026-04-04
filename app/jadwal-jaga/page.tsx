"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { showErrorAlert } from '@/lib/swalUtils';
import { securityScheduleService } from '@/services/modules/securityScheduleService';

export default function JadwalJagaPage() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const getTimeByShift = (shift: 'Pagi' | 'Siang' | 'Malam'): string => {
    switch (shift) {
      case 'Pagi':
        return '08:00 - 16:00';
      case 'Siang':
        return '16:00 - 24:00';
      case 'Malam':
        return '00:00 - 08:00';
      default:
        return '08:00 - 16:00';
    }
  };

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    
    fetchSchedules();
  }, [router]);

  const fetchSchedules = async () => {
    try {
      setIsLoading(true);
      const response = await securityScheduleService.getAll();
      const data = (response.results || response.data || []) as any[];
      setSchedules(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Error fetching schedules:', error);
      await showErrorAlert('Error', 'Gagal memuat data jadwal keamanan');
      setSchedules([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">🛡️</span>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#003366]">Jadwal Jaga Hari Ini</h2>
            <p className="text-gray-600 mt-1 text-sm md:text-base">
              {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-r-lg">
        <div className="flex items-start gap-3">
          <span className="text-2xl">ℹ️</span>
          <div>
            <p className="text-sm text-blue-900 font-medium">Informasi Petugas Keamanan</p>
            <p className="text-xs text-blue-700 mt-1">
              Berikut adalah daftar petugas keamanan yang bertugas hari ini. Hubungi mereka jika ada keperluan mendesak.
            </p>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003366]"></div>
        </div>
      ) : (
        /* Today's Guard Schedule Cards */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {['Pagi', 'Siang', 'Malam'].map((shift) => {
            const todaySchedules = schedules.filter(s => {
              const today = new Date();
              const startDate = new Date(s.start_date);
              const endDate = new Date(s.end_date);
              return s.shift === shift && s.status === 'aktif' && today >= startDate && today <= endDate;
            });

            return (
              <div 
                key={shift} 
                className={`rounded-xl border-2 p-6 hover:shadow-xl transition-all ${
                  shift === 'Pagi' ? 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-yellow-100' : 
                  shift === 'Siang' ? 'border-orange-400 bg-gradient-to-br from-orange-50 to-orange-100' : 
                  'border-blue-400 bg-gradient-to-br from-blue-50 to-blue-100'
                }`}
              >
                {/* Shift Header */}
                <div className="flex items-center gap-3 mb-5 pb-4 border-b-2 border-gray-300">
                  <span className="text-4xl">
                    {shift === 'Pagi' ? '☀️' : shift === 'Siang' ? '🌆' : '🌙'}
                  </span>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900">Shift {shift}</h3>
                    <p className="text-sm text-gray-700 font-medium">{getTimeByShift(shift as any)}</p>
                  </div>
                </div>

                {/* Guards List */}
                {todaySchedules.length > 0 ? (
                  <div className="space-y-4">
                    {todaySchedules.map((schedule) => (
                      <div 
                        key={schedule.id} 
                        className="bg-white rounded-lg p-4 shadow-md border-2 border-gray-200 hover:border-[#003366] transition-all"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-[#003366] to-[#004d80] rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-md">
                            {schedule.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-900 text-base break-words mb-2">
                              {schedule.name}
                            </p>
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2">
                                <span className="text-green-600">📞</span>
                                <a 
                                  href={`tel:${schedule.personnel_phone}`}
                                  className="text-sm text-gray-700 hover:text-[#003366] font-medium break-all transition-colors"
                                >
                                  {schedule.personnel_phone || 'Tidak tersedia'}
                                </a>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-blue-600">✉️</span>
                                <a 
                                  href={`mailto:${schedule.personnel_email}`}
                                  className="text-sm text-gray-700 hover:text-[#003366] break-all transition-colors"
                                >
                                  {schedule.personnel_email || 'Tidak tersedia'}
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-white rounded-lg border-2 border-dashed border-gray-300">
                    <span className="text-4xl mb-2 block">🚫</span>
                    <p className="text-sm font-medium text-gray-600">Belum ada petugas terjadwal</p>
                    <p className="text-xs text-gray-500 mt-1">untuk shift ini</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Emergency Contact */}
      <div className="mt-8 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
        <div className="flex items-start gap-3">
          <span className="text-2xl">🚨</span>
          <div>
            <p className="text-sm text-red-900 font-bold">Kontak Darurat</p>
            <p className="text-xs text-red-700 mt-1">
              Untuk situasi darurat, segera hubungi petugas yang berjaga atau hubungi nomor darurat: <span className="font-bold">112</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
