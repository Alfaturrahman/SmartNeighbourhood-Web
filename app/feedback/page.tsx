"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import Modal from '@/components/Modal';
import { showSuccessAlert, showErrorAlert, showConfirmAlert } from '@/lib/swalUtils';
import { getPermissions, UserRole } from '@/lib/rolePermissions';

const DUMMY_FEEDBACK = [
  { id: 1, author: 'Budi Santoso', title: 'Sistem air mati berkali-kali', content: 'Kami mengalami pemadaman air yang sangat sering, mohon perhatian dari RT.', date: '2024-01-19', rating: 2 },
  { id: 2, author: 'Siti Nurhaliza', title: 'Jalan depan berlubang', content: 'Jalan gang A sudah berlubang besar, berbahaya untuk kendaraan.', date: '2024-01-18', rating: 2 },
  { id: 3, author: 'Ahmad Wijaya', title: 'Lamppu jalan di depan rumah rusak', content: 'Lampu jalan nomor 5 sudah mati selama 2 minggu.', date: '2024-01-17', rating: 3 },
  { id: 4, author: 'Dwi Retno', title: 'Kebersihan area parkir kurang', content: 'Area parkir komunal perlu dibersihkan lebih sering.', date: '2024-01-16', rating: 3 },
];

export default function FeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [userRole, setUserRole] = useState<UserRole>('resident');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    rating: 3,
  });
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    const user = JSON.parse(userData);
    setUserRole(user.role);
    
    const permissions = getPermissions(user.role);
    if (!permissions.canViewFeedback && !permissions.canSubmitFeedback) {
      router.push('/dashboard');
      return;
    }
    
    setFeedbacks(DUMMY_FEEDBACK);
  }, [router]);

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <span key={i} className={`text-lg ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}>
            ★
          </span>
        ))}
      </div>
    );
  };

  const openAddModal = () => {
    const permissions = getPermissions(userRole);
    if (!permissions.canSubmitFeedback) {
      showErrorAlert('Akses Ditolak', 'Anda tidak memiliki izin untuk berikan feedback');
      return;
    }
    setFormData({ title: '', content: '', rating: 3 });
    setModalOpen(true);
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(async () => {
      const newFeedback = {
        id: Math.max(...feedbacks.map(f => f.id), 0) + 1,
        author: 'Anda',
        title: formData.title,
        content: formData.content,
        rating: formData.rating,
        date: new Date().toISOString().split('T')[0],
      };
      setFeedbacks([newFeedback, ...feedbacks]);
      setIsLoading(false);
      setModalOpen(false);
      await showSuccessAlert('Berhasil!', 'Feedback Anda telah dikirim');
    }, 600);
  };

  const openReplyModal = (feedback: any) => {
    const permissions = getPermissions(userRole);
    if (!permissions.canManageFeedback) {
      showErrorAlert('Akses Ditolak', 'Anda tidak memiliki izin untuk membalas feedback');
      return;
    }
    setSelectedFeedback(feedback);
    setReplyText('');
    setReplyModalOpen(true);
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(async () => {
      setIsLoading(false);
      setReplyModalOpen(false);
      setReplyText('');
      await showSuccessAlert('Berhasil!', 'Balasan Anda telah dikirim kepada warga');
    }, 600);
  };

  const handleDelete = async (feedback: any) => {
    const permissions = getPermissions(userRole);
    if (!permissions.canManageFeedback) {
      await showErrorAlert('Akses Ditolak', 'Anda tidak memiliki izin untuk menghapus feedback');
      return;
    }
    
    const result = await showConfirmAlert(
      'Hapus Feedback',
      `Apakah Anda yakin ingin menghapus feedback dari ${feedback.author}?`,
      'Ya, Hapus'
    );

    if (result.isConfirmed) {
      setIsLoading(true);
      setTimeout(() => {
        setFeedbacks(feedbacks.filter(f => f.id !== feedback.id));
        setIsLoading(false);
        showSuccessAlert('Berhasil!', 'Feedback telah dihapus');
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
                <h2 className="text-3xl font-bold text-[#003366]">Feedback & Umpan Balik</h2>
                <p className="text-gray-600 mt-1">Kelola feedback dari warga komunitas</p>
              </div>
              {getPermissions(userRole).canSubmitFeedback && (
                <button onClick={openAddModal} className="px-4 py-3 bg-[#FF9500] hover:bg-[#FF8C00] text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95">
                  + Berikan Feedback
                </button>
              )}
            </div>

            {/* Feedback List */}
            <div className="space-y-4">
              {feedbacks.map((fb) => (
                <div key={fb.id} className="bg-white rounded-xl shadow-sm border-l-4 border-l-[#FF9500] border border-gray-200 hover:shadow-md transition-shadow p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-[#003366]">{fb.title}</h3>
                      <div className="flex items-center gap-3 mt-2">
                        <p className="text-sm text-gray-600">👤 {fb.author}</p>
                        <span className="text-gray-300">•</span>
                        <p className="text-sm text-gray-600">📅 {fb.date}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {renderStars(fb.rating)}
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-4 leading-relaxed">{fb.content}</p>
                  
                  <div className="flex gap-2 pt-4 border-t border-gray-100">
                    {getPermissions(userRole).canManageFeedback ? (
                      <>
                        <button onClick={() => openReplyModal(fb)} className="text-[#003366] hover:text-[#004d80] font-medium text-sm transition-colors">💬 Balas</button>
                        <span className="text-gray-300">•</span>
                        <button onClick={() => handleDelete(fb)} className="text-[#EF4444] hover:text-[#DC2626] font-medium text-sm transition-colors">🗑️ Hapus</button>
                      </>
                    ) : (
                      <span className="text-gray-400 text-xs">Hanya lihat</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* Reply Modal */}
      <Modal
        isOpen={replyModalOpen}
        title="Balas Feedback"
        onClose={() => !isLoading && setReplyModalOpen(false)}
        size="md"
      >
        <form onSubmit={handleReplySubmit} className="space-y-4">
          {selectedFeedback && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
              <p className="text-sm text-gray-700"><span className="font-semibold">Feedback dari:</span> {selectedFeedback.author}</p>
              <p className="text-sm text-gray-600 mt-2">{selectedFeedback.content}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Balasan *
            </label>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Tulis balasan Anda di sini..."
              required
              rows={5}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-transparent bg-gray-50 focus:bg-white transition-all resize-none"
            />
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
                  Mengirim...
                </>
              ) : (
                '✓ Kirim Balasan'
              )}
            </button>
            <button
              type="button"
              onClick={() => setReplyModalOpen(false)}
              disabled={isLoading}
              className="px-6 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-200 text-gray-800 font-semibold py-2 rounded-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              Batal
            </button>
          </div>
        </form>
      </Modal>

      {/* Feedback Form Modal */}
      <Modal
        isOpen={modalOpen}
        title="Berikan Feedback"
        onClose={() => !isLoading && setModalOpen(false)}
        size="md"
      >
        <form onSubmit={handleSubmitFeedback} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Judul *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Judul feedback Anda"
              required
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-transparent bg-gray-50 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Deskripsi *
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Jelaskan feedback Anda dengan detail..."
              required
              rows={4}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-transparent bg-gray-50 focus:bg-white transition-all resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Rating (1-5 bintang)
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormData({ ...formData, rating: star })}
                  className={`text-3xl transition-all ${
                    star <= formData.rating ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
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
                  Mengirim...
                </>
              ) : (
                '✓ Kirim Feedback'
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
    </div>
  );
}
