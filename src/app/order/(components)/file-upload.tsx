
'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { UploadCloud, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  className?: string;
}

export function FileUpload({ onFileSelect, className }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (selectedFile: File | null) => {
    if (selectedFile) {
      // Basic validation (e.g., file type and size)
      const isImage = selectedFile.type.startsWith('image/');
      if (!isImage) {
        alert('Please upload an image file (PNG, JPG).');
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
        alert('File is too large. Please upload an image under 5MB.');
        return;
      }
      setFile(selectedFile);
      onFileSelect(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    onFileSelect(null);
    if (preview) {
        URL.revokeObjectURL(preview);
        setPreview(null);
    }
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  if (file && preview) {
    return (
      <div className={cn("relative w-full rounded-lg border p-4", className)}>
        <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 flex-shrink-0 rounded-md overflow-hidden bg-muted">
                <Image src={preview} alt="Prescription preview" fill className="object-cover" />
            </div>
            <div className="flex-1 text-sm overflow-hidden">
                <p className="font-semibold text-foreground truncate">{file.name}</p>
                <p className="text-muted-foreground">
                {(file.size / 1024).toFixed(1)} KB
                </p>
            </div>
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full flex-shrink-0"
                onClick={handleRemoveFile}
                aria-label="Remove file"
            >
                <X className="h-4 w-4" />
                <span className="sr-only">Remove file</span>
            </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-background p-6 text-center transition-colors hover:border-primary/50',
        isDragging && 'border-primary bg-primary/10',
        className
      )}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <UploadCloud className="h-8 w-8 text-muted-foreground" />
      <p className="mt-2 text-sm font-semibold text-foreground">
        Click to upload or drag & drop
      </p>
      <p className="text-xs text-muted-foreground">
        PNG or JPG (max. 5MB)
      </p>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg"
        className="hidden"
        aria-label="Upload prescription image"
        title="Upload image"
        onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)}
      />
    </div>
  );
}
