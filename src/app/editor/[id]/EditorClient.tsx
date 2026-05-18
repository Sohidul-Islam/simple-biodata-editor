'use client';

import React, { useState, useRef, useTransition } from 'react';
import { saveBiodata, BiodataData, BiodataSection, SectionItem } from '@/app/actions';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface EditorClientProps {
  initialData: BiodataData;
}

export default function EditorClient({ initialData }: EditorClientProps) {
  const router = useRouter();
  const [data, setData] = useState<BiodataData>(initialData);
  const [zoom, setZoom] = useState<number>(0.8);
  const [activeSection, setActiveSection] = useState<string>('contact');
  const [isPending, startTransition] = useTransition();
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Deep copy helper
  const updateData = (updater: (prev: BiodataData) => void) => {
    setData((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      updater(next);
      return next;
    });
  };

  // Save changes via Server Action
  const handleSave = () => {
    setSaveStatus('saving');
    startTransition(async () => {
      try {
        await saveBiodata(data.id, data);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } catch (err) {
        console.error('Failed to save biodata:', err);
        setSaveStatus('error');
      }
    });
  };

  // Image Upload helper
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      updateData((prev) => {
        prev.photo = reader.result as string;
      });
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    updateData((prev) => {
      prev.photo = null;
    });
  };

  // Section Reordering
  const moveSection = (index: number, direction: 'up' | 'down') => {
    updateData((prev) => {
      const sections = prev.sections;
      if (direction === 'up' && index > 0) {
        const temp = sections[index];
        sections[index] = sections[index - 1];
        sections[index - 1] = temp;
      } else if (direction === 'down' && index < sections.length - 1) {
        const temp = sections[index];
        sections[index] = sections[index + 1];
        sections[index + 1] = temp;
      }
    });
  };

  // Remove Section
  const removeSection = (index: number) => {
    if (confirm('Are you sure you want to remove this entire section?')) {
      updateData((prev) => {
        prev.sections.splice(index, 1);
      });
    }
  };

  // Add Section
  const addSection = () => {
    updateData((prev) => {
      const newSec: BiodataSection = {
        id: `custom_${Date.now()}`,
        title: 'New Custom Section',
        layout: 'grid',
        description: '',
        items: [
          { id: `item_${Date.now()}`, label: 'Label Name', value: 'Detail Value' },
        ],
      };
      prev.sections.push(newSec);
    });
    // Set active section to newly created section
    setTimeout(() => {
      setData((curr) => {
        const lastSec = curr.sections[curr.sections.length - 1];
        setActiveSection(lastSec.id);
        return curr;
      });
    }, 10);
  };

  // Add Item to a Section
  const addItem = (sectionId: string) => {
    updateData((prev) => {
      const sec = prev.sections.find((s) => s.id === sectionId);
      if (!sec) return;
      const timestamp = Date.now();

      if (sec.layout === 'academic') {
        sec.items.push({
          id: `item_${timestamp}`,
          tag: 'DEGREE',
          title: 'Title/Degree Name',
          sub: 'Institution details and passing year',
        });
      } else if (sec.layout === 'text') {
        sec.items.push({
          id: `item_${timestamp}`,
          value: 'Write your detailed paragraphs or list points here.',
        });
      } else {
        sec.items.push({
          id: `item_${timestamp}`,
          label: 'Label',
          value: 'Detail Value',
        });
      }
    });
  };

  // Remove Item from a Section
  const removeItem = (sectionId: string, itemId: string) => {
    updateData((prev) => {
      const sec = prev.sections.find((s) => s.id === sectionId);
      if (!sec) return;
      sec.items = sec.items.filter((i) => i.id !== itemId);
    });
  };

  return (
    <div className="h-screen flex flex-col antialiased bg-slate-900 text-slate-100 overflow-hidden">
      {/* Top Header */}
      <header className="h-16 bg-slate-950 border-b border-slate-800 px-6 flex justify-between items-center z-10 flex-shrink-0">
        <div className="flex items-center gap-4">
          <Link 
            href="/"
            className="p-2 hover:bg-slate-850 rounded-lg text-slate-400 hover:text-white transition flex items-center gap-1.5 text-xs font-semibold"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M12 19l-7-7 7-7"></path>
            </svg>
            Dashboard
          </Link>
          <div className="h-5 w-[1px] bg-slate-800"></div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-wide truncate max-w-[200px]">
              Editing: {data.name}
            </h1>
            <p className="text-[10px] text-slate-500 font-medium">Full-Stack Realtime Mode</p>
          </div>
        </div>

        {/* Toolbar Center / Zoom */}
        <div className="hidden lg:flex items-center gap-3 bg-slate-900 border border-slate-800 px-4 py-1.5 rounded-full">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Preview Zoom</span>
          <input
            type="range"
            min="0.5"
            max="1.5"
            step="0.05"
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className="w-24 accent-rose-500 cursor-pointer"
          />
          <span className="text-xs font-bold text-slate-400 font-mono w-8">{Math.round(zoom * 100)}%</span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-850 text-slate-200 hover:text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer border border-slate-700"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            PDF / Print
          </button>
          
          <button
            onClick={handleSave}
            disabled={saveStatus === 'saving'}
            className={`px-5 py-2 font-bold text-xs rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-lg ${
              saveStatus === 'saved' ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-950/20' :
              saveStatus === 'error' ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-950/20' :
              'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-950/20'
            }`}
          >
            {saveStatus === 'saving' ? (
              <>
                <svg className="animate-spin -ml-1 mr-1 h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : saveStatus === 'saved' ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Saved!
              </>
            ) : saveStatus === 'error' ? (
              'Error! Retry'
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                  <polyline points="17 21 17 13 7 13 7 21"></polyline>
                  <polyline points="7 3 7 8 15 8"></polyline>
                </svg>
                Save Draft
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Splitscreen Workspace */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Side Panel - Editor Form Controls (40%) */}
        <div className="w-full md:w-[40%] bg-slate-950 border-r border-slate-800 flex flex-col h-full flex-shrink-0 z-5 overflow-y-auto">
          {/* Theme & Palette Selection */}
          <div className="p-5 border-b border-slate-900 space-y-3 bg-slate-950/60">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Palette Themes</label>
            <div className="grid grid-cols-5 gap-2">
              {[
                { name: 'maroon', color: 'bg-rose-900 border-rose-700 text-rose-200' },
                { name: 'gold', color: 'bg-amber-800 border-amber-600 text-amber-200' },
                { name: 'navy', color: 'bg-blue-900 border-blue-700 text-blue-200' },
                { name: 'emerald', color: 'bg-emerald-900 border-emerald-700 text-emerald-200' },
                { name: 'dark', color: 'bg-slate-850 border-slate-700 text-slate-300' },
              ].map((t) => (
                <button
                  key={t.name}
                  onClick={() => updateData((prev) => { prev.theme = t.name; })}
                  className={`py-2 px-1 text-[10px] font-bold uppercase rounded border transition flex flex-col items-center justify-center gap-1 cursor-pointer hover:opacity-90 ${t.color} ${
                    data.theme === t.name ? 'ring-2 ring-rose-500 scale-105 border-transparent' : 'opacity-65'
                  }`}
                >
                  <span className="w-3.5 h-3.5 rounded-full border border-white/20 bg-current"></span>
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          {/* Form Accordion Sections */}
          <div className="flex-1 p-5 space-y-4">
            
            {/* Header / Contact Details Accordion */}
            <div className="border border-slate-900 rounded-xl overflow-hidden bg-slate-900/30">
              <button
                onClick={() => setActiveSection(activeSection === 'contact' ? '' : 'contact')}
                className="w-full px-5 py-4 bg-slate-900/50 hover:bg-slate-900 transition flex justify-between items-center text-left"
              >
                <div className="flex items-center gap-2">
                  <span className="text-rose-500 text-sm font-bold font-mono">01</span>
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Contact & Profile Photo</span>
                </div>
                <span className={`text-slate-500 text-xs transition-transform ${activeSection === 'contact' ? 'rotate-180' : ''}`}>▼</span>
              </button>
              
              {activeSection === 'contact' && (
                <div className="p-5 border-t border-slate-900 space-y-4">
                  {/* Photo upload */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-semibold text-slate-400 uppercase block">Profile Picture</label>
                    <div className="flex items-center gap-4">
                      {data.photo ? (
                        <div className="relative w-16 h-20 border border-slate-700 rounded overflow-hidden flex-shrink-0 bg-slate-800">
                          <img src={data.photo} className="w-full h-full object-cover" alt="Profile" />
                          <button
                            onClick={removePhoto}
                            className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition flex items-center justify-center text-[10px] text-red-400 font-bold uppercase cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="w-16 h-20 border-2 border-dashed border-slate-700 rounded hover:border-rose-500 hover:bg-slate-900/50 transition flex flex-col items-center justify-center text-xxs font-bold text-slate-500 uppercase tracking-tight gap-1 cursor-pointer"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                            <circle cx="12" cy="13" r="4"></circle>
                          </svg>
                          Upload
                        </button>
                      )}
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handlePhotoUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      <div className="text-xxs text-slate-400 leading-normal">
                        <p className="font-semibold text-slate-300">Click to upload photo</p>
                        <p>Standalone base64 storage. JPG/PNG recommended.</p>
                      </div>
                    </div>
                  </div>

                  {/* Inputs */}
                  <div className="grid grid-cols-1 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-slate-400 uppercase">Biodata Name</label>
                      <input
                        type="text"
                        value={data.name}
                        onChange={(e) => updateData((prev) => { prev.name = e.target.value; })}
                        className="w-full px-3 py-2 rounded border border-slate-800 bg-slate-950 text-xs text-white focus:outline-none focus:border-rose-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-slate-400 uppercase">Contact Email</label>
                      <input
                        type="email"
                        value={data.email || ''}
                        onChange={(e) => updateData((prev) => { prev.email = e.target.value || null; })}
                        className="w-full px-3 py-2 rounded border border-slate-800 bg-slate-950 text-xs text-white focus:outline-none focus:border-rose-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-slate-400 uppercase">Contact Phone</label>
                      <input
                        type="text"
                        value={data.phone || ''}
                        onChange={(e) => updateData((prev) => { prev.phone = e.target.value || null; })}
                        className="w-full px-3 py-2 rounded border border-slate-800 bg-slate-950 text-xs text-white focus:outline-none focus:border-rose-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Objective Accordion */}
            <div className="border border-slate-900 rounded-xl overflow-hidden bg-slate-900/30">
              <button
                onClick={() => setActiveSection(activeSection === 'objective' ? '' : 'objective')}
                className="w-full px-5 py-4 bg-slate-900/50 hover:bg-slate-900 transition flex justify-between items-center text-left"
              >
                <div className="flex items-center gap-2">
                  <span className="text-rose-500 text-sm font-bold font-mono">02</span>
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Biodata Objective / About</span>
                </div>
                <span className={`text-slate-500 text-xs transition-transform ${activeSection === 'objective' ? 'rotate-180' : ''}`}>▼</span>
              </button>
              
              {activeSection === 'objective' && (
                <div className="p-5 border-t border-slate-900 space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-400 uppercase">Objective Title</label>
                    <input
                      type="text"
                      value={data.titleObjective}
                      onChange={(e) => updateData((prev) => { prev.titleObjective = e.target.value; })}
                      className="w-full px-3 py-2 rounded border border-slate-800 bg-slate-950 text-xs text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-400 uppercase">Objective / About Content</label>
                    <textarea
                      rows={5}
                      value={data.objectiveContent}
                      onChange={(e) => updateData((prev) => { prev.objectiveContent = e.target.value; })}
                      className="w-full px-3 py-2 rounded border border-slate-800 bg-slate-950 text-xs text-white focus:outline-none focus:border-rose-500 resize-y font-sans leading-relaxed"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Dynamic Custom/Template Sections Accordion */}
            {data.sections.map((section, sIndex) => (
              <div 
                key={section.id} 
                className="border border-slate-900 rounded-xl overflow-hidden bg-slate-900/30"
              >
                <div className="w-full px-5 py-4 bg-slate-900/50 hover:bg-slate-900 transition flex justify-between items-center text-left">
                  <button
                    onClick={() => setActiveSection(activeSection === section.id ? '' : section.id)}
                    className="flex-1 flex items-center gap-2"
                  >
                    <span className="text-rose-500 text-sm font-bold font-mono">
                      {String(sIndex + 3).padStart(2, '0')}
                    </span>
                    <span className="text-xs font-bold text-white uppercase tracking-wider truncate max-w-[150px]">
                      {section.title}
                    </span>
                  </button>

                  <div className="flex items-center gap-1.5 flex-shrink-0 ml-4 no-print">
                    <button
                      onClick={() => moveSection(sIndex, 'up')}
                      disabled={sIndex === 0}
                      className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded disabled:opacity-20 cursor-pointer"
                      title="Move Section Up"
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => moveSection(sIndex, 'down')}
                      disabled={sIndex === data.sections.length - 1}
                      className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded disabled:opacity-20 cursor-pointer"
                      title="Move Section Down"
                    >
                      ▼
                    </button>
                    <button
                      onClick={() => removeSection(sIndex)}
                      className="p-1 hover:bg-red-950 text-slate-500 hover:text-red-400 rounded cursor-pointer"
                      title="Delete Section"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {activeSection === section.id && (
                  <div className="p-5 border-t border-slate-900 space-y-4">
                    {/* Title & Layout Selector */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-slate-400 uppercase">Section Title</label>
                        <input
                          type="text"
                          value={section.title}
                          onChange={(e) => updateData((prev) => { prev.sections[sIndex].title = e.target.value; })}
                          className="w-full px-3 py-2 rounded border border-slate-800 bg-slate-950 text-xs text-white focus:outline-none focus:border-rose-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-slate-400 uppercase">Layout Style</label>
                        <select
                          value={section.layout}
                          onChange={(e) => updateData((prev) => { 
                            prev.sections[sIndex].layout = e.target.value as any; 
                          })}
                          className="w-full px-3 py-2 rounded border border-slate-800 bg-slate-950 text-xs text-white focus:outline-none focus:border-rose-500 cursor-pointer"
                        >
                          <option value="grid">Grid (2 Col)</option>
                          <option value="simple">List (1 Col)</option>
                          <option value="academic">Academic (Edu/Work)</option>
                          <option value="text">Paragraph / Text</option>
                        </select>
                      </div>
                    </div>

                    {/* Section description */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-slate-400 uppercase">Description (Optional)</label>
                      <input
                        type="text"
                        value={section.description || ''}
                        onChange={(e) => updateData((prev) => { prev.sections[sIndex].description = e.target.value; })}
                        className="w-full px-3 py-2 rounded border border-slate-800 bg-slate-950 text-xs text-white focus:outline-none focus:border-rose-500"
                        placeholder="e.g. Brief background note"
                      />
                    </div>

                    {/* Section Items */}
                    <div className="space-y-3 pt-2">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Section Items</label>
                        <button
                          type="button"
                          onClick={() => addItem(section.id)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-rose-600 text-white rounded text-[10px] font-bold uppercase transition cursor-pointer"
                        >
                          + Add Item
                        </button>
                      </div>

                      <div className="space-y-3">
                        {section.items.map((item, iIndex) => (
                          <div 
                            key={item.id} 
                            className="bg-slate-950/60 p-3 rounded border border-slate-900 relative group/item"
                          >
                            {/* Delete item button */}
                            <button
                              type="button"
                              onClick={() => removeItem(section.id, item.id)}
                              className="absolute top-2 right-2 text-slate-500 hover:text-red-400 text-xs opacity-0 group-hover/item:opacity-100 transition cursor-pointer"
                              title="Delete Item"
                            >
                              ✕
                            </button>

                            {section.layout === 'academic' ? (
                              <div className="space-y-2 pr-4">
                                <div className="grid grid-cols-3 gap-2">
                                  <input
                                    type="text"
                                    placeholder="Tag (e.g. BBS)"
                                    value={item.tag || ''}
                                    onChange={(e) => updateData((prev) => {
                                      prev.sections[sIndex].items[iIndex].tag = e.target.value;
                                    })}
                                    className="px-2 py-1 bg-slate-900 border border-slate-850 rounded text-xxs text-white w-full focus:outline-none"
                                  />
                                  <input
                                    type="text"
                                    placeholder="Title (e.g. Major Degree)"
                                    value={item.title || ''}
                                    onChange={(e) => updateData((prev) => {
                                      prev.sections[sIndex].items[iIndex].title = e.target.value;
                                    })}
                                    className="px-2 py-1 bg-slate-900 border border-slate-850 rounded text-xxs text-white w-full focus:outline-none col-span-2"
                                  />
                                </div>
                                <input
                                  type="text"
                                  placeholder="Sub/Details (e.g. College — GPA 3.20 (2022))"
                                  value={item.sub || ''}
                                  onChange={(e) => updateData((prev) => {
                                    prev.sections[sIndex].items[iIndex].sub = e.target.value;
                                  })}
                                  className="px-2 py-1 bg-slate-900 border border-slate-850 rounded text-xxs text-white w-full focus:outline-none"
                                />
                              </div>
                            ) : section.layout === 'text' ? (
                              <div className="pr-4">
                                <textarea
                                  rows={3}
                                  placeholder="Paragraph description..."
                                  value={item.value || ''}
                                  onChange={(e) => updateData((prev) => {
                                    prev.sections[sIndex].items[iIndex].value = e.target.value;
                                  })}
                                  className="w-full px-2 py-1 bg-slate-900 border border-slate-850 rounded text-xxs text-white focus:outline-none resize-y"
                                />
                              </div>
                            ) : (
                              <div className="grid grid-cols-2 gap-2 pr-4">
                                <input
                                  type="text"
                                  placeholder="Label Name"
                                  value={item.label || ''}
                                  onChange={(e) => updateData((prev) => {
                                    prev.sections[sIndex].items[iIndex].label = e.target.value;
                                  })}
                                  className="px-2 py-1 bg-slate-900 border border-slate-850 rounded text-xxs text-white w-full focus:outline-none"
                                />
                                <input
                                  type="text"
                                  placeholder="Detail Value"
                                  value={item.value || ''}
                                  onChange={(e) => updateData((prev) => {
                                    prev.sections[sIndex].items[iIndex].value = e.target.value;
                                  })}
                                  className="px-2 py-1 bg-slate-900 border border-slate-850 rounded text-xxs text-white w-full focus:outline-none"
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                )}
              </div>
            ))}

            {/* CTA Add Section Button */}
            <button
              onClick={addSection}
              className="w-full py-3 bg-slate-900 hover:bg-slate-850 hover:text-rose-500 rounded-xl border border-dashed border-slate-800 font-bold text-xs uppercase tracking-wider text-slate-400 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Add New Section
            </button>

          </div>
        </div>

        {/* Right Side Panel - Zoomable Interactive Live Preview (60%) */}
        <div className="hidden md:flex flex-1 bg-slate-900 flex-col overflow-auto items-center p-8 select-none relative justify-start">
          
          <div 
            id="print-target"
            className={`origin-top transition-transform shadow-2xl rounded-sm ${
              data.theme === 'maroon' ? 'theme-maroon' :
              data.theme === 'gold' ? 'theme-gold' :
              data.theme === 'navy' ? 'theme-navy' :
              data.theme === 'emerald' ? 'theme-emerald' :
              'theme-dark'
            }`}
            style={{
              transform: `scale(${zoom})`,
              marginBottom: `calc(${zoom} * -150px)` // Offset the spacing collapse from absolute scaling
            }}
          >
            {/* The A4 Document layout */}
            <div className="paper">
              
              {/* Header Container */}
              <div className="flex justify-between items-start gap-5 mb-8 border-b-2 border-slate-100 pb-6">
                <div className="flex-1 space-y-4">
                  <div>
                    <span className="text-[10px] font-bold tracking-[4px] uppercase text-[var(--accent)] font-montserrat">
                      Wedding Biodata
                    </span>
                    <h1 
                      className="text-4xl font-extrabold uppercase leading-tight text-[var(--primary)] font-playfair tracking-tight mt-1"
                      dangerouslySetInnerHTML={{ __html: data.name.replace(/\s+/g, '<br>') }}
                    ></h1>
                  </div>

                  {/* Header Contact Block */}
                  <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-xs font-semibold text-[var(--secondary)]">
                    {data.email && (
                      <div className="flex items-center gap-1.5">
                        <svg className="text-[var(--accent)]" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                        <span>{data.email}</span>
                      </div>
                    )}
                    {data.phone && (
                      <div className="flex items-center gap-1.5">
                        <svg className="text-[var(--accent)]" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                        <span>{data.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Profile Photo */}
                <div className="w-[140px] h-[180px] border border-[var(--accent)] p-1 bg-white rounded shadow-sm flex-shrink-0">
                  <div className="w-full h-full border border-dashed border-[var(--accent)] bg-[var(--accent-light)] flex flex-col justify-center items-center text-center overflow-hidden">
                    {data.photo ? (
                      <img src={data.photo} className="w-full h-full object-cover" alt="Profile" />
                    ) : (
                      <div className="text-[9px] font-bold text-[var(--accent)] flex flex-col items-center gap-1.5 opacity-60">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        <span>PHOTO</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Dynamic Pages / Sections Wrapper */}
              <div className="flex-1 space-y-6">
                
                {/* Objective Section */}
                <section className="section space-y-3">
                  <h2 className="text-sm font-extrabold uppercase tracking-[3px] text-[var(--primary)] border-b-2 border-[var(--accent-light)] pb-1.5 font-montserrat">
                    {data.titleObjective}
                  </h2>
                  <p className="text-sm font-sans font-medium text-[var(--primary)] leading-relaxed font-lora italic bg-[var(--accent-light)]/40 p-4 border-l-4 border-[var(--accent)] rounded-r-lg">
                    {data.objectiveContent}
                  </p>
                </section>

                {/* Dynamic sections mapping */}
                {data.sections.map((sec) => (
                  <section key={sec.id} className="section space-y-3">
                    <h2 className="text-sm font-extrabold uppercase tracking-[3px] text-[var(--primary)] border-b-2 border-[var(--accent-light)] pb-1.5 font-montserrat">
                      {sec.title}
                    </h2>
                    {sec.description && (
                      <p className="text-xs font-semibold text-[var(--secondary)] font-lora italic mt-[-8px]">
                        {sec.description}
                      </p>
                    )}

                    {sec.layout === 'academic' ? (
                      <div className="academic-layout space-y-3">
                        {sec.items.map((item) => (
                          <div key={item.id} className="block">
                            <div className="block-tag">{item.tag || 'DEG'}</div>
                            <div className="block-info">
                              <h3 className="block-title">{item.title || 'Program Name'}</h3>
                              <p className="block-sub">{item.sub || 'Institution Details'}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : sec.layout === 'text' ? (
                      <div className="full-width-text space-y-2 text-sm leading-relaxed text-[var(--primary)] font-lora">
                        {sec.items.map((item) => (
                          <p key={item.id}>{item.value}</p>
                        ))}
                      </div>
                    ) : sec.layout === 'simple' ? (
                      <div className="simple-list space-y-2">
                        {sec.items.map((item) => (
                          <div key={item.id} className="flex flex-col gap-0.5">
                            <span className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-wider font-montserrat">
                              {item.label || 'Label'}
                            </span>
                            <span className="text-sm font-semibold text-[var(--primary)] font-lora">
                              {item.value || 'Value'}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="detail-grid">
                        {sec.items.map((item) => (
                          <div key={item.id} className="flex flex-col gap-0.5">
                            <span className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-wider font-montserrat">
                              {item.label || 'Label'}
                            </span>
                            <span className="text-sm font-semibold text-[var(--primary)] font-lora">
                              {item.value || 'Value'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                ))}

              </div>

              {/* A4 Page Footer */}
              <div className="mt-8 border-t border-slate-100 pt-4 flex justify-between items-center text-[9px] font-bold text-slate-400 tracking-widest font-montserrat uppercase">
                <span>BioEditor Studio</span>
                <span>Page 1 of 1</span>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
