'use client'; import React, { useRef, useState } from 'react'; import { Upload, FileText, FileCode, FileSpreadsheet, CheckSquare, Square, Eye, Trash2, Plus, Loader2, AlertCircle, FileUp, Presentation, } from 'lucide-react'; import { SourceDocument } from '@/lib/types'; interface SourcePanelProps { sources: SourceDocument[];
onToggleSelect: (id: string) => void; onToggleSelectAll: () => void; onDeleteSource: (id: string) => void; onPreviewSource: (doc: SourceDocument) => void; onOpenAddText: () => void; onUploadFile: (file: File) => Promise<void>; isUploading: boolean; } export const SourcePanel: React.FC<SourcePanelProps> = ({ sources, onToggleSelect,
onToggleSelectAll, onDeleteSource, onPreviewSource, onOpenAddText, onUploadFile, isUploading, }) => { const fileInputRef = useRef<HTMLInputElement>(null); const [isDragging, setIsDragging] = useState(false); const [uploadError, setUploadError] = useState<string | null>(null); const selectedCount = sources.filter((s) => s.selected).length;
const allSelected = sources.length > 0 && selectedCount === sources.length; const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (!file) return; setUploadError(null); try { await onUploadFile(file); } catch (err) {
setUploadError(err instanceof Error ? err.message : 'Lỗi khi tải file'); } finally { if (fileInputRef.current) fileInputRef.current.value = ''; } }; const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); }; const handleDragLeave = () => { setIsDragging(false); };
const handleDrop = async (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); const file = e.dataTransfer.files?.[0]; if (!file) return; setUploadError(null); try { await onUploadFile(file); } catch (err) { setUploadError(err instanceof Error ? err.message : 'Lỗi khi tải file'); } };
const getDocIcon = (type: SourceDocument['type']) => { switch (type) { case 'pdf':
return <FileText className="text-rose-400" size={17} />; case 'docx':
return <FileSpreadsheet className="text-blue-400" size={17} />; case 'pptx':
return <Presentation className="text-orange-400" size={17} />; case 'md':
return <FileCode className="text-emerald-400" size={17} />; default:
return <FileText className="text-amber-400" size={17} />; } }; return (
<div className="flex flex-col h-full bg-slate-900/50 border-r border-slate-800/80 w-full">
{} <div className="p-4 border-b border-slate-800 flex items-center justify-between">
<div>
<h2 className="text-sm font-bold text-white flex items-center gap-2">
Nguồn tài liệu
<span className="text-[11px] font-normal text-slate-400 px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700">
{selectedCount}/{sources.length} đã chọn
</span>
</h2>
<p className="text-[11px] text-slate-400 mt-0.5">
AI chỉ trả lời dựa trên các nguồn được chọn
</p>
</div>
{sources.length > 0 && (
<button
onClick={onToggleSelectAll} className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 transition-colors"
title={allSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả'} >
{allSelected ? <CheckSquare size={14} className="text-blue-400" /> : <Square size={14} />} <span className="text-[11px]">{allSelected ? 'Tất cả' : 'Chọn hết'}</span>
</button>
)} </div>
{} <div className="p-3.5 space-y-2 border-b border-slate-800/60 bg-slate-950/30">
<input
ref={fileInputRef} type="file"
accept=".pdf,.docx,.pptx,.ppt,.txt,.md,application/pdf,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
className="hidden"
onChange={handleFileChange} />
<div className="grid grid-cols-2 gap-2">
<button
onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50 text-white rounded-xl shadow-md shadow-blue-500/20 transition-all"
>
{isUploading ? (
<Loader2 size={14} className="animate-spin" />
) : (
<Upload size={14} />
)} <span>Tải file lên</span>
</button>
<button
onClick={onOpenAddText} className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 active:bg-slate-750 text-slate-200 border border-slate-700 rounded-xl transition-all"
>
<Plus size={14} />
<span>Dán văn bản</span>
</button>
</div>
{} <div
onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()} className={`border border-dashed rounded-xl p-3 text-center cursor-pointer transition-colors ${ isDragging
? 'border-blue-500 bg-blue-500/10 text-blue-300'
: 'border-slate-800 hover:border-slate-700 hover:bg-slate-800/30 text-slate-400'
}`} >
<FileUp size={18} className="mx-auto mb-1 text-slate-500" />
<p className="text-[11px] font-medium text-slate-300">Kéo thả PDF, Word, PowerPoint (PPTX), TXT vào đây</p>
<p className="text-[10px] text-slate-500 mt-0.5">Tự động trích xuất nội dung văn bản từng slide</p>
</div>
{uploadError && (
<div className="flex items-start gap-2 p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
<AlertCircle size={14} className="shrink-0 mt-0.5 text-rose-400" />
<span>{uploadError}</span>
</div>
)} </div>
{} <div className="flex-1 overflow-y-auto p-3 space-y-2">
{sources.length === 0 ? (
<div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-3">
<div className="w-12 h-12 rounded-2xl bg-slate-800/50 flex items-center justify-center text-slate-600">
<FileText size={24} />
</div>
<div>
<p className="text-xs font-semibold text-slate-400">Chưa có tài liệu nguồn</p>
<p className="text-[11px] text-slate-500 mt-1 max-w-[200px]">
Hãy tải lên sách giáo trình, ghi chú, bài báo để bắt đầu học tập.
</p>
</div>
</div>
) : (
sources.map((doc) => (
<div
key={doc.id} className={`group flex items-start gap-2.5 p-3 rounded-xl border transition-all ${ doc.selected
? 'bg-slate-800/80 border-slate-700 shadow-sm'
: 'bg-slate-900/30 border-slate-800/60 opacity-60 hover:opacity-90'
}`} >
{} <button
onClick={() => onToggleSelect(doc.id)} className="mt-0.5 text-slate-400 hover:text-white transition-colors"
title={doc.selected ? 'Bỏ chọn nguồn này' : 'Chọn nguồn này'} >
{doc.selected ? (
<CheckSquare size={16} className="text-blue-400" />
) : (
<Square size={16} />
)} </button>
{} <div
className="flex-1 min-w-0 cursor-pointer"
onClick={() => onToggleSelect(doc.id)} >
<div className="flex items-center gap-1.5">
{getDocIcon(doc.type)} <span className="text-xs font-medium text-slate-200 truncate">
{doc.name} </span>
</div>
<div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
<span className="uppercase font-semibold tracking-wider text-[9px] px-1 py-0.2 rounded bg-slate-800 text-slate-300">
{doc.type} </span>
<span>{doc.wordCount.toLocaleString()} từ</span>
<span>•</span>
<span>{doc.uploadedAt}</span>
</div>
</div>
{} <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
<button
onClick={() => onPreviewSource(doc)} className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-700/60 rounded-md transition-colors"
title="Xem nhanh nội dung trích xuất"
>
<Eye size={13} />
</button>
<button
onClick={() => onDeleteSource(doc.id)} className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors"
title="Xóa tài liệu"
>
<Trash2 size={13} />
</button>
</div>
</div>
))
)} </div>
</div>
); };