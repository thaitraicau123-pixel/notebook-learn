'use client'; import React, { useState } from 'react'; import { Key, ExternalLink, X, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react'; interface ApiKeyModalProps { isOpen: boolean; onClose: () => void; apiKey: string; onSaveApiKey: (key: string) => void; } export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose,
apiKey, onSaveApiKey, }) => { const [keyInput, setKeyInput] = useState(apiKey); const [savedSuccess, setSavedSuccess] = useState(false); if (!isOpen) return null; const handleSave = () => { onSaveApiKey(keyInput.trim()); setSavedSuccess(true); setTimeout(() => { setSavedSuccess(false); onClose(); }, 1000); }; return (
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
<div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl p-6 text-slate-100 relative">
<button
onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
>
<X size={20} />
</button>
<div className="flex items-center gap-3 mb-4">
<div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
<Key size={20} />
</div>
<div>
<h2 className="text-xl font-bold flex items-center gap-2">
Cài Đặt AI API Key
<span className="text-xs font-normal px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
Miễn phí
</span>
</h2>
<p className="text-xs text-slate-400">
Kết nối mô hình AI để phân tích sâu tài liệu không giới hạn kích thước
</p>
</div>
</div>
<div className="space-y-4">
<div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5 text-xs text-slate-300 space-y-2">
<div className="flex items-center gap-2 text-blue-400 font-medium">
<Sparkles size={14} />
<span>Tại sao nên kết nối AI cho việc học?</span>
</div>
<p>
Mô hình AI thế hệ mới với cửa sổ ngữ cảnh cực lớn (hơn 1 triệu tokens), cho phép bạn tải cả cuốn sách giáo trình, luận văn hoặc tài liệu PDF hàng trăm trang và phân tích, hỏi đáp trực tiếp tức thì.
</p>
<div className="pt-1 flex items-center justify-between border-t border-slate-700/50">
<span className="text-slate-400">Chưa có API Key?</span>
<a
href="https://aistudio.google.com/app/apikey"
target="_blank"
rel="noopener noreferrer"
className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 font-medium hover:underline"
>
Nhận mã API Key miễn phí tại đây <ExternalLink size={12} />
</a>
</div>
</div>
<div>
<label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
Nhập API Key của bạn:
</label>
<input
type="password"
value={keyInput} onChange={(e) => setKeyInput(e.target.value)} placeholder="AIzaSy..."
className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
/>
<div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-400">
<ShieldCheck size={13} className="text-emerald-400" />
<span>Key được lưu bảo mật trong trình duyệt của bạn (Local Storage) và không bị chia sẻ.</span>
</div>
</div>
<div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
<button
onClick={onClose} className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
>
Hủy
</button>
<button
onClick={handleSave} className="px-5 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-md flex items-center gap-1.5"
>
{savedSuccess ? (
<>
<CheckCircle2 size={14} className="text-emerald-300" />
<span>Đã Lưu Thành Công</span>
</>
) : (
<span>Lưu Cài Đặt</span>
)} </button>
</div>
</div>
</div>
</div>
); };