import React, { useState } from 'react';
import { Upload, X, Loader2, GripVertical, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { adminAPI } from '@/lib/api';

interface ImageUploaderProps {
  value: string | string[];
  onChange: (value: any) => void;
  multiple?: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ value, onChange, multiple = false }) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      if (multiple) {
        const currentImages = Array.isArray(value) ? value : [];
        const newUrls = [...currentImages];
        
        for (let i = 0; i < files.length; i++) {
          if (files[i].size > 2 * 1024 * 1024) {
            alert(`"${files[i].name}" is too large. Please keep images under 2MB.`);
            continue;
          }
          const res = await adminAPI.uploadImage(files[i]);
          newUrls.push(res.url);
        }
        onChange(newUrls);
      } else {
        if (files[0].size > 2 * 1024 * 1024) {
          alert(`"${files[0].name}" is too large. Please keep images under 2MB.`);
          return;
        }
        const res = await adminAPI.uploadImage(files[0]);
        onChange(res.url);
      }
    } catch (error) {
      console.error('Image upload failed', error);
      alert('Failed to upload image');
    } finally {
      setIsUploading(false);
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

  const BASE_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5001';
  
  const getFullUrl = (url: string) => {
    if (url.startsWith('http')) return url;
    return `${BASE_URL}${url}`;
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
      {!multiple && typeof value === 'string' && value && (
        <div className="relative w-full max-w-sm h-[300px] rounded-md overflow-hidden border border-border/50 group bg-muted/10">
          <img src={getFullUrl(value)} alt="Preview" className="w-full h-full object-contain p-2" />
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
              <div key={`${url}-${idx}`} className="flex items-center gap-3 p-2 border border-border/50 rounded-md bg-card group">
                <div className="flex flex-col gap-1">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6" 
                    disabled={idx === 0}
                    onClick={() => moveImage(idx, 'up')}
                  >
                    ↑
                  </Button>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6" 
                    disabled={idx === value.length - 1}
                    onClick={() => moveImage(idx, 'down')}
                  >
                    ↓
                  </Button>
                </div>
                <div className="h-16 w-16 rounded overflow-hidden bg-muted flex-shrink-0">
                  <img src={getFullUrl(url)} alt={`Product ${idx}`} className="h-full w-full object-contain p-0.5" />
                </div>
                <div className="flex-1 truncate text-xs text-muted-foreground">
                  {url.split('/').pop()}
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
