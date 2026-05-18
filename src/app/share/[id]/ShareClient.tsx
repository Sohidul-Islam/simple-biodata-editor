'use client';

import React from 'react';
import { BiodataData } from '@/app/actions';
import Link from 'next/link';

interface ShareClientProps {
  biodata: BiodataData;
}

export default function ShareClient({ biodata }: ShareClientProps) {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col antialiased select-text">
      
      {/* Top Premium Floating Header (Hidden during printing) */}
      <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-6 flex justify-between items-center sticky top-0 z-50 flex-shrink-0 shadow-sm no-print">
        <div className="flex items-center gap-3">
          <Link 
            href="/"
            className="w-8 h-8 bg-rose-600 rounded-lg flex items-center justify-center text-white shadow-md shadow-rose-100 hover:scale-105 transition"
            title="Create Your Own Biodata"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </Link>
          <div>
            <h1 className="text-xs font-bold text-slate-800 tracking-wide">
              {biodata.name}'s Biodata
            </h1>
            <p className="text-[9px] text-slate-400 font-semibold tracking-wider uppercase">Public Verified Link</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="px-4 py-2 bg-slate-100 hover:bg-slate-250 text-slate-700 text-xs font-bold rounded-lg transition"
          >
            Create Your Own
          </Link>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-rose-100"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Print / PDF
          </button>
        </div>
      </header>

      {/* Centered Document Canvas */}
      <div className="flex-1 flex justify-center py-10 px-4 overflow-y-auto">
        <div 
          id="print-target"
          className={`shadow-xl rounded-sm ${
            biodata.theme === 'maroon' ? 'theme-maroon' :
            biodata.theme === 'gold' ? 'theme-gold' :
            biodata.theme === 'navy' ? 'theme-navy' :
            biodata.theme === 'emerald' ? 'theme-emerald' :
            'theme-dark'
          }`}
        >
          {/* A4 Paper Document Wrapper */}
          <div className="paper">
            
            {/* Header section */}
            <div className="flex justify-between items-start gap-5 mb-8 border-b-2 border-slate-100 pb-6">
              <div className="flex-1 space-y-4">
                <div>
                  <span className="text-[10px] font-bold tracking-[4px] uppercase text-[var(--accent)] font-montserrat">
                    Wedding Biodata
                  </span>
                  <h1 
                    className="text-4xl font-extrabold uppercase leading-tight text-[var(--primary)] font-playfair tracking-tight mt-1"
                    dangerouslySetInnerHTML={{ __html: biodata.name.replace(/\s+/g, '<br>') }}
                  ></h1>
                </div>

                {/* Contact details */}
                <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-xs font-semibold text-[var(--secondary)]">
                  {biodata.email && (
                    <div className="flex items-center gap-1.5">
                      <svg className="text-[var(--accent)]" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                      <span>{biodata.email}</span>
                    </div>
                  )}
                  {biodata.phone && (
                    <div className="flex items-center gap-1.5">
                      <svg className="text-[var(--accent)]" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                      <span>{biodata.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Profile Photo */}
              <div className="w-[140px] h-[180px] border border-[var(--accent)] p-1 bg-white rounded shadow-sm flex-shrink-0">
                <div className="w-full h-full border border-dashed border-[var(--accent)] bg-[var(--accent-light)] flex flex-col justify-center items-center text-center overflow-hidden">
                  {biodata.photo ? (
                    <img src={biodata.photo} className="w-full h-full object-cover" alt="Profile" />
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

            {/* Dynamic sections mapping */}
            <div className="flex-1 space-y-6">
              
              {/* Objective section */}
              <section className="section space-y-3">
                <h2 className="text-sm font-extrabold uppercase tracking-[3px] text-[var(--primary)] border-b-2 border-[var(--accent-light)] pb-1.5 font-montserrat">
                  {biodata.titleObjective}
                </h2>
                <p className="text-sm font-sans font-medium text-[var(--primary)] leading-relaxed font-lora italic bg-[var(--accent-light)]/40 p-4 border-l-4 border-[var(--accent)] rounded-r-lg">
                  {biodata.objectiveContent}
                </p>
              </section>

              {/* Loop dynamic sections */}
              {biodata.sections.map((sec) => (
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
  );
}
