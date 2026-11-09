'use client'; import React, { useState } from 'react'; import { X, FileText, Plus, Copy, Check } from 'lucide-react'; import { SourceDocument } from '@/lib/types'; interface DocumentModalProps { previewDoc: SourceDocument | null; onClosePreview: () => void; isAddTextOpen: boolean; onCloseAddText: () => void;
onAddTextDocument: (title: string, content: string) => void; } export const DocumentModal: React.FC<DocumentModalProps> = ({ previewDoc, onClosePreview, isAddTextOpen, onCloseAddText, onAddTextDocument, }) => { const [textTitle, setTextTitle] = useState(''); const [textContent, setTextContent] = useState('');
const [copied, setCopied] = useState(false); const handleAddText = (e: React.FormEvent) => { e.preventDefault(); if (!textContent.trim()) return; onAddTextDocument(textTitle.trim() || 'Ghi chú tự tạo.txt', textContent.trim()); setTextTitle(''); setTextContent(''); onCloseAddText(); }; const handleCopyText = () => { if (!previewDoc) return;
navigator.clipboard.writeText(previewDoc.content); setCopied(true); setTimeout(() => setCopied(false), 1500); }; if (previewDoc) { return (
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
<div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl p-6 text-slate-100 relative">
<div className="flex items-center justify-between pb-4 border-b border-slate-800">
<div className="flex items-center gap-3">
<div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
<FileText size={18} />
</div>
<div>
<h3 className="font-semibold text-white text-base truncate max-w-md">
{previewDoc.name} </h3>
<p className="text-xs text-slate-400">
{previewDoc.wordCount.toLocaleString()} từ • {previewDoc.charCount.toLocaleString()} ký tự • {previewDoc.uploadedAt} </p>
</div>
</div>
<div className="flex items-center gap-2">
<button
onClick={handleCopyText} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 text-xs"
title="Sao chép toàn bộ văn bản"
>
{copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />} <span>{copied ? 'Đã chép' : 'Sao chép'}</span>
</button>
<button
onClick={onClosePreview} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
>
<X size={18} />
</button>
</div>
</div>
<div className="flex-1 overflow-y-auto mt-4 pr-2 text-sm text-slate-300 leading-relaxed font-mono whitespace-pre-wrap bg-slate-950/70 p-4 rounded-xl border border-slate-800/80">
{previewDoc.content} </div>
</div>
</div>
); } if (isAddTextOpen) { return (
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
<div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl p-6 text-slate-100 relative">
<div className="flex items-center justify-between pb-4 border-b border-slate-800">
<div className="flex items-center gap-2.5">
<div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
<Plus size={18} />
</div>
<div>
<h3 className="font-semibold text-white text-base">Dán văn bản hoặc ghi chú bài học</h3>
<p className="text-xs text-slate-400">Thêm nguồn tài liệu nhanh không cần tải file</p>
</div>
</div>
<button
onClick={onCloseAddText} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
>
<X size={18} />
</button>
</div>
<form onSubmit={handleAddText} className="mt-4 space-y-4">
<div>
<label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
Tiêu đề tài liệu / Chương học:
</label>
<input
type="text"
value={textTitle} onChange={(e) => setTextTitle(e.target.value)} placeholder="Ví dụ: Chương 3 - Các định lý xác suất thống kê"
className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
/>
</div>
<div>
<label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
Nội dung văn bản (Bài giảng, trích đoạn sách, ghi chép):
</label>
<textarea
value={textContent} onChange={(e) => setTextContent(e.target.value)} rows={8} placeholder="Dán nội dung tài liệu học tập của bạn vào đây..."
required
className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none font-sans"
/>
</div>
<div className="flex items-center justify-end gap-3 pt-2">
<button
type="button"
onClick={onCloseAddText} className="px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
>
Hủy
</button>
<button
type="submit"
disabled={!textContent.trim()} className="px-5 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl shadow-lg shadow-indigo-500/25 transition-all"
>
Thêm vào nguồn học
</button>
</div>
</form>
</div>
</div>
); } return null; };