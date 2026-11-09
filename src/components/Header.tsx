'use client'; import React from 'react'; import { BookOpen, Sparkles, Key, FileText, CheckCircle2, Database } from 'lucide-react'; interface HeaderProps { sourceCount: number; totalWords: number; hasApiKey: boolean; onOpenApiKeyModal: () => void; onResetSampleData: () => void; } export const Header: React.FC<HeaderProps> = ({ sourceCount,
totalWords, hasApiKey, onOpenApiKeyModal, onResetSampleData, }) => { return (
<header className="h-16 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40">
{} <div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
<BookOpen size={20} className="stroke-[2.2]" />
</div>
<div>
<div className="flex items-center gap-2">
<span className="font-bold text-lg text-white tracking-tight">NotebookLearn</span>
<span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-300 flex items-center gap-1">
<Sparkles size={10} className="text-indigo-400" />
AI Core Pro
</span>
</div>
<p className="text-[11px] text-slate-400 hidden sm:block">
Không gian học tập &amp; tổng hợp tài liệu thông minh
</p>
</div>
</div>
{} <div className="flex items-center gap-2 sm:gap-3">
{} <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
<Database size={13} className="text-emerald-400" />
<span>Lưu Tự Động Vào Máy</span>
<span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
</div>
{} <div className="hidden md:flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300">
<div className="flex items-center gap-1.5">
<FileText size={13} className="text-blue-400" />
<span>{sourceCount} tài liệu</span>
</div>
<span className="w-1 h-1 rounded-full bg-slate-600" />
<span className="text-slate-400">~{totalWords.toLocaleString('vi-VN')} từ</span>
</div>
{} <button
onClick={onOpenApiKeyModal} className={`px-3 py-1.5 text-xs rounded-xl border flex items-center gap-1.5 transition-all shadow-sm ${ hasApiKey
? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/50'
: 'bg-amber-950/30 border-amber-500/40 text-amber-300 hover:bg-amber-900/40'
}`} >
<Key size={13} />
{hasApiKey ? (
<>
<span className="hidden sm:inline">Mô hình AI:</span>
<span className="font-semibold flex items-center gap-1">
Đã kết nối <CheckCircle2 size={12} className="text-emerald-400" />
</span>
</>
) : (
<>
<span className="font-semibold">Cài đặt API Key</span>
<span className="hidden sm:inline text-amber-400/80">(Bản dùng thử)</span>
</>
)} </button>
</div>
</header>
); };