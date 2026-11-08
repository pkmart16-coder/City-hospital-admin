import React, { useState } from 'react';
import { 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  Edit2, 
  Eye, 
  Globe, 
  AlertCircle, 
  Calendar, 
  CheckCircle, 
  XCircle,
  ExternalLink
} from 'lucide-react';
import { useHospital } from '../context/HospitalContext';
import { useAuth } from '../context/AuthContext';
import { BannerItem, AnnouncementItem } from '../types';
import { formatDate } from '../utils/formatters';
import { BannerModal } from '../components/cms/BannerModal';
import { Modal } from '../components/common/Modal';

export const CmsPage: React.FC = () => {
  const { banners, announcements, deleteBanner, deleteAnnouncement, saveAnnouncement, settings, updateSettings } = useHospital();
  const { hasPermission } = useAuth();

  const [activeTab, setActiveTab] = useState<'banners' | 'announcements' | 'preview'>('banners');
  const [selectedBanner, setSelectedBanner] = useState<BannerItem | null>(null);
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);

  // Announcement modal
  const [isAnnounceModalOpen, setIsAnnounceModalOpen] = useState(false);
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annType, setAnnType] = useState<AnnouncementItem['type']>('Notice');

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim()) return;
    await saveAnnouncement({
      title: annTitle.trim(),
      content: annContent.trim(),
      type: annType,
      isActive: true,
      publishedDate: new Date().toISOString().slice(0, 10),
      targetAudience: 'All Patients'
    });
    setAnnTitle('');
    setAnnContent('');
    setIsAnnounceModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Website Content & Banner Management (CMS)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Configure homepage hero sliders, promotional popup banners, and urgent clinical announcements
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {activeTab === 'banners' && hasPermission('banners.manage') && (
            <button
              onClick={() => {
                setSelectedBanner(null);
                setIsBannerModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Banner Slider
            </button>
          )}

          {activeTab === 'announcements' && (
            <button
              onClick={() => setIsAnnounceModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              Publish Announcement
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-6 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('banners')}
          className={`pb-3 flex items-center gap-2 transition-colors ${
            activeTab === 'banners'
              ? 'text-teal-600 dark:text-teal-400 border-b-2 border-teal-600'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Promotional Banners ({banners.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('announcements')}
          className={`pb-3 flex items-center gap-2 transition-colors ${
            activeTab === 'announcements'
              ? 'text-teal-600 dark:text-teal-400 border-b-2 border-teal-600'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <AlertCircle className="w-4 h-4" />
          <span>Patient Alerts & Notices ({announcements.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('preview')}
          className={`pb-3 flex items-center gap-2 transition-colors ${
            activeTab === 'preview'
              ? 'text-teal-600 dark:text-teal-400 border-b-2 border-teal-600'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Live Public Website Preview</span>
        </button>
      </div>

      {/* Tab 1: Banners List */}
      {activeTab === 'banners' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {banners.map((b) => (
            <div
              key={b.id}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs flex flex-col"
            >
              <div className="relative h-44 bg-slate-950 overflow-hidden">
                <img
                  src={b.imageUrl}
                  alt={b.title}
                  className="w-full h-full object-cover opacity-85"
                />
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-900/80 text-white uppercase tracking-wider backdrop-blur-xs">
                    {b.placement}
                  </span>
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded text-white ${b.isActive ? 'bg-emerald-600' : 'bg-slate-600'}`}>
                    {b.isActive ? 'Active' : 'Draft'}
                  </span>
                </div>
                <div className="absolute bottom-3 right-3 text-white text-[11px] font-mono bg-slate-950/70 px-2 py-0.5 rounded">
                  Priority: #{b.priority}
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">{b.title}</h3>
                  {b.subtitle && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {b.subtitle}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span>Valid: {formatDate(b.startDate)} to {formatDate(b.expiryDate)}</span>
                  <span className="font-semibold text-teal-600">CTA: "{b.ctaText}"</span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => {
                      setSelectedBanner(b);
                      setIsBannerModalOpen(true);
                    }}
                    className="p-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex items-center gap-1"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => deleteBanner(b.id)}
                    className="p-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Announcements */}
      {activeTab === 'announcements' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase text-[10px]">
                  <th className="py-3 px-4 font-semibold">Title</th>
                  <th className="py-3 px-4 font-semibold">Category</th>
                  <th className="py-3 px-4 font-semibold">Content</th>
                  <th className="py-3 px-4 font-semibold">Published</th>
                  <th className="py-3 px-4 font-semibold">Target</th>
                  <th className="py-3 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {announcements.map((an) => (
                  <tr key={an.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      {an.title}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-teal-50 text-teal-800 border border-teal-200">
                        {an.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300 max-w-sm">
                      {an.content}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">
                      {formatDate(an.publishedDate)}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      {an.targetAudience}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => deleteAnnouncement(an.id)}
                        className="text-xs text-rose-600 hover:text-rose-700 font-semibold"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Public Website Live Mirror Preview */}
      {activeTab === 'preview' && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between">
            <span>
              Live render of homepage hero section as synchronized from Firestore settings and banners.
            </span>
            <span className="font-mono text-teal-700 dark:text-teal-400 font-bold">
              Shared Firestore Schema: Synchronized
            </span>
          </div>

          {/* Interactive Public Site Simulation Card */}
          <div className="rounded-2xl border-4 border-slate-900 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden shadow-2xl">
            {/* Fake Browser Bar */}
            <div className="bg-slate-900 px-4 py-2.5 flex items-center gap-3 text-xs text-slate-400">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
              </div>
              <div className="flex-1 bg-slate-800 rounded px-3 py-1 font-mono text-[11px] text-slate-300 flex items-center justify-between">
                <span>https://cityhospital.pk</span>
                <span className="text-[10px] text-teal-400">SSL Secure</span>
              </div>
            </div>

            {/* Simulated Hero Section */}
            <div className="relative min-h-[380px] bg-slate-900 flex items-center">
              {banners[0] && (
                <img
                  src={banners[0].imageUrl}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover opacity-40"
                />
              )}
              <div className="relative z-10 p-8 md:p-12 max-w-2xl text-white space-y-4">
                <div className="inline-block px-3 py-1 bg-teal-500 text-slate-950 font-bold text-xs uppercase tracking-wider rounded">
                  {settings.hospitalName}
                </div>
                <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
                  {banners[0]?.title || settings.tagline}
                </h2>
                <p className="text-sm text-slate-200 leading-relaxed">
                  {banners[0]?.subtitle || 'Compassionate clinical excellence with 24/7 cardiac, neurological and pediatric trauma response in Islamabad.'}
                </p>
                <div className="pt-2 flex gap-3">
                  <span className="px-5 py-2.5 bg-teal-500 text-slate-950 font-bold text-xs rounded-lg shadow-lg">
                    {banners[0]?.ctaText || 'Book Appointment'}
                  </span>
                  <span className="px-5 py-2.5 bg-white/20 text-white font-semibold text-xs rounded-lg backdrop-blur-xs">
                    Emergency: {settings.emergencyHotline}
                  </span>
                </div>
              </div>
            </div>

            {/* Public Announcements Bar */}
            {announcements.length > 0 && (
              <div className="bg-amber-50 dark:bg-amber-950/60 p-3 px-6 border-t border-amber-200 text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="font-bold">Public Notice:</span>
                <span>{announcements[0]?.content}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Banner Modal */}
      <BannerModal
        banner={selectedBanner}
        isOpen={isBannerModalOpen}
        onClose={() => setIsBannerModalOpen(false)}
      />

      {/* Announcement Modal */}
      <Modal
        isOpen={isAnnounceModalOpen}
        onClose={() => setIsAnnounceModalOpen(false)}
        title="Publish Patient Announcement / Alert"
        maxWidth="md"
      >
        <form onSubmit={handleCreateAnnouncement} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={annTitle}
              onChange={(e) => setAnnTitle(e.target.value)}
              placeholder="e.g. Dengue Fever OPD Clinic Update"
              className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 p-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Notice Type
            </label>
            <select
              value={annType}
              onChange={(e) => setAnnType(e.target.value as AnnouncementItem['type'])}
              className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 p-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="Notice">General Public Notice</option>
              <option value="Health Alert">Health Alert / Epidemic</option>
              <option value="Emergency">Hospital Emergency Protocol</option>
              <option value="Holiday">Gazetted Holiday Schedule</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Notice Details
            </label>
            <textarea
              rows={3}
              required
              value={annContent}
              onChange={(e) => setAnnContent(e.target.value)}
              placeholder="Detailed instructions for incoming patients and visitors..."
              className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 p-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsAnnounceModalOpen(false)}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 rounded-lg hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-lg"
            >
              Publish Notice
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
