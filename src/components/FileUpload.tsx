"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadIcon, Cross2Icon, ImageIcon, VideoIcon } from "@radix-ui/react-icons";

interface FileUploadProps {
  label: string;
  accept: string;
  onChange: (file: File | null) => void;
  helperText?: string;
}

export default function FileUpload({ label, accept, onChange, helperText }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleFile = (file: File) => {
    const type = file.type;
    const isImage = type.startsWith("image/");
    const isVideo = type.startsWith("video/");

    if (!isImage && !isVideo) {
      alert("Unsupported file type");
      return;
    }

    setFileType(isImage ? "image" : "video");
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    onChange(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const clearFile = (e: React.MouseEvent) => {
    e.preventDefault();
    setPreview(null);
    setFileType(null);
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="w-full">
      <div className="flex items-end justify-between mb-4">
        <label className="block text-sm font-semibold tracking-wider uppercase text-zinc-500">{label}</label>
        {helperText && <span className="text-xs text-zinc-600">{helperText}</span>}
      </div>
      
      <AnimatePresence mode="wait">
        {!preview ? (
          <motion.div 
            key="upload-dropzone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative"
          >
            <motion.div 
              animate={{ 
                scale: dragActive ? 0.98 : 1,
                borderColor: dragActive ? "rgba(52, 211, 153, 0.5)" : "rgba(255, 255, 255, 0.1)",
                backgroundColor: dragActive ? "rgba(52, 211, 153, 0.05)" : "rgba(255, 255, 255, 0.02)"
              }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="border border-dashed rounded-[2rem] p-12 flex flex-col items-center justify-center text-center cursor-pointer overflow-hidden group"
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
            >
              <input
                ref={inputRef}
                type="file"
                accept={accept}
                onChange={handleChange}
                className="hidden"
              />
              <motion.div 
                animate={{ y: dragActive ? -5 : 0 }}
                className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-zinc-200 group-hover:border-zinc-700 transition-colors mb-4"
              >
                <UploadIcon className="w-6 h-6" />
              </motion.div>
              <p className="text-zinc-300 font-medium mb-1">Click to upload or drag and drop</p>
              <p className="text-zinc-600 text-sm">Rich media will be used as the invite background.</p>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div 
            key="upload-preview"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="relative rounded-[2rem] overflow-hidden border border-zinc-800 aspect-video bg-zinc-950 flex items-center justify-center group"
          >
            {fileType === "image" ? (
              <img src={preview} alt="Upload Preview" className="absolute inset-0 w-full h-full object-cover opacity-80" />
            ) : (
              <video src={preview} controls={false} autoPlay loop muted className="absolute inset-0 w-full h-full object-cover opacity-80" />
            )}
            
            <div className="absolute inset-0 bg-zinc-950/20 group-hover:bg-zinc-950/40 transition-colors" />

            <div className="absolute top-6 left-6 flex items-center gap-2 bg-zinc-950/80 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
              {fileType === "image" ? <ImageIcon className="w-4 h-4 text-emerald-400" /> : <VideoIcon className="w-4 h-4 text-emerald-400" />}
              <span className="text-xs font-medium text-zinc-300 capitalize">{fileType} Uploaded</span>
            </div>

            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={clearFile}
              className="absolute top-6 right-6 bg-zinc-900 border border-zinc-700 text-zinc-400 hover:text-white w-10 h-10 rounded-full flex items-center justify-center shadow-xl z-10"
              aria-label="Remove file"
            >
              <Cross2Icon className="w-5 h-5" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
