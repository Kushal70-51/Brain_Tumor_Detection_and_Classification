import { useState, useCallback } from "react";
import { Upload, Image as ImageIcon, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface MriUploadProps {
  onImageUpload: (file: File, preview: string) => void;
  preview: string | null;
  onClear: () => void;
}

export function MriUpload({ onImageUpload, preview, onClear }: MriUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) {
        const url = URL.createObjectURL(file);
        onImageUpload(file, url);
      }
    },
    [onImageUpload]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const url = URL.createObjectURL(file);
        onImageUpload(file, url);
      }
    },
    [onImageUpload]
  );

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {!preview ? (
          <motion.label
            key="upload"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            htmlFor="mri-upload"
            className={`upload-zone flex flex-col items-center justify-center py-16 px-8 cursor-pointer ${
              isDragOver ? "upload-zone-active" : ""
            }`}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
          >
            <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mb-4">
              <Upload className="w-6 h-6 text-primary" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">
              Drop MRI scan here or click to upload
            </p>
            <p className="text-xs text-muted-foreground">
              Supports JPG, PNG, DICOM • Max 10MB
            </p>
            <input
              id="mri-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />
          </motion.label>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            className="glass-card p-4 relative"
          >
            <button
              onClick={onClear}
              className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full bg-secondary hover:bg-destructive/20 flex items-center justify-center transition-colors"
            >
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
            <div className="flex items-center gap-2 mb-3">
              <ImageIcon className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium text-muted-foreground">Uploaded MRI Scan</span>
            </div>
            <img
              src={preview}
              alt="MRI Scan Preview"
              className="w-full max-h-64 object-contain rounded-xl bg-background/50"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
