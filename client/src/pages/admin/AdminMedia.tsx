import React, { useEffect, useState, useRef } from 'react';
import {
  UploadCloud,
  Trash2,
  Copy,
  Check,
  Search,
  Filter,
  Image as ImageIcon,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { api } from '../../services/api';
import { MediaItem } from '../../types';
import { useToast } from '../../context/ToastContext';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

export function AdminMedia() {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { success, error } = useToast();

  const fetchMedia = async () => {
    try {
      const res = await api.media.list() as { data: MediaItem[] } | MediaItem[];
      setMediaList(Array.isArray(res) ? res : (res as { data: MediaItem[] }).data || []);
    } catch (err: any) {
      error(err.message || 'Failed to fetch media library.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleUploadFiles = async (files: FileList) => {
    if (!files || files.length === 0) return;

    // Validate files
    const validFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      if (['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(f.type)) {
        validFiles.push(f);
      }
    }

    if (validFiles.length === 0) {
      error('Please select valid JPG, PNG, or WEBP images.');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      if (validFiles.length === 1) {
        formData.append('image', validFiles[0]);
        formData.append('category', 'general');
        await api.media.upload(formData);
      } else {
        validFiles.forEach((file) => formData.append('images', file));
        formData.append('category', 'general');
        await api.media.uploadMultiple(formData);
      }

      success(`Successfully uploaded ${validFiles.length} image(s)!`);
      await fetchMedia();
    } catch (err: any) {
      error(err.message || 'Image upload failed.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;
    try {
      await api.media.delete(id);
      setMediaList((prev) => prev.filter((m) => m.id !== id));
      success('Image deleted from library.');
    } catch (err: any) {
      error(err.message || 'Failed to delete image.');
    }
  };

  const handleCopyUrl = (url: string, id: string) => {
    // If relative, build full URL with origin
    const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    success('Image URL copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const filteredMedia = mediaList.filter(
    (m) =>
      m.originalName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.filename?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-beige gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-sage font-bold font-sans">
            Media Management System
          </span>
          <h1 className="font-serif text-3xl font-bold text-forest mt-0.5">Media Library</h1>
          <p className="text-xs text-charcoal/60 mt-1 font-sans">
            Upload and organize product photographs, promotional banners, and website assets without writing code.
          </p>
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="px-6 py-3 rounded-full bg-forest text-ivory text-xs font-semibold hover:bg-forest-light transition-all flex items-center justify-center gap-2 shadow-sm shrink-0"
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <UploadCloud className="w-4 h-4 text-sage" />
          )}
          <span>{uploading ? 'Uploading...' : 'Upload Images'}</span>
        </button>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files) handleUploadFiles(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
          isDragging
            ? 'border-forest bg-sage/15 scale-[1.01]'
            : 'border-beige hover:border-forest/50 hover:bg-white/80 bg-white'
        }`}
      >
        <div className="w-14 h-14 rounded-2xl bg-ivory text-forest flex items-center justify-center shadow-sm">
          {uploading ? (
            <Loader2 className="w-7 h-7 animate-spin text-forest" />
          ) : (
            <UploadCloud className="w-7 h-7 text-forest" />
          )}
        </div>
        <div className="space-y-1">
          <p className="font-serif text-base font-bold text-forest">
            {uploading ? 'Processing & saving images to server...' : 'Drag and drop your images here'}
          </p>
          <p className="text-xs text-charcoal/60 font-sans">
            or <span className="text-forest font-semibold underline">browse from your computer / phone</span>
          </p>
        </div>
        <p className="text-[10px] text-charcoal/40 uppercase tracking-wider font-semibold">
          Supports JPG, PNG, WEBP (Up to 10MB each • Multi-selection enabled)
        </p>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg, image/png, image/webp"
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleUploadFiles(e.target.files);
          }}
        />
      </div>

      {/* Search and Media Grid */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search uploaded images..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-beige rounded-xl text-xs focus:ring-1 focus:ring-forest focus:outline-none"
            />
            <Search className="w-3.5 h-3.5 text-charcoal/40 absolute left-3 top-3" />
          </div>

          <span className="text-xs text-charcoal/60">
            Total stored assets: <strong>{mediaList.length}</strong>
          </span>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner />
          </div>
        ) : filteredMedia.length === 0 ? (
          <div className="p-12 rounded-3xl bg-white border border-beige text-center space-y-2">
            <ImageIcon className="w-10 h-10 text-charcoal/30 mx-auto" />
            <p className="font-serif text-base font-semibold text-forest">No media found</p>
            <p className="text-xs text-charcoal/50">Upload images using the box above to build your media catalog.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {filteredMedia.map((media) => {
              const fullUrl = media.url.startsWith('http')
                ? media.url
                : `${window.location.origin}${media.url}`;

              return (
                <div
                  key={media.id}
                  className="group bg-white rounded-2xl border border-beige overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="relative aspect-square bg-ivory overflow-hidden">
                    <img
                      src={media.url}
                      alt={media.originalName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Actions Overlay */}
                    <div className="absolute inset-0 bg-charcoal/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleCopyUrl(media.url, media.id)}
                        className="p-2 rounded-xl bg-white text-forest hover:bg-ivory shadow-sm transition-colors"
                        title="Copy Image URL"
                      >
                        {copiedId === media.id ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>

                      <button
                        onClick={() => handleDelete(media.id)}
                        className="p-2 rounded-xl bg-red-600 text-white hover:bg-red-700 shadow-sm transition-colors"
                        title="Delete Image"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="p-2.5 space-y-0.5 text-left">
                    <p className="text-xs font-semibold text-charcoal truncate" title={media.originalName}>
                      {media.originalName}
                    </p>
                    <p className="text-[10px] text-charcoal/40">
                      {(media.size / 1024).toFixed(0)} KB •{' '}
                      {new Date(media.createdAt).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
