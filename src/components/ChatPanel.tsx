'use client'; import React, { useState, useRef, useEffect } from 'react'; import { Send, Sparkles, Bot, User, Quote, Loader2, Trash2, HelpCircle, BookOpen, } from 'lucide-react'; import { ChatMessage, Citation } from '@/lib/types'; interface ChatPanelProps { messages: ChatMessage[]; onSendMessage: (content: string) => Promise<void>;
onClearChat: () => void; isSending: boolean; selectedSourcesCount: number; } export const ChatPanel: React.FC<ChatPanelProps> = ({ messages, onSendMessage, onClearChat, isSending, selectedSourcesCount, }) => { const [input, setInput] = useState(''); const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null);
const scrollRef = useRef<HTMLDivElement>(null); useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isSending]); const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); if (!input.trim() || isSending) return; onSendMessage(input.trim()); setInput(''); }; const quickPrompts = [
'Tóm tắt 3 ý quan trọng nhất', 'Khái niệm nào là cốt lõi cần nhớ?', 'Giải thích đơn giản như kỹ thuật Feynman', 'Cho một ví dụ thực tế minh họa', ]; return (
<div className="flex flex-col h-full bg-slate-900/60 border-l border-slate-800/80 w-full relative">
{} <div className="p-4 border-b border-slate-800 flex items-center justify-between">
<div className="flex items-center gap-2.5">
<div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
<Bot size={18} />
</div>
<div>
<h2 className="text-sm font-bold text-white flex items-center gap-1.5">
Trợ lý Học tập AI
</h2>
<p className="text-[11px] text-slate-400">
{selectedSourcesCount > 0
? `Đang tra cứu trên ${selectedSourcesCount} nguồn`
: 'Chưa chọn nguồn tài liệu'} </p>
</div>
</div>
{messages.length > 0 && (
<button
onClick={onClearChat} className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors text-xs"
title="Xóa lịch sử chat"
>
<Trash2 size={14} />
</button>
)} </div>
{} <div className="flex-1 overflow-y-auto p-4 space-y-4">
{messages.length === 0 ? (
<div className="h-full flex flex-col justify-center items-center text-center p-4 text-slate-400 space-y-4">
<div className="w-12 h-12 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-center text-blue-400">
<Sparkles size={22} />
</div>
<div>
<p className="text-xs font-semibold text-slate-300">Hỏi đáp trực tiếp với tài liệu</p>
<p className="text-[11px] text-slate-500 mt-1 max-w-[240px]">
Mọi câu trả lời của trợ lý đều được bảo chứng bằng trích dẫn chuẩn xác từ tài liệu của bạn.
</p>
</div>
{} <div className="w-full space-y-1.5 pt-2">
<p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider text-left pl-1">
Gợi ý câu hỏi nhanh:
</p>
{quickPrompts.map((prompt, idx) => (
<button
key={idx} onClick={() => onSendMessage(prompt)} className="w-full text-left p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-xs text-slate-300 hover:text-white transition-all line-clamp-1"
>
💡 {prompt} </button>
))} </div>
</div>
) : (
messages.map((msg) => (
<div
key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`} >
<div
className={`max-w-[90%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${ msg.role === 'user'
? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
: 'bg-slate-800/90 text-slate-200 border border-slate-700/80'
}`} >
<div className="flex items-center gap-1.5 mb-1 opacity-70 text-[10px] uppercase font-semibold tracking-wider">
{msg.role === 'user' ? (
<>
<User size={12} />
<span>Bạn</span>
</>
) : (
<>
<Bot size={12} className="text-blue-400" />
<span>Trợ lý NotebookLM</span>
</>
)} </div>
<div className="whitespace-pre-wrap font-sans">{msg.content}</div>
{} {msg.citations && msg.citations.length > 0 && (
<div className="mt-3 pt-2.5 border-t border-slate-700/70 space-y-1.5">
<div className="flex items-center gap-1 text-[10px] font-semibold text-blue-300">
<Quote size={11} />
<span>Nguồn trích dẫn ({msg.citations.length}):</span>
</div>
<div className="flex flex-wrap gap-1.5">
{msg.citations.map((cite, cIdx) => (
<button
key={cIdx} onClick={() => setSelectedCitation(cite)} className="px-2 py-0.5 rounded-md bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-[11px] text-blue-300 flex items-center gap-1 transition-colors text-left"
title="Xem trích đoạn gốc"
>
<BookOpen size={10} />
<span className="truncate max-w-[140px]">{cite.sourceName}</span>
</button>
))} </div>
</div>
)} </div>
</div>
))
)} {isSending && (
<div className="flex items-center gap-2 text-xs text-slate-400 p-2">
<Loader2 size={14} className="animate-spin text-blue-400" />
<span>AI đang tra cứu tài liệu và đối chiếu trích dẫn...</span>
</div>
)} <div ref={scrollRef} />
</div>
{} <div className="p-3 border-t border-slate-800 bg-slate-950/60">
<form onSubmit={handleSubmit} className="relative flex items-center">
<input
type="text"
value={input} onChange={(e) => setInput(e.target.value)} placeholder={ selectedSourcesCount === 0
? 'Hãy chọn nguồn tài liệu ở cột trái để hỏi đáp...'
: 'Đặt câu hỏi về tài liệu (ví dụ: So sánh A và B)...'
} disabled={selectedSourcesCount === 0 || isSending} className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-3.5 pr-11 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
/>
<button
type="submit"
disabled={!input.trim() || isSending || selectedSourcesCount === 0} className="absolute right-1.5 p-2 rounded-lg bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-30 text-white transition-all shadow-md shadow-blue-500/20"
>
<Send size={14} />
</button>
</form>
</div>
{} {selectedCitation && (
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
<div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-5 text-slate-100 shadow-2xl relative">
<div className="flex items-center justify-between pb-3 border-b border-slate-800">
<div className="flex items-center gap-2 text-blue-400 text-xs font-semibold">
<Quote size={16} />
<span>Trích đoạn từ: {selectedCitation.sourceName}</span>
</div>
<button
onClick={() => setSelectedCitation(null)} className="text-slate-400 hover:text-white p-1 rounded-lg"
>
✕
</button>
</div>
<div className="mt-3 p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs sm:text-sm text-slate-200 leading-relaxed italic">
&ldquo;{selectedCitation.quote}&rdquo; </div>
{selectedCitation.relevance && (
<p className="mt-2 text-[11px] text-slate-400">
Ngữ cảnh: {selectedCitation.relevance} </p>
)} </div>
</div>
)} </div>
); };