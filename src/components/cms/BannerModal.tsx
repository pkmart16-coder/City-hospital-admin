import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useHospital } from '../../context/HospitalContext';
import { BannerItem } from '../../types';

interface BannerModalProps {
  banner: BannerItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const BannerModal: React.FC<BannerModalProps> = ({
  banner,
  isOpen,
  onClose
}) => {
  const { saveBanner } = useHospital();

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [ctaText, setCtaText] = useState('Book Appointment');
  const [destinationUrl, setDestinationUrl] = useState('/book-appointment');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [expiryDate, setExpiryDate] = useState('2026-12-31');
  const [priority, setPriority] = useState(1);
  const [placement, setPlacement] = useState<BannerItem['placement']>('Home Hero');
  const [isActive, setIsActive] = useState(true);
  const [videoUrl, setVideoUrl] = useState('');
  const [countdownEnd, setCountdownEnd] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (banner) {
      setTitle(banner.title);
      setSubtitle(banner.subtitle || '');
      setImageUrl(banner.imageUrl);
      setCtaText(banner.ctaText || 'Learn More');
      setDestinationUrl(banner.destinationUrl || '/appointments');
      setStartDate(banner.startDate);
      setExpiryDate(banner.expiryDate);
      setPriority(banner.priority);
      setPlacement(banner.placement);
      setIsActive(banner.isActive);
      setVideoUrl(banner.videoUrl || '');
      setCountdownEnd((banner.countdownEnd || '').slice(0, 16));
    } else {
      setTitle('');
      setSubtitle('');
      setImageUrl('https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=1200&auto=format&fit=crop&q=80');
      setCtaText('Book Appointment');
      setDestinationUrl('/book-appointment');
      setStartDate(new Date().toISOString().slice(0, 10));
      setExpiryDate('2026-12-31');
      setPriority(1);
      setPlacement('Home Hero');
      setIsActive(true);
      setVideoUrl('');
      setCountdownEnd('');
    }
  }, [banner, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Banner title is required.');
      return;
    }

    try {
      setIsSubmitting(true);
      await saveBanner({
        id: banner?.id,
        title: title.trim(),
        subtitle: subtitle.trim(),
        imageUrl: imageUrl.trim(),
        ctaText: ctaText.trim(),
        destinationUrl: destinationUrl.trim(),
        startDate,
        expiryDate,
        priority,
        placement,
        isActive,
        videoUrl: videoUrl.trim(),
        countdownEnd: countdownEnd ? `${countdownEnd}:00+05:00` : ''
      });
      setIsSubmitting(false);
      onClose();
    } catch (err: unknown) {
      setIsSubmitting(false);
      setError(err instanceof Error ? err.message : 'Failed to save banner');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={banner ? 'Edit Promotional Banner' : 'Create Public Website Banner'}
      subtitle="Publish campaign banners, health alert hero sliders and website CTA buttons"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-2.5 text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded-lg">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Banner Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Free Cardiac Screening Month"
            className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 p-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Subtitle / Description
          </label>
          <textarea
            rows={2}
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="Brief subtext describing the promotional campaign or clinical offer..."
            className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 p-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Banner Image URL / Storage
          </label>
          <input
            type="text"
            required
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 p-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
          {imageUrl && (
            <div className="mt-2 h-28 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-950">
              <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Video URL (optional)
          </label>
          <input
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="YouTube / Vimeo / Facebook link, or a direct .mp4 / .webm link"
            className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 p-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
          <p className="text-[10px] text-slate-500 mt-1">The video plays on the website itself. If a video is set it is shown instead of the image.</p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Offer countdown ends at (Pakistan time, optional)
          </label>
          <input
            type="datetime-local"
            value={countdownEnd}
            onChange={(e) => setCountdownEnd(e.target.value)}
            className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 p-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
          <p className="text-[10px] text-slate-500 mt-1">A live timer shows on the website. When the time passes, the banner disappears automatically.</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Call to Action (CTA) Button Text
            </label>
            <input
              type="text"
              value={ctaText}
              onChange={(e) => setCtaText(e.target.value)}
              placeholder="e.g. Book Consultation"
              className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 p-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Destination URL
            </label>
            <input
              type="text"
              value={destinationUrl}
              onChange={(e) => setDestinationUrl(e.target.value)}
              placeholder="e.g. /book-appointment or https://..."
              className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 p-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Placement
            </label>
            <select
              value={placement}
              onChange={(e) => setPlacement(e.target.value as BannerItem['placement'])}
              className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 p-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="Home Hero">Home Page Top Offers Section</option>
              <option value="Top Announcement Bar">Top Announcement Bar</option>
              <option value="Popup Modal">Popup Modal Dialog</option>
              <option value="Sidebar">Sidebar Promotion</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 p-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Expiry Date
            </label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 p-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800 dark:text-slate-200">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded text-teal-600 focus:ring-teal-500"
            />
            <span>Active & Published on Public Website</span>
          </label>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Display Priority:</span>
            <input
              type="number"
              min="1"
              max="10"
              value={priority}
              onChange={(e) => setPriority(Number(e.target.value))}
              className="w-16 p-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-center font-mono"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-xs transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save & Publish Banner'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
