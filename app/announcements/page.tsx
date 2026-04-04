"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Modal from '@/components/Modal';
import { showSuccessAlert, showErrorAlert, showConfirmAlert } from '@/lib/swalUtils';
import { getPermissions, UserRole } from '@/lib/rolePermissions';
import { announcementService } from '@/services/modules/announcementService';
import { rtService } from '@/services/modules/rtService';
import type { Announcement } from '@/types';

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [rts, setRts] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<UserRole>('warga');
  const [isMounted, setIsMounted] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<{
    title: string;
    content: string;
    author: string;
    priority: 'high' | 'medium' | 'low';
    rt_id?: number;
  }>({
    title: '',
    content: '',
    author: '',
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
    
    setIsMounted(true);
    fetchAnnouncements();
    if (parsedUser.role === 'rw') {
      fetchRTs();
    }
  }, [router]);

  const fetchAnnouncements = async () => {
    try {
      setIsLoading(true);
      const response = await announcementService.getAll();
      const data = (response.results || response.data || []) as Announcement[];
      setAnnouncements(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Error fetching announcements:', error);
      await showErrorAlert('Error', 'Gagal memuat data pengumuman');
      setAnnouncements([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRTs = async () => {
    try {
      const response = await rtService.getAll();
      const data = (response.results || response.data || []) as any[];
      setRts(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Error fetching RTs:', error);
      setRts([]);
    }
  };

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
      showErrorAlert('Akses Ditolak', 'Anda tidak dapat membuat pengumuman');
      return;
    }
    setEditingId(null);
    const newFormData: any = { title: '', content: '', author: user?.name || '', priority: 'medium' };
    if (userRole === 'rw' && rts.length > 0) {
      newFormData.rt_id = rts[0].id;
    }
    setFormData(newFormData);
    setModalOpen(true);
  };

  const openEditModal = (announcement: any) => {
    const permissions = getPermissions(userRole);
    if (!permissions.canManageAnnouncements) {
      showErrorAlert('Akses Ditolak', 'Anda tidak dapat mengedit pengumuman');
      return;
    }
    setEditingId(announcement.id);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      author: announcement.author || user?.name || '',
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

    try {
      if (editingId) {
        await announcementService.update(editingId, formData);
        await showSuccessAlert('Berhasil!', 'Pengumuman berhasil diperbarui');
      } else {
        const dataToSend = userRole === 'rw' && formData.rt_id 
          ? { ...formData, rt_id: formData.rt_id }
          : formData;
        await announcementService.create(dataToSend);
        await showSuccessAlert('Berhasil!', 'Pengumuman baru berhasil dibuat');
      }
      setModalOpen(false);
      fetchAnnouncements();
    } catch (error: any) {
      console.error('Error saving announcement:', error);
      await showErrorAlert('Error', error.response?.data?.error || 'Gagal menyimpan pengumuman');
    } finally {
      setIsLoading(false);
    }
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
      try {
        await announcementService.delete(announcement.id);
        await showSuccessAlert('Berhasil!', 'Pengumuman telah dihapus');
        fetchAnnouncements();
      } catch (error: any) {
        console.error('Error deleting announcement:', error);
        await showErrorAlert('Error', error.response?.data?.error || 'Gagal menghapus pengumuman');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-[#003366]">Pengumuman</h2>
          <p className="text-gray-600 mt-1 text-sm md:text-base">Berbagi informasi penting dengan seluruh warga</p>
        </div>
        {isMounted && userRole !== 'warga' && (
          <button onClick={openAddModal} className="w-full sm:w-auto px-4 py-3 bg-[#FF9500] hover:bg-[#FF8C00] text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95">
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
                    <p className="text-sm text-gray-600">📝 {ann.rt_name}</p>
                    <span className="text-gray-300">•</span>
                    <p className="text-sm text-gray-600">📅 {ann.date}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <p className="text-gray-700 mb-4 leading-relaxed ml-10">{ann.content}</p>
            
            <div className="flex gap-2 pt-4 border-t border-gray-300/50 ml-10">
              <button onClick={() => openDetailModal(ann)} className="text-[#003366] hover:text-[#004d80] font-medium text-sm transition-colors">📖 Baca Selengkapnya</button>
              {isMounted && userRole !== 'warga' && (
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
            {/* <label className="block text-sm font-semibold text-gray-900 mb-2">
              Nama Pembuat *
            </label> */}
            <input
              type="hidden"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              placeholder="Nama Anda"
              required
              disabled
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-transparent bg-gray-50 focus:bg-white transition-all"
            />
          </div>

          {userRole === 'rw' && (
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Pengumuman untuk RT *
              </label>
              {rts.length === 0 ? (
                <div className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-orange-50 text-orange-700 text-sm">
                  ⚠️ Tidak ada RT yang tersedia
                </div>
              ) : (
                <select
                  value={formData.rt_id || ''}
                  onChange={(e) => setFormData({ ...formData, rt_id: parseInt(e.target.value) })}
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-transparent bg-gray-50 focus:bg-white transition-all"
                >
                  <option value="">Pilih RT</option>
                  {rts.map((rt: any) => (
                    <option key={rt.id} value={rt.id}>
                      {rt.name} ({rt.area || 'Area Umum'})
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

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
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'high' | 'medium' | 'low' })}
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
