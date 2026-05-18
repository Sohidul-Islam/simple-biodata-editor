'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface CreatorPanelProps {
  handleCreateAction: (name: string) => Promise<void>;
}

export default function CreatorPanel({ handleCreateAction }: CreatorPanelProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'default' | 'ai'>('default');
  const [name, setName] = useState('MD Mubtashim Fuad Fahim');
  const [isCreatingDefault, setIsCreatingDefault] = useState(false);
  
  // AI Import States
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Default Create Submission Handler
  const onSubmitDefault = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsCreatingDefault(true);
    try {
      await handleCreateAction(name);
    } catch (err) {
      console.error('Failed to create default biodata:', err);
      setIsCreatingDefault(false);
    }
  };

  // Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      validateAndSetFile(droppedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    const allowedExtensions = ['.pdf', '.doc', '.docx', '.txt', '.md', '.png', '.jpg', '.jpeg'];
    const fileExtension = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();
    
    if (allowedExtensions.includes(fileExtension)) {
      setFile(selectedFile);
      setError(null);
    } else {
      setError('Unsupported file type. Please upload PDF, DOC/DOCX, TXT, MD or Images.');
      setFile(null);
    }
  };

  // AI Import Trigger
  const handleAiUpload = async () => {
    if (!file) return;
    setUploading(true);
    setProgress(5);
    setStatusMessage('Uploading your document securely to server...');
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || 'Upload failed');
      }

      const { jobId } = await response.json();
      pollJobStatus(jobId);
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload document.');
      setUploading(false);
    }
  };

  // Poll BullMQ Job status
  const pollJobStatus = (jobId: string) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/jobs/${jobId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch job status');
        }

        const job = await response.json();

        if (job.success) {
          if (job.status === 'completed') {
            clearInterval(interval);
            setProgress(100);
            setStatusMessage('Redirecting to your pre-filled biodata editor...');
            setTimeout(() => {
              router.push(`/editor/${job.result.biodataId}`);
            }, 1500);
          } else if (job.status === 'failed') {
            clearInterval(interval);
            setError(job.error || 'Parsing failed.');
            setUploading(false);
          } else {
            // Active/Waiting states
            setProgress(job.progress || 20);
            
            // Generate informative status messages based on progress ranges
            if (job.progress < 20) {
              setStatusMessage('File uploaded. Queueing parsing task...');
            } else if (job.progress >= 20 && job.progress < 60) {
              setStatusMessage('IBM Docling is converting layout and parsing pages to markdown...');
            } else if (job.progress >= 60 && job.progress < 90) {
              setStatusMessage('Ollama Qwen 2.5 is extracting personal details & correcting formatting...');
            } else if (job.progress >= 90) {
              setStatusMessage('Saving structured information into MySQL database...');
            }
          }
        }
      } catch (err: any) {
        console.error('Polling error:', err);
        clearInterval(interval);
        setError('Failed to track progress. Server may be processing slowly.');
        setUploading(false);
      }
    }, 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
      {/* Dynamic Navigation Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
        <button
          onClick={() => !uploading && setActiveTab('default')}
          disabled={uploading}
          className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
            activeTab === 'default'
              ? 'bg-white text-slate-800 shadow-sm'
              : 'text-slate-500 hover:text-slate-800 cursor-pointer'
          }`}
        >
          Blank Slate
        </button>
        <button
          onClick={() => !uploading && setActiveTab('ai')}
          disabled={uploading}
          className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'ai'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-850 cursor-pointer'
          }`}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
            <line x1="12" y1="22.08" x2="12" y2="12"></line>
          </svg>
          AI Import
        </button>
      </div>

      {activeTab === 'default' ? (
        // Blank Slate form
        <form onSubmit={onSubmitDefault} className="space-y-4">
          <p className="text-sm text-slate-500 leading-relaxed">
            Start building a stunning wedding biodata from a blank template. It initializes a beautiful default pre-filled layout instantly!
          </p>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Groom/Bride Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. MD Mubtashim Fuad Fahim"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm bg-slate-50 transition"
            />
          </div>
          <button
            type="submit"
            disabled={isCreatingDefault}
            className="w-full py-3 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 disabled:bg-rose-400 text-white rounded-lg font-bold text-sm transition shadow-lg shadow-rose-100 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isCreatingDefault ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Generate Biodata
              </>
            )}
          </button>
        </form>
      ) : (
        // AI Upload wizard
        <div className="space-y-4">
          <p className="text-sm text-slate-500 leading-relaxed">
            Upload an existing Resume/Biodata in <strong>PDF, DOCX, TXT, MD, or Image</strong> format. Our AI will extract all details and design a premium wedding biodata!
          </p>

          {!uploading ? (
            <div className="space-y-4">
              {/* Drag and Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${
                  isDragOver 
                    ? 'border-rose-500 bg-rose-50/50' 
                    : file 
                      ? 'border-emerald-400 bg-emerald-50/20' 
                      : 'border-slate-300 hover:border-rose-400 bg-slate-50 hover:bg-slate-100/50'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.txt,.md,image/*"
                  className="hidden"
                />
                
                <div className="flex flex-col items-center gap-2">
                  {file ? (
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-md">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shadow-md">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="17 8 12 3 7 8"></polyline>
                        <line x1="12" y1="3" x2="12" y2="15"></line>
                      </svg>
                    </div>
                  )}

                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-700">
                      {file ? file.name : 'Drag & drop file here'}
                    </p>
                    <p className="text-[10px] text-slate-450 leading-relaxed">
                      {file 
                        ? `${(file.size / (1024 * 1024)).toFixed(2)} MB — Click to change` 
                        : 'PDF, DOCX, TXT, MD, or Images (Max 10MB)'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Subject Full Name for the database record */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Groom/Bride Name (Fallback)</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Fallback name if AI cannot detect it"
                  className="w-full px-3 py-2 rounded-lg border border-slate-350 focus:outline-none focus:ring-1 focus:ring-rose-500 text-xs bg-slate-50"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-150 rounded-xl p-3 text-red-700 text-xxs font-semibold leading-normal flex items-start gap-2">
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleAiUpload}
                disabled={!file}
                className="w-full py-3 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 disabled:bg-slate-300 disabled:text-slate-400 text-white rounded-lg font-bold text-sm transition shadow-lg shadow-rose-100 flex items-center justify-center gap-2 cursor-pointer"
              >
                Start AI Pipeline
              </button>
            </div>
          ) : (
            // Processing/Upload state
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span className="truncate max-w-[170px]">{file?.name}</span>
                  <span className="font-mono text-rose-600 animate-pulse">{progress}%</span>
                </div>
                
                {/* Visual Progress Bar */}
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200 shadow-inner">
                  <div
                    className="bg-gradient-to-r from-rose-500 to-amber-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3.5 shadow-sm">
                <div className="relative flex-shrink-0 flex items-center justify-center w-8 h-8">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-rose-450 opacity-15 animate-ping" />
                  <div className="w-6 h-6 rounded-full border-2 border-t-rose-600 border-rose-150 animate-spin" />
                </div>
                <div className="space-y-0.5 min-w-0">
                  <h4 className="text-xxs font-bold uppercase tracking-wider text-slate-400">Processing Stage</h4>
                  <p className="text-xs font-semibold text-slate-750 truncate leading-snug">{statusMessage}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
