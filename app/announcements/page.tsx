"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import Modal from '@/components/Modal';
import { showSuccessAlert, showErrorAlert, showConfirmAlert } from '@/lib/swalUtils';
import { getPermissions, UserRole } from '@/lib/rolePermissions';

const DUMMY_ANNOUNCEMENTS = [
  { 
    id: 1, 
    title: 'Pengumuman Pemeliharaan Jalan', 
    content: 'Pemeliharaan jalan akan dilakukan pada tanggal 22-23 Januari 2024. Mohon pengertian atas ketidaknyamanan yang ditimbulkan.',
    author: 'RT 01',
    date: '2024-01-19',
    priority: 'high'
  },
  { 
    id: 2, 
    title: 'Penerimaan Iuran Bulanan', 
    content: 'Pengumpulan iuran bulanan untuk bulan Januari dibuka hingga tanggal 25 Januari. Silakan hubungi ketua RT untuk pembayaran.',
    author: 'RW 02',
    date: '2024-01-18',
    priority: 'medium'
  },
  { 
    id: 3, 
    title: 'Arisan Bulanan Komunitas', 
    content: 'Undian arisan bulanan akan dilaksanakan hari Minggu, 21 Januari 2024 di balai warga.',
    author: 'RT 01',
    date: '2024-01-17',
    priority: 'low'
  },
  { 
    id: 4, 
    title: 'Pembersihan Lingkungan Bersama', 
    content: 'Jadwal pembersihan lingkungan bersama akan dilakukan setiap hari Minggu pukul 07:00 pagi. Partisipasi diharapkan dari semua warga.',
    author: 'RT 01',
    date: '2024-01-16',
    priority: 'medium'
  },
];

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<UserRole>('resident');
  const [modalOpen, setModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'medium',
  });
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    setUserRole(parsedUser.role);
    
    const permissions = getPermissions(parsedUser.role);
    if (!permissions.canViewAnnouncements) {
      router.push('/dashboard');
      return;
    }
    
    setAnnouncements(DUMMY_ANNOUNCEMENTS);
  }, [router]);

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-50 border-red-200';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200';
      case 'low':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getPriorityBorderColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-[#EF4444]';
      case 'medium':
        return 'border-l-[#FCD34D]';
      case 'low':
        return 'border-l-[#66CC66]';
      default:
        return 'border-l-[#003366]';
    }
  };

  const openDetailModal = (announcement: any) => {
    setSelectedAnnouncement(announcement);
    setDetailModalOpen(true);
  };

  const openAddModal = () => {
    const permissions = getPermissions(userRole);
    if (!permissions.canManageAnnouncements) {
      showErrorAlert('Akses Ditolak', 'Hanya admin yang dapat membuat pengumuman');
      return;
    }
    setEditingId(null);
    setFormData({ title: '', content: '', priority: 'medium' });
    setModalOpen(true);
  };

  const openEditModal = (announcement: any) => {
    const permissions = getPermissions(userRole);
    if (!permissions.canManageAnnouncements) {
      showErrorAlert('Akses Ditolak', 'Hanya admin yang dapat mengedit pengumuman');
      return;
    }
    setEditingId(announcement.id);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      priority: announcement.priority,
    });
    setModalOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    const permissions = getPermissions(userRole);
    if (!permissions.canManageAnnouncements) {
      await showErrorAlert('Akses Ditolak', 'Anda tidak memiliki izin untuk mengelola pengumuman');
      return;
    }
    
    setIsLoading(true);

    setTimeout(async () => {
      if (editingId) {
        const updatedAnnouncements = announcements.map(a =>
          a.id === editingId ? { ...a, ...formData, date: new Date().toISOString().split('T')[0] } : a
        );
        setAnnouncements(updatedAnnouncements);
        setIsLoading(false);
        setModalOpen(false);
        await showSuccessAlert('Berhasil!', 'Pengumuman berhasil diperbarui');
      } else {
        const newAnnouncement = {
          id: Math.max(...announcements.map(a => a.id), 0) + 1,
          ...formData,
          author: user?.email?.split('@')[0] || 'Admin',
          date: new Date().toISOString().split('T')[0],
        };
        setAnnouncements([newAnnouncement, ...announcements]);
        setIsLoading(false);
        setModalOpen(false);
        await showSuccessAlert('Berhasil!', 'Pengumuman baru berhasil dibuat');
      }
    }, 600);
  };

  const handleDelete = async (announcement: any) => {
    const permissions = getPermissions(userRole);
    if (!permissions.canManageAnnouncements) {
      await showErrorAlert('Akses Ditolak', 'Anda tidak memiliki izin untuk menghapus pengumuman');
      return;
    }
    
    const result = await showConfirmAlert(
      'Hapus Pengumuman',
      `Apakah Anda yakin ingin menghapus pengumuman "${announcement.title}"?`,
      'Ya, Hapus'
    );

    if (result.isConfirmed) {
      setIsLoading(true);
      setTimeout(() => {
        setAnnouncements(announcements.filter(a => a.id !== announcement.id));
        setIsLoading(false);
        showSuccessAlert('Berhasil!', 'Pengumuman telah dihapus');
      }, 600);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#F5F5F5]">
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-auto">
          <div className="p-8 max-w-4xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-[#003366]">Pengumuman</h2>
                <p className="text-gray-600 mt-1">Berbagi informasi penting dengan seluruh warga</p>
              </div>
              {getPermissions(userRole).canManageAnnouncements && (
                <button onClick={openAddModal} className="px-4 py-3 bg-[#FF9500] hover:bg-[#FF8C00] text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95">
                  + Buat Pengumuman
                </button>
              )}
            </div>

            {/* Announcements List */}
            <div className="space-y-4">
              {announcements.map((ann) => (
                <div key={ann.id} className={`rounded-xl border-l-4 shadow-sm hover:shadow-md transition-shadow p-6 border ${getPriorityBorderColor(ann.priority)} ${getPriorityColor(ann.priority)}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-4 flex-1">
                      <span className="text-2xl">{getPriorityIcon(ann.priority)}</span>
                      <div>
                        <h3 className="text-lg font-semibold text-[#003366]">{ann.title}</h3>
                        <div className="flex items-center gap-3 mt-1">
                          <p className="text-sm text-gray-600">📝 {ann.author}</p>
                          <span className="text-gray-300">•</span>
                          <p className="text-sm text-gray-600">📅 {ann.date}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-4 leading-relaxed ml-10">{ann.content}</p>
                  
                  <div className="flex gap-2 pt-4 border-t border-gray-300/50 ml-10">
                    <button onClick={() => openDetailModal(ann)} className="text-[#003366] hover:text-[#004d80] font-medium text-sm transition-colors">📖 Baca Selengkapnya</button>
                    {getPermissions(userRole).canManageAnnouncements && (
                      <>
                        <span className="text-gray-300">•</span>
                        <button onClick={() => openEditModal(ann)} className="text-[#003366] hover:text-[#004d80] font-medium text-sm transition-colors">✏️ Edit</button>
                        <span className="text-gray-300">•</span>
                        <button onClick={() => handleDelete(ann)} className="text-[#EF4444] hover:text-[#DC2626] font-medium text-sm transition-colors">🗑️ Hapus</button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* Modal Form */}
      <Modal
        isOpen={modalOpen}
        title={editingId ? 'Edit Pengumuman' : 'Buat Pengumuman Baru'}
        onClose={() => !isLoading && setModalOpen(false)}
        size="lg"
      >
        <form onSubmit={handleSubmitForm} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Judul Pengumuman *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Contoh: Pengumuman Pemeliharaan Jalan"
              required
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-transparent bg-gray-50 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Isi Pengumuman *
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Tuliskan isi pengumuman di sini..."
              required
              rows={5}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-transparent bg-gray-50 focus:bg-white transition-all resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Prioritas
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-transparent bg-gray-50 focus:bg-white transition-all"
            >
              <option value="low">🟢 Rendah</option>
              <option value="medium">🟡 Normal</option>
              <option value="high">🔴 Tinggi/Penting</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-[#66CC66] hover:bg-[#59B359] disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg transition-all transform hover:scale-105 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
              onClick={() => setModalOpen(false)}
              disabled={isLoading}
              className="px-6 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-200 text-gray-800 font-semibold py-2 rounded-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              Batal
            </button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={detailModalOpen}
        title={selectedAnnouncement?.title || 'Detail Pengumuman'}
        onClose={() => setDetailModalOpen(false)}
        size="md"
      >
        {selectedAnnouncement && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">{getPriorityIcon(selectedAnnouncement.priority)}</span>
              <div>
                <p className="text-sm text-gray-600">📝 {selectedAnnouncement.author}</p>
                <p className="text-sm text-gray-600">📅 {selectedAnnouncement.date}</p>
              </div>
            </div>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedAnnouncement.content}</p>
            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={() => setDetailModalOpen(false)}
                className="w-full px-4 py-2 bg-[#003366] hover:bg-[#004d80] text-white font-semibold rounded-lg transition-all"
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
