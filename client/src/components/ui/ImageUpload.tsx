import React, { useState, useRef } from 'react';
import { UploadCloud, X, Image as ImageIcon, Check, Loader2 } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

interface ImageUploadProps {
  onUploadComplete: (url: string) => void;
  currentImage?: string;
  category?: string;
  label?: string;
}

export function ImageUpload({ onUploadComplete, currentImage, category = 'general', label = 'Image' }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { success, error } = useToast();

  const handleFile = async (file: File) => {
    // Validate format
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      error('Invalid file format. Please upload JPG, PNG, or WEBP.');
      return;
    }

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      error('File size exceeds 10MB limit.');
      return;
    }

    // Local preview immediately
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    // Upload to server
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('category', category);

      const res = await api.media.upload(formData) as { data: { url: string } };
      const uploadedUrl = res.data.url;
      onUploadComplete(uploadedUrl);
      success('Image uploaded successfully!');
    } catch (err: any) {
      error(err.message || 'Image upload failed.');
      setPreview(currentImage || null);
    } finally {
      setIsUploading(false);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onUploadComplete('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-2">
      {label && <label className="block text-xs font-semibold text-charcoal/80 uppercase tracking-wider">{label}</label>}

      {preview ? (
        <div className="relative group rounded-2xl overflow-hidden border border-beige bg-ivory aspect-video max-h-56 flex items-center justify-center">
          <img src={preview} alt="Uploaded preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-charcoal/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-white text-forest text-xs font-medium rounded-lg shadow-sm hover:bg-ivory"
            >
              Replace Image
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg shadow-sm hover:bg-red-700"
            >
              Remove
            </button>
          </div>
          {isUploading && (
            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white text-xs gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-sage" />
              <span>Uploading to Bloomora Media Library...</span>
            </div>
          )}
        </div>
      ) : (
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
            isDragging
              ? 'border-sage bg-sage/10 scale-[1.01]'
              : 'border-beige hover:border-forest/40 hover:bg-beige/20 bg-white'
          }`}
        >
          {isUploading ? (
            <Loader2 className="w-8 h-8 animate-spin text-forest" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-ivory text-forest flex items-center justify-center">
              <UploadCloud className="w-5 h-5" />
            </div>
          )}
          <div className="text-xs text-charcoal/70">
            <span className="font-semibold text-forest underline">Click to upload</span> or drag and drop
          </div>
          <p className="text-[10px] text-charcoal/50">PNG, JPG, WEBP up to 10MB</p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
          }
        }}
      />
    </div>
  );
}
