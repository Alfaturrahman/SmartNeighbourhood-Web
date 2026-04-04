"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Modal from '@/components/Modal';
import { showSuccessAlert, showErrorAlert, showConfirmAlert } from '@/lib/swalUtils';
import { getPermissions, UserRole } from '@/lib/rolePermissions';
import { feedbackService } from '@/services/modules/feedbackService';
import type { Feedback } from '@/types';

export default function FeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>('warga');
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
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
    if (!permissions.canViewFeedback && !permissions.canSubmitFeedback) {
      router.push('/dashboard');
      return;
    }
    
    setIsMounted(true);
    fetchFeedbacks();
  }, [router]);

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const dateOptions: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    const timeOptions: Intl.DateTimeFormatOptions = { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    };
    return {
      date: date.toLocaleDateString('id-ID', dateOptions),
      time: date.toLocaleTimeString('id-ID', timeOptions)
    };
  };

  const fetchFeedbacks = async () => {
    try {
      setIsLoading(true);
      const response = await feedbackService.getAll();
      console.log('Feedback API Response:', response);
      const data = (response.results || response.data || []) as Feedback[];
      console.log('Feedback data:', data);
      setFeedbacks(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Error fetching feedbacks:', error);
      await showErrorAlert('Error', 'Gagal memuat data feedback');
      setFeedbacks([]);
    } finally {
      setIsLoading(false);
    }
  };

  const openAddModal = () => {
    const permissions = getPermissions(userRole);
    if (!permissions.canSubmitFeedback) {
      showErrorAlert('Akses Ditolak', 'Anda tidak memiliki izin untuk berikan feedback');
      return;
    }
    setFormData({ title: '', content: '' });
    setModalOpen(true);
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await feedbackService.create({
        ...formData,
        author: user?.name || 'User',
      } as any);
      await showSuccessAlert('Berhasil!', 'Feedback Anda telah dikirim');
      setModalOpen(false);
      setFormData({ title: '', content: '' });
      fetchFeedbacks();
    } catch (error: any) {
      console.error('Error submitting feedback:', error);
      await showErrorAlert('Error', error.response?.data?.error || 'Gagal mengirim feedback');
    } finally {
      setIsLoading(false);
    }
  };

  const openReplyModal = (feedback: any) => {
    const permissions = getPermissions(userRole);
    if (!permissions.canManageFeedback) {
      showErrorAlert('Akses Ditolak', 'Anda tidak memiliki izin untuk membalas feedback');
      return;
    }
    setSelectedFeedback(feedback);
    setReplyText(feedback.reply || ''); // Pre-fill existing reply for edit mode
    setReplyModalOpen(true);
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (selectedFeedback) {
        console.log('Sending reply to feedback:', selectedFeedback.id);
        console.log('Reply text:', replyText);
        console.log('Replied by:', user?.name);
        await feedbackService.reply(selectedFeedback.id, replyText, user?.name || 'RT');
        await showSuccessAlert('Berhasil!', 'Balasan Anda telah dikirim kepada warga');
        setReplyModalOpen(false);
        setReplyText('');
        fetchFeedbacks();
      }
    } catch (error: any) {
      console.error('Error replying to feedback:', error);
      console.error('Error response:', error.response);
      await showErrorAlert('Error', error.response?.data?.error || error.response?.data?.detail || 'Gagal mengirim balasan');
    } finally {
      setIsLoading(false);
    }
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
      try {
        await feedbackService.delete(feedback.id);
        await showSuccessAlert('Berhasil!', 'Feedback telah dihapus');
        fetchFeedbacks();
      } catch (error: any) {
        console.error('Error deleting feedback:', error);
        await showErrorAlert('Error', error.response?.data?.error || 'Gagal menghapus feedback');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-[#003366]">Feedback & Umpan Balik</h2>
          <p className="text-gray-600 mt-1 text-sm md:text-base">Kelola feedback dari warga komunitas</p>
        </div>
        {isMounted && userRole && (
          <button onClick={openAddModal} className="w-full sm:w-auto px-4 py-3 bg-[#FF9500] hover:bg-[#FF8C00] text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95">
            + Berikan Feedback
          </button>
        )}
      </div>

      {/* Feedback List */}
      <div className="space-y-4">
              {feedbacks.map((fb) => {
                console.log('Rendering feedback:', fb.id, 'Reply:', fb.reply, 'Replied_by:', fb.replied_by);
                const dateTime = formatDateTime(fb.created_at || fb.date);
                return (
                <div key={fb.id} className="bg-white rounded-xl shadow-sm border-l-4 border-l-[#FF9500] border border-gray-200 hover:shadow-md transition-shadow p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-[#003366]">{fb.title}</h3>
                      <div className="flex items-center gap-2 mt-2">
                        <p className="text-sm font-medium text-[#003366]">👤 {fb.author}</p>
                        <span className="text-gray-300">•</span>
                        <p className="text-xs text-gray-500">📅 {dateTime.date} • 🕐 {dateTime.time} WIB</p>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-4 leading-relaxed">{fb.content}</p>
                  
                  {/* Reply Section */}
                  {fb.reply && (
                    <div className={`mt-4 border-l-4 p-4 rounded-r-lg ${
                      fb.replied_by?.includes('RW') ? 'bg-blue-50 border-blue-500' : 'bg-green-50 border-green-500'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`font-medium text-sm ${
                          fb.replied_by?.includes('RW') ? 'text-blue-900' : 'text-green-900'
                        }`}>
                          💬 Balasan dari {fb.replied_by || 'RT'}
                        </span>
                        {fb.replied_at && (
                          <>
                            <span className="text-gray-400">•</span>
                            <span className={`text-xs ${
                              fb.replied_by?.includes('RW') ? 'text-blue-600' : 'text-green-600'
                            }`}>
                              {new Date(fb.replied_at).toLocaleDateString('id-ID', { 
                                day: 'numeric', 
                                month: 'long', 
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </>
                        )}
                      </div>
                      <p className={`text-sm ${
                        fb.replied_by?.includes('RW') ? 'text-blue-800' : 'text-green-800'
                      }`}>{fb.reply}</p>
                    </div>
                  )}
                  
                  <div className="flex gap-2 pt-4 border-t border-gray-100">
                    {isMounted && (
                      <>
                        {/* RT and RW can reply to feedback */}
                        {userRole !== 'warga' && (
                          <>
                            {/* Hierarchy: No reply → RT/RW can reply; RT replied → RT edit or RW override; RW replied → RW edit only */}
                            {(() => {
                              // No reply yet - both RT and RW can reply
                              if (!fb.reply) return (
                                <>
                                  <button 
                                    onClick={() => openReplyModal(fb)} 
                                    className="text-[#003366] hover:text-[#004d80] font-medium text-sm transition-colors"
                                  >
                                    💬 Balas
                                  </button>
                                  <span className="text-gray-300">•</span>
                                </>
                              );
                              
                              // User is the one who replied - can edit their own reply
                              if (fb.replied_by === user?.name) return (
                                <>
                                  <button 
                                    onClick={() => openReplyModal(fb)} 
                                    className="text-[#003366] hover:text-[#004d80] font-medium text-sm transition-colors"
                                  >
                                    ✏️ Edit Balasan
                                  </button>
                                  <span className="text-gray-300">•</span>
                                </>
                              );
                              
                              // RT replied and user is RW - RW can override (higher authority)
                              if (fb.replied_by?.includes('RT') && user?.role === 'rw') return (
                                <>
                                  <button 
                                    onClick={() => openReplyModal(fb)} 
                                    className="text-purple-600 hover:text-purple-700 font-medium text-sm transition-colors"
                                  >
                                    🔄 Override Balasan RT
                                  </button>
                                  <span className="text-gray-300">•</span>
                                </>
                              );
                              
                              // RW replied - RT cannot override (RW is final authority)
                              if (fb.replied_by?.includes('RW')) return (
                                <>
                                  <span className="text-blue-600 text-xs font-medium">✓ Sudah direspon oleh RW</span>
                                  <span className="text-gray-300">•</span>
                                </>
                              );
                              
                              // Default: already replied by someone else
                              return (
                                <>
                                  <span className="text-gray-400 text-xs">Sudah dibalas oleh {fb.replied_by}</span>
                                  <span className="text-gray-300">•</span>
                                </>
                              );
                            })()}
                          </>
                        )}
                        
                        {/* Everyone can delete their own feedback */}
                        {fb.author === user?.name && (
                          <button onClick={() => handleDelete(fb)} className="text-[#EF4444] hover:text-[#DC2626] font-medium text-sm transition-colors">🗑️ Hapus</button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
              })}
            </div>

      {/* Reply Modal */}
      <Modal
        isOpen={replyModalOpen}
        title={selectedFeedback?.reply ? "Edit Balasan Feedback" : "Balas Feedback"}
        onClose={() => !isLoading && setReplyModalOpen(false)}
        size="md"
      >
        <form onSubmit={handleReplySubmit} className="space-y-4">
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

          {/* <div>
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
          </div> */}

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
