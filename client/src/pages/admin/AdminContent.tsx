import React, { useEffect, useState } from 'react';
import { FileText, Save, Image as ImageIcon, Sparkles, Loader2 } from 'lucide-react';
import { api } from '../../services/api';
import { WebsiteContent } from '../../types';
import { useToast } from '../../context/ToastContext';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ImageUpload } from '../../components/ui/ImageUpload';

export function AdminContent() {
  const [contentList, setContentList] = useState<WebsiteContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const { success, error } = useToast();

  const fetchContent = async () => {
    try {
      const res = await api.content.list() as { data: WebsiteContent[] };
      setContentList(res.data || []);
    } catch (err: any) {
      error(err.message || 'Failed to load website content');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const handleUpdate = async (item: WebsiteContent) => {
    setSavingKey(item.key);
    try {
      await api.content.update(item.key, item);
      success(`Saved changes to "${item.key}"! Website updated immediately.`);
    } catch (err: any) {
      error(err.message || 'Failed to update content');
    } finally {
      setSavingKey(null);
    }
  };

  const handleChange = (key: string, field: keyof WebsiteContent, val: string) => {
    setContentList((prev) =>
      prev.map((item) => (item.key === key ? { ...item, [field]: val } : item))
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-beige">
        <span className="text-xs uppercase tracking-widest text-sage font-bold font-sans">
          Website Content Management (CMS)
        </span>
        <h1 className="font-serif text-3xl font-bold text-forest mt-0.5">Website Images & Banners</h1>
        <p className="text-xs text-charcoal/60 mt-1 font-sans">
          Change hero photography, editorial banners, and headlines across the live website without editing code.
        </p>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="space-y-8">
          {contentList.map((item) => (
            <div key={item.key} className="bg-white rounded-3xl border border-beige p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-beige gap-2">
                <div>
                  <span className="text-[10px] uppercase font-bold text-sage tracking-wider">
                    Section: {item.section}
                  </span>
                  <h3 className="font-serif text-xl font-bold text-forest">{item.title || item.key}</h3>
                </div>

                <button
                  onClick={() => handleUpdate(item)}
                  disabled={savingKey === item.key}
                  className="px-6 py-2.5 rounded-full bg-forest text-ivory text-xs font-semibold hover:bg-forest-light transition-all flex items-center gap-1.5 shadow-sm"
                >
                  {savingKey === item.key ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5 text-sage" />
                  )}
                  <span>{savingKey === item.key ? 'Saving...' : 'Save & Publish'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Image Upload Area */}
                <div className="lg:col-span-5 space-y-3">
                  <span className="text-xs font-bold text-forest uppercase tracking-wider block">
                    Banner Photograph
                  </span>
                  <ImageUpload
                    label="Upload from Device (Instant live update)"
                    category={item.section}
                    currentImage={item.image}
                    onUploadComplete={(url) => handleChange(item.key, 'image', url)}
                  />
                  <div>
                    <label className="block text-[11px] text-charcoal/60 mb-1">Or direct URL:</label>
                    <input
                      type="text"
                      value={item.image || ''}
                      onChange={(e) => handleChange(item.key, 'image', e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3 py-1.5 bg-ivory border border-beige rounded-xl text-xs focus:outline-none"
                    />
                  </div>
                </div>

                {/* Text Fields Area */}
                <div className="lg:col-span-7 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-charcoal/80 mb-1">Headline</label>
                    <input
                      type="text"
                      value={item.title || ''}
                      onChange={(e) => handleChange(item.key, 'title', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-ivory border border-beige rounded-xl text-xs focus:ring-1 focus:ring-forest focus:outline-none font-serif text-sm font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-charcoal/80 mb-1">Supporting Subtext</label>
                    <input
                      type="text"
                      value={item.subtitle || ''}
                      onChange={(e) => handleChange(item.key, 'subtitle', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-ivory border border-beige rounded-xl text-xs focus:ring-1 focus:ring-forest focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-charcoal/80 mb-1">Full Content / Body</label>
                    <textarea
                      rows={3}
                      value={item.content || ''}
                      onChange={(e) => handleChange(item.key, 'content', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-ivory border border-beige rounded-xl text-xs focus:ring-1 focus:ring-forest focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
