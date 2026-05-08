import React, { useState } from 'react';
import { Upload, X, Loader2, GripVertical, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { adminAPI } from '@/lib/api';

interface ImageUploaderProps {
  value: string | File | (string | File)[];
  onChange: (value: any) => void;
  multiple?: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ value, onChange, multiple = false }) => {
  const [isUploading, setIsUploading] = useState(false);
  // Maps S3 key → temporary pre-signed preview URL (only for newly uploaded images)
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      if (multiple) {
        const currentImages = Array.isArray(value) ? value : [];
        const newFiles = [...currentImages];
        const newPreviews: Record<string, string> = {};

        for (let i = 0; i < files.length; i++) {
          if (files[i].size > 2 * 1024 * 1024) {
            alert(`"${files[i].name}" is too large. Please keep images under 2MB.`);
            continue;
          }
          newFiles.push(files[i]);
          // We use the file object itself or its name as a key for the preview map,
          // but better to just generate object URLs when rendering or store them here
          newPreviews[files[i].name] = URL.createObjectURL(files[i]);
        }
        setPreviewUrls(prev => ({ ...prev, ...newPreviews }));
        onChange(newFiles);
      } else {
        if (files[0].size > 2 * 1024 * 1024) {
          alert(`"${files[0].name}" is too large. Please keep images under 2MB.`);
          return;
        }
        setPreviewUrls(prev => ({ ...prev, [files[0].name]: URL.createObjectURL(files[0]) }));
        onChange(files[0]);
      }
    } catch (error) {
      console.error('Image selection failed', error);
      alert('Failed to select image');
    } finally {
      if (e.target) e.target.value = ''; // Reset input
    }
  };

  const removeImage = (indexToRemove?: number) => {
    if (multiple && Array.isArray(value)) {
      const newUrls = value.filter((_, idx) => idx !== indexToRemove);
      onChange(newUrls);
    } else {
      onChange('');
    }
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    if (!multiple || !Array.isArray(value)) return;
    
    if (direction === 'up' && index > 0) {
      const newUrls = [...value];
      [newUrls[index - 1], newUrls[index]] = [newUrls[index], newUrls[index - 1]];
      onChange(newUrls);
    } else if (direction === 'down' && index < value.length - 1) {
      const newUrls = [...value];
      [newUrls[index + 1], newUrls[index]] = [newUrls[index], newUrls[index + 1]];
      onChange(newUrls);
    }
  };

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (!multiple || !Array.isArray(value) || draggedIndex === null || draggedIndex === targetIndex) return;

    const newUrls = [...value];
    const itemToMove = newUrls[draggedIndex];
    newUrls.splice(draggedIndex, 1);
    newUrls.splice(targetIndex, 0, itemToMove);
    
    onChange(newUrls);
    setDraggedIndex(null);
  };

  const BASE_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5001';

  // Resolve any value (S3 key, /uploads/ path, full URL, or File) to a displayable URL
  const getDisplayUrl = (val: string | File) => {
    if (!val) return '';
    if (val instanceof File) {
      return previewUrls[val.name] || URL.createObjectURL(val);
    }
    if (typeof val === 'string') {
      if (previewUrls[val]) return previewUrls[val]; // legacy newly uploaded
      if (val.startsWith('http')) return val;          // already a full URL (signed or otherwise)
      if (val.startsWith('/uploads/')) return `${BASE_URL}${val}`; // legacy local file
      return val; // fallback
    }
    return '';
  };

  return (
    <div className="space-y-4">
      {/* Upload Button Area */}
      <div className="flex items-center gap-4">
        <label className="relative flex-1 cursor-pointer">
          <input
            type="file"
            className="hidden"
            accept="image/*"
            multiple={multiple}
            onChange={handleFileChange}
            disabled={isUploading}
          />
          <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border/50 rounded-lg hover:bg-muted/30 transition-colors">
            {isUploading ? (
              <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
            ) : (
              <Upload className="w-8 h-8 text-muted-foreground mb-2" />
            )}
            <span className="text-sm font-medium text-foreground">
              {isUploading ? 'Uploading...' : 'Click to upload image' + (multiple ? 's' : '')}
            </span>
            <span className="text-xs text-muted-foreground mt-1">Max file size: 2MB</span>
          </div>
        </label>
      </div>

      {/* Preview Area for Single Image */}
      {!multiple && value && (typeof value === 'string' || value instanceof File) && (
        <div className="relative w-full max-w-sm h-[300px] rounded-md overflow-hidden border border-border/50 group bg-muted/10">
          <img src={getDisplayUrl(value)} alt="Preview" className="w-full h-full object-contain p-2" />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button type="button" variant="destructive" size="sm" onClick={() => removeImage()}>
              <X className="w-4 h-4 mr-2" /> Remove
            </Button>
          </div>
        </div>
      )}

      {/* Preview Area for Multiple Images */}
      {multiple && Array.isArray(value) && value.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Reorder or remove images</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {value.map((url, idx) => (
              <div 
                key={`${url}-${idx}`} 
                className={`flex items-center gap-3 p-2 border rounded-md bg-card group transition-colors ${draggedIndex === idx ? 'border-primary border-dashed opacity-50' : 'border-border/50'}`}
                draggable
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, idx)}
              >
                <div className="flex flex-col gap-1 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground">
                  <GripVertical className="w-5 h-5" />
                </div>
                <div className="h-16 w-16 rounded overflow-hidden bg-muted flex-shrink-0">
                  <img src={getDisplayUrl(url)} alt={`Product ${idx}`} className="h-full w-full object-contain p-0.5 pointer-events-none" />
                </div>
                <div className="flex-1 truncate text-xs text-muted-foreground select-none">
                  {url instanceof File ? url.name : url.split('/').pop()}
                </div>
                <Button type="button" variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => removeImage(idx)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
