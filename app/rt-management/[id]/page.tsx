"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { showSuccessAlert, showErrorAlert, showConfirmAlert } from '@/lib/swalUtils';
import { rtService } from '@/services/modules/rtService';
import { residentService } from '@/services/modules/residentService';
import { feedbackService } from '@/services/modules/feedbackService';
import { announcementService } from '@/services/modules/announcementService';
import Modal from '@/components/Modal';

type TabType = 'warga' | 'feedback' | 'pengumuman';

export default function RTDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rtId = params.id as string;

  const [activeTab, setActiveTab] = useState<TabType>('warga');
  const [rtData, setRtData] = useState<any>(null);
  const [residents, setResidents] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  // Feedback Response Modal
  const [responseModalOpen, setResponseModalOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<any>(null);
  const [responseText, setResponseText] = useState('');
  
  // Feedback Create Modal
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackFormData, setFeedbackFormData] = useState({
    title: '',
    content: '',
  });
  
  // Announcement Create Modal
  const [announcementModalOpen, setAnnouncementModalOpen] = useState(false);
  const [announcementFormData, setAnnouncementFormData] = useState({
    title: '',
    content: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
  });
  
  // Announcement Detail Modal
  const [announcementDetailModalOpen, setAnnouncementDetailModalOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'rw') {
      showErrorAlert('Akses Ditolak', 'Hanya RW yang dapat mengakses halaman ini');
      router.push('/rt-management');
      return;
    }
    setUser(parsedUser);
    fetchRTData();
    fetchResidents();
    fetchFeedbacks();
    fetchAnnouncements();
  }, [rtId, router]);

  const fetchRTData = async () => {
    try {
      setIsLoading(true);
      const response = await rtService.getById(parseInt(rtId));
      setRtData(response.data || response);
    } catch (error: any) {
      console.error('Error fetching RT data:', error);
      await showErrorAlert('Error', 'Gagal memuat data RT');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchResidents = async () => {
    try {
      const response = await residentService.getAll();
      const allResidents = response.results || response.data || [];
      // Filter residents by RT
      const filteredResidents = allResidents.filter((r: any) => r.rt === parseInt(rtId));
      setResidents(filteredResidents);
    } catch (error: any) {
      console.error('Error fetching residents:', error);
      setResidents([]);
    }
  };

  const fetchFeedbacks = async () => {
    try {
      const response = await feedbackService.getAll();
      const allFeedbacks = response.results || response.data || [];
      // Filter feedbacks by RT (check both rt and rt_id fields)
      const filteredFeedbacks = allFeedbacks.filter((f: any) => 
        f.rt === parseInt(rtId) || f.rt_id === parseInt(rtId)
      );
      setFeedbacks(filteredFeedbacks);
    } catch (error: any) {
      console.error('Error fetching feedbacks:', error);
      setFeedbacks([]);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const response = await announcementService.getAll();
      const allAnnouncements = response.results || response.data || [];
      // Filter announcements by RT (check both rt and rt_id fields)
      const filteredAnnouncements = allAnnouncements.filter((a: any) => 
        a.rt === parseInt(rtId) || a.rt_id === parseInt(rtId)
      );
      setAnnouncements(filteredAnnouncements);
    } catch (error: any) {
      console.error('Error fetching announcements:', error);
      setAnnouncements([]);
    }
  };

  const handleRespondFeedback = async () => {
    if (!responseText.trim()) {
      await showErrorAlert('Validasi', 'Silakan isi respon feedback');
      return;
    }

    try {
      setIsLoading(true);
      await feedbackService.respond(selectedFeedback.id, responseText, user?.name || 'RW');
      await showSuccessAlert('Berhasil', 'Respon feedback berhasil dikirim');
      setResponseModalOpen(false);
      setResponseText('');
      fetchFeedbacks();
    } catch (error: any) {
      console.error('Error responding feedback:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      
      let errorMsg = 'Gagal mengirim respon feedback';
      if (error.response?.data?.error) {
        errorMsg = error.response.data.error;
      } else if (error.response?.data?.detail) {
        errorMsg = error.response.data.detail;
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      await showErrorAlert('Error', errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const openResponseModal = (feedback: any) => {
    setSelectedFeedback(feedback);
    setResponseText(feedback.reply || '');
    setResponseModalOpen(true);
  };

  const handleCreateFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await feedbackService.create({
        ...feedbackFormData,
        author: user?.name || 'RW',
        rating: 5, // Default rating
        rt: parseInt(rtId), // Backend expect 'rt' not 'rt_id'
      } as any);
      
      await showSuccessAlert('Berhasil', 'Feedback berhasil dibuat');
      setFeedbackModalOpen(false);
      setFeedbackFormData({ title: '', content: '' });
      fetchFeedbacks();
    } catch (error: any) {
      console.error('Error creating feedback:', error);
      
      let errorMsg = 'Gagal membuat feedback';
      if (error.response?.data?.error) {
        errorMsg = error.response.data.error;
      } else if (error.response?.data?.detail) {
        errorMsg = error.response.data.detail;
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      await showErrorAlert('Error', errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('Creating announcement for RT:', rtId);
      console.log('User:', user);
      console.log('Announcement data to send:', {
        ...announcementFormData,
        rt_id: parseInt(rtId),
      });
      
      await announcementService.create({
        ...announcementFormData,
        rt_id: parseInt(rtId), // Backend expect 'rt_id' not 'rt'
      } as any);
      
      await showSuccessAlert('Berhasil', 'Pengumuman berhasil dibuat');
      setAnnouncementModalOpen(false);
      setAnnouncementFormData({ title: '', content: '', priority: 'medium' });
      fetchAnnouncements();
    } catch (error: any) {
      console.error('Error creating announcement:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      
      let errorMsg = 'Gagal membuat pengumuman';
      if (error.response?.data?.error) {
        errorMsg = error.response.data.error;
      } else if (error.response?.data?.detail) {
        errorMsg = error.response.data.detail;
      } else if (error.response?.data) {
        // Show all validation errors
        const errors = error.response.data;
        const errorMessages = Object.entries(errors).map(([key, value]) => 
          `${key}: ${Array.isArray(value) ? value.join(', ') : value}`
        ).join('\n');
        errorMsg = errorMessages || errorMsg;
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      await showErrorAlert('Error', errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStars = (rating: number, interactive: boolean = false, onChange?: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <span
            key={i}
            className={`text-2xl ${i < rating ? 'text-yellow-400' : 'text-gray-300'} ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
            onClick={() => interactive && onChange && onChange(i + 1)}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

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

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'rw': return 'RW';
      case 'rt': return 'RT';
      case 'warga': return 'WARGA';
      default: return role || 'Unknown';
    }
  };
  
  const openAnnouncementDetailModal = (announcement: any) => {
    setSelectedAnnouncement(announcement);
    setAnnouncementDetailModalOpen(true);
  };
  
  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'warga':
        return (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[#003366]">Nama</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[#003366]">NIK</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[#003366]">Telepon</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[#003366]">Alamat</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[#003366]">Status</th>
                </tr>
              </thead>
              <tbody>
                {residents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      Belum ada data warga di RT ini
                    </td>
                  </tr>
                ) : (
                  residents.map((resident) => (
                    <tr key={resident.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">{resident.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{resident.nik || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{resident.phone || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{resident.address || '-'}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          resident.status === 'aktif' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {resident.status || 'aktif'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        );

      case 'feedback':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-gray-600">Total {feedbacks.length} feedback</p>
              <button
                onClick={() => {
                  setFeedbackFormData({ title: '', content: '' });
                  setFeedbackModalOpen(true);
                }}
                className="px-4 py-2 bg-[#FF9500] hover:bg-[#FF8C00] text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
              >
                + Buat Feedback
              </button>
            </div>
            {feedbacks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Belum ada feedback untuk RT ini
              </div>
            ) : (
              feedbacks.map((feedback) => {
                const dateTime = formatDateTime(feedback.created_at || feedback.date);
                return (
                <div key={feedback.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">💬</span>
                      <div>
                        <p className="font-semibold text-gray-900">{feedback.title || 'Feedback'}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-sm font-medium text-[#003366]">
                            {feedback.author || feedback.user_name || 'Anonymous'}
                          </p>
                          <span className="text-xs px-2 py-0.5 bg-[#003366] text-white rounded-full">
                            {getRoleLabel(feedback.user_role)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          📅 {dateTime.date} • 🕐 {dateTime.time} WIB
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      feedback.status === 'resolved' 
                        ? 'bg-green-100 text-green-700' 
                        : feedback.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {feedback.status === 'resolved' ? '✓ Selesai' : feedback.status === 'pending' ? '⏳ Pending' : feedback.status}
                    </span>
                  </div>
                  
                  <p className="text-gray-700 mb-3 ml-11">{feedback.content}</p>
                  
                  {feedback.reply && (
                    <div className={`ml-11 border-l-4 p-3 rounded ${
                      feedback.replied_by?.includes('RW') ? 'bg-blue-50 border-blue-500' : 'bg-green-50 border-green-500'
                    }`}>
                      <p className={`text-sm font-medium mb-1 ${
                        feedback.replied_by?.includes('RW') ? 'text-blue-900' : 'text-green-900'
                      }`}>
                        💬 Balasan dari {feedback.replied_by || 'RT'}:
                      </p>
                      <p className={`text-sm ${
                        feedback.replied_by?.includes('RW') ? 'text-blue-800' : 'text-green-800'
                      }`}>{feedback.reply}</p>
                      {feedback.replied_at && (
                        <p className={`text-xs mt-1 ${
                          feedback.replied_by?.includes('RW') ? 'text-blue-600' : 'text-green-600'
                        }`}>
                          {new Date(feedback.replied_at).toLocaleDateString('id-ID', { 
                            day: 'numeric', 
                            month: 'long', 
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      )}
                    </div>
                  )}
                  
                  <div className="ml-11 mt-3 pt-3 border-t border-gray-200">
                    {/* Hierarchy: No reply → RT/RW can reply; RT replied → RT edit or RW override; RW replied → RW edit only */}
                    {(() => {
                      // No reply yet - both RT and RW can reply
                      if (!feedback.reply) return (
                        <button
                          onClick={() => openResponseModal(feedback)}
                          className="text-[#003366] hover:text-[#004d80] font-medium text-sm transition-colors"
                        >
                          💬 Beri Respon
                        </button>
                      );
                      
                      // User is the one who replied - can edit their own reply
                      if (feedback.replied_by === user?.name) return (
                        <button
                          onClick={() => openResponseModal(feedback)}
                          className="text-[#003366] hover:text-[#004d80] font-medium text-sm transition-colors"
                        >
                          ✏️ Edit Respon
                        </button>
                      );
                      
                      // RT replied and user is RW - RW can override (higher authority)
                      if (feedback.replied_by?.includes('RT') && user?.role === 'rw') return (
                        <button
                          onClick={() => openResponseModal(feedback)}
                          className="text-purple-600 hover:text-purple-700 font-medium text-sm transition-colors"
                        >
                          🔄 Override Respon RT
                        </button>
                      );
                      
                      // RW replied - RT cannot override (RW is final authority)
                      if (feedback.replied_by?.includes('RW')) return (
                        <span className="text-blue-600 text-xs font-medium">✓ Sudah direspon oleh RW</span>
                      );
                      
                      // Default: already replied by someone else
                      return (
                        <span className="text-gray-400 text-xs">Sudah direspon oleh {feedback.replied_by}</span>
                      );
                    })()}
                  </div>
                </div>
              );
              })
            )}
          </div>
        );

      case 'pengumuman':
        return (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <p className="text-sm text-gray-600">Total {announcements.length} pengumuman</p>
              <button
                onClick={() => {
                  setAnnouncementFormData({ title: '', content: '', priority: 'medium' });
                  setAnnouncementModalOpen(true);
                }}
                className="w-full sm:w-auto px-4 py-2 bg-[#FF9500] hover:bg-[#FF8C00] text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
              >
                + Buat Pengumuman
              </button>
            </div>
            {announcements.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Belum ada pengumuman untuk RT ini
              </div>
            ) : (
              announcements.map((announcement) => {
                const dateTime = formatDateTime(announcement.created_at || announcement.date);
                return (
                <div key={announcement.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow border-l-4 border-l-[#003366]">
                  <div className="flex flex-col sm:flex-row items-start gap-3 mb-3">
                    <span className="text-2xl">📢</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-base sm:text-lg break-words">{announcement.title}</h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <p className="text-xs sm:text-sm font-medium text-[#003366]">
                          {announcement.author || 'Admin'}
                        </p>
                        <span className="text-xs px-2 py-0.5 bg-[#003366] text-white rounded-full">
                          {getRoleLabel(announcement.user_role)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        📅 {dateTime.date} • 🕐 {dateTime.time} WIB
                      </p>
                    </div>
                    {announcement.priority && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap self-start ${
                        announcement.priority === 'high' 
                          ? 'bg-red-100 text-red-700' 
                          : announcement.priority === 'medium'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {announcement.priority === 'high' ? '🔴 Penting' : announcement.priority === 'medium' ? '🟡 Normal' : '🟢 Rendah'}
                      </span>
                    )}
                  </div>
                  <p className="text-sm sm:text-base text-gray-700 ml-0 sm:ml-11 break-words">
                    {announcement.content.length > 150 ? announcement.content.substring(0, 150) + '...' : announcement.content}
                  </p>
                  {announcement.content.length > 150 && (
                    <div className="ml-0 sm:ml-11 mt-2">
                      <button
                        onClick={() => openAnnouncementDetailModal(announcement)}
                        className="text-[#003366] hover:text-[#004d80] font-medium text-xs sm:text-sm transition-colors"
                      >
                        📖 Baca Selengkapnya
                      </button>
                    </div>
                  )}
                </div>
              );
              })
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (!rtData) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003366] mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data RT...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/rt-management')}
          className="text-[#003366] hover:text-[#004d80] font-medium mb-4 flex items-center gap-2"
        >
          ← Kembali ke Manajemen RT
        </button>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-4xl">👔</span>
            <div>
              <h1 className="text-3xl font-bold text-[#003366]">{rtData.name}</h1>
              <p className="text-gray-600">{rtData.area || 'Area tidak tersedia'}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium text-gray-900">{rtData.user_email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Telepon</p>
              <p className="font-medium text-gray-900">{rtData.phone || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Warga</p>
              <p className="font-medium text-gray-900">{residents.length} warga</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('warga')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'warga'
                  ? 'border-[#003366] text-[#003366]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              👥 Data Warga ({residents.length})
            </button>
            <button
              onClick={() => setActiveTab('feedback')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'feedback'
                  ? 'border-[#003366] text-[#003366]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              💬 Feedback ({feedbacks.length})
            </button>
            <button
              onClick={() => setActiveTab('pengumuman')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'pengumuman'
                  ? 'border-[#003366] text-[#003366]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📢 Pengumuman ({announcements.length})
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {renderTabContent()}
      </div>

      {/* Response Modal */}
      <Modal
        isOpen={responseModalOpen}
        title="Respon Feedback"
        onClose={() => !isLoading && setResponseModalOpen(false)}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tulis Respon Anda *
            </label>
            <textarea
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              placeholder="Tulis respon untuk feedback ini..."
              rows={5}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-transparent bg-gray-50 focus:bg-white transition-all resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleRespondFeedback}
              disabled={isLoading}
              className="flex-1 bg-[#66CC66] hover:bg-[#59B359] disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Mengirim...' : '✓ Kirim Respon'}
            </button>
            <button
              onClick={() => setResponseModalOpen(false)}
              disabled={isLoading}
              className="px-6 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-200 text-gray-800 font-semibold py-2 rounded-lg transition-all disabled:opacity-70"
            >
              Batal
            </button>
          </div>
        </div>
      </Modal>

      {/* Feedback Create Modal */}
      <Modal
        isOpen={feedbackModalOpen}
        title="Buat Feedback untuk RT"
        onClose={() => !isLoading && setFeedbackModalOpen(false)}
        size="md"
      >
        <form onSubmit={handleCreateFeedback} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Judul Feedback *
            </label>
            <input
              type="text"
              value={feedbackFormData.title}
              onChange={(e) => setFeedbackFormData({ ...feedbackFormData, title: e.target.value })}
              placeholder="Contoh: Saran Perbaikan Jalan"
              required
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-transparent bg-gray-50 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Isi Feedback *
            </label>
            <textarea
              value={feedbackFormData.content}
              onChange={(e) => setFeedbackFormData({ ...feedbackFormData, content: e.target.value })}
              placeholder="Tulis feedback Anda di sini..."
              required
              rows={5}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-transparent bg-gray-50 focus:bg-white transition-all resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-[#66CC66] hover:bg-[#59B359] disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
              onClick={() => setFeedbackModalOpen(false)}
              disabled={isLoading}
              className="px-6 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-200 text-gray-800 font-semibold py-2 rounded-lg transition-all disabled:opacity-70"
            >
              Batal
            </button>
          </div>
        </form>
      </Modal>

      {/* Announcement Create Modal */}
      <Modal
        isOpen={announcementModalOpen}
        title="Buat Pengumuman untuk RT"
        onClose={() => !isLoading && setAnnouncementModalOpen(false)}
        size="lg"
      >
        <form onSubmit={handleCreateAnnouncement} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Judul Pengumuman *
            </label>
            <input
              type="text"
              value={announcementFormData.title}
              onChange={(e) => setAnnouncementFormData({ ...announcementFormData, title: e.target.value })}
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
              value={announcementFormData.content}
              onChange={(e) => setAnnouncementFormData({ ...announcementFormData, content: e.target.value })}
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
              value={announcementFormData.priority}
              onChange={(e) => setAnnouncementFormData({ ...announcementFormData, priority: e.target.value as 'high' | 'medium' | 'low' })}
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
              className="flex-1 bg-[#66CC66] hover:bg-[#59B359] disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
              onClick={() => setAnnouncementModalOpen(false)}
              disabled={isLoading}
              className="px-6 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-200 text-gray-800 font-semibold py-2 rounded-lg transition-all disabled:opacity-70"
            >
              Batal
            </button>
          </div>
        </form>
      </Modal>

      {/* Announcement Detail Modal */}
      <Modal
        isOpen={announcementDetailModalOpen}
        title={selectedAnnouncement?.title || 'Detail Pengumuman'}
        onClose={() => setAnnouncementDetailModalOpen(false)}
        size="md"
      >
        {selectedAnnouncement && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <span className="text-3xl sm:text-4xl">{getPriorityIcon(selectedAnnouncement.priority)}</span>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <p className="text-sm sm:text-base font-semibold text-[#003366]">
                    📝 {selectedAnnouncement.author || 'Admin'}
                  </p>
                  {selectedAnnouncement.user_role && (
                    <span className="text-xs px-2 py-1 bg-[#003366] text-white rounded-full">
                      {getRoleLabel(selectedAnnouncement.user_role)}
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">
                  🏘️ RT {rtData?.name || 'RT'}
                </p>
                <p className="text-xs sm:text-sm text-gray-600">
                  📅 {new Date(selectedAnnouncement.created_at || selectedAnnouncement.date).toLocaleDateString('id-ID', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric',
                  })} • 🕐 {new Date(selectedAnnouncement.created_at || selectedAnnouncement.date).toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                  })} WIB
                </p>
              </div>
            </div>
            <div className="px-1">
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-wrap break-words">{selectedAnnouncement.content}</p>
            </div>
            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={() => setAnnouncementDetailModalOpen(false)}
                className="w-full px-4 py-2.5 sm:py-3 bg-[#003366] hover:bg-[#004d80] text-white font-semibold rounded-lg transition-all text-sm sm:text-base"
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
