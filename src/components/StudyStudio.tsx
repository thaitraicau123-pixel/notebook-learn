'use client'; import React, { useState, useEffect, useRef } from 'react'; import { BookOpen, Sparkles, HelpCircle, CheckCircle, RotateCw, Copy, Check, ChevronLeft, ChevronRight, Shuffle, Play, Pause, Square, Volume2, RefreshCw, Lightbulb, ListCheck, Award, Layers, Headphones, CheckCircle2, XCircle, Presentation, } from 'lucide-react';
import { StudyGuide, Flashcard, QuizQuestion, AudioOverview, SlideDeck } from '@/lib/types'; interface StudyStudioProps { studyGuide: StudyGuide; flashcards: Flashcard[]; quiz: QuizQuestion[]; audioOverview: AudioOverview; slideDeck: SlideDeck; onRegenerateStudyGuide: () => Promise<void>; onRegenerateFlashcards: () => Promise<void>;
onRegenerateQuiz: () => Promise<void>; onRegenerateAudio: () => Promise<void>; onRegenerateSlides: () => Promise<void>; isGenerating: boolean; selectedSourcesCount: number; } export const StudyStudio: React.FC<StudyStudioProps> = ({ studyGuide, flashcards, quiz, audioOverview, slideDeck, onRegenerateStudyGuide, onRegenerateFlashcards,
onRegenerateQuiz, onRegenerateAudio, onRegenerateSlides, isGenerating, selectedSourcesCount, }) => { const [activeTab, setActiveTab] = useState<'guide' | 'flashcards' | 'quiz' | 'audio' | 'slides'>('guide'); const [currentSlideIndex, setCurrentSlideIndex] = useState(0); const [copiedSlides, setCopiedSlides] = useState(false);
const [currentCardIndex, setCurrentCardIndex] = useState(0); const [isFlipped, setIsFlipped] = useState(false); const [localFlashcards, setLocalFlashcards] = useState<Flashcard[]>(flashcards); useEffect(() => { setLocalFlashcards(flashcards); setCurrentCardIndex(0); setIsFlipped(false); }, [flashcards]);
const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({}); const [showExplanation, setShowExplanation] = useState<Record<number, boolean>>({}); const [isPlayingAudio, setIsPlayingAudio] = useState(false); const [currentDialogueIndex, setCurrentDialogueIndex] = useState<number>(-1);
const [speechRate, setSpeechRate] = useState<number>(1.0); const synthRef = useRef<SpeechSynthesis | null>(null); const [copiedGuide, setCopiedGuide] = useState(false); useEffect(() => { if (typeof window !== 'undefined') { synthRef.current = window.speechSynthesis; } return () => { if (synthRef.current) { synthRef.current.cancel(); } }; }, []);
const currentCard = localFlashcards[currentCardIndex] || localFlashcards[0]; const handleNextCard = () => { setIsFlipped(false); setCurrentCardIndex((prev) => (prev + 1) % localFlashcards.length); }; const handlePrevCard = () => { setIsFlipped(false); setCurrentCardIndex((prev) => (prev - 1 + localFlashcards.length) % localFlashcards.length); };
const handleToggleMastered = (id: string) => { setLocalFlashcards((prev) =>
prev.map((card) => (card.id === id ? { ...card, mastered: !card.mastered } : card))
); }; const handleShuffleCards = () => { setIsFlipped(false); setLocalFlashcards((prev) => [...prev].sort(() => Math.random() - 0.5)); setCurrentCardIndex(0); }; const handleSelectAnswer = (qIndex: number, optionIndex: number) => { if (selectedAnswers[qIndex] !== undefined) return; // Answered already
setSelectedAnswers((prev) => ({ ...prev, [qIndex]: optionIndex })); setShowExplanation((prev) => ({ ...prev, [qIndex]: true })); }; const handleResetQuiz = () => { setSelectedAnswers({}); setShowExplanation({}); }; const quizScore = Object.entries(selectedAnswers).reduce((acc, [qIdx, ansIdx]) => { const question = quiz[Number(qIdx)];
return question && question.correctIndex === ansIdx ? acc + 1 : acc; }, 0); const speakDialogueItem = (index: number) => { if (!synthRef.current || !audioOverview.dialogue[index]) { setIsPlayingAudio(false); setCurrentDialogueIndex(-1); return; } synthRef.current.cancel(); setCurrentDialogueIndex(index);
const item = audioOverview.dialogue[index]; const utterance = new SpeechSynthesisUtterance(item.text); utterance.rate = speechRate; const isVietnamese = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(item.text); if (isVietnamese) { const voices = synthRef.current.getVoices();
const viVoice = voices.find((v) => v.lang.startsWith('vi')); if (viVoice) utterance.voice = viVoice; } utterance.onend = () => { if (index + 1 < audioOverview.dialogue.length) { speakDialogueItem(index + 1); } else { setIsPlayingAudio(false); setCurrentDialogueIndex(-1); } }; utterance.onerror = () => { setIsPlayingAudio(false);
setCurrentDialogueIndex(-1); }; synthRef.current.speak(utterance); }; const handleTogglePlayAudio = () => { if (!synthRef.current) return; if (isPlayingAudio) { synthRef.current.cancel(); setIsPlayingAudio(false); } else { setIsPlayingAudio(true); const startIndex = currentDialogueIndex >= 0 ? currentDialogueIndex : 0;
speakDialogueItem(startIndex); } }; const handleStopAudio = () => { if (synthRef.current) { synthRef.current.cancel(); } setIsPlayingAudio(false); setCurrentDialogueIndex(-1); }; const handleCopyGuide = () => { const markdown = `# ${studyGuide.title}\n\n## Tóm tắt\n${studyGuide.summary}\n\n## Khái niệm cốt lõi\n${studyGuide.keyConcepts
.map((c) => `- **${c.term}**: ${c.definition}`)
.join('\n')}\n\n## Điểm then chốt\n${studyGuide.takeaways.map((t) => `- ${t}`).join('\n')}`; navigator.clipboard.writeText(markdown); setCopiedGuide(true); setTimeout(() => setCopiedGuide(false), 2000); }; const handleCopySlides = () => { const markdown = `# ${slideDeck.title}\n\n${slideDeck.slides
.map(
(s) =>
`## Slide ${s.slideNumber}: ${s.title}\n${s.bullets.map((b) => `- ${b}`).join('\n')}${ s.speakerNotes ? `\n> Gợi ý thuyết trình: ${s.speakerNotes}` : ''
}`
)
.join('\n\n---\n\n')}`; navigator.clipboard.writeText(markdown); setCopiedSlides(true); setTimeout(() => setCopiedSlides(false), 2000); }; const currentSlide = slideDeck.slides[currentSlideIndex] || slideDeck.slides[0]; return (
<div className="flex flex-col h-full bg-slate-950/40 w-full overflow-hidden">
{} <div className="flex items-center justify-between px-6 pt-3 border-b border-slate-800 bg-slate-900/40">
<div className="flex items-center gap-1 sm:gap-2">
<button
onClick={() => setActiveTab('guide')} className={`flex items-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl transition-all border-b-2 ${ activeTab === 'guide'
? 'text-blue-400 border-blue-500 bg-slate-800/40'
: 'text-slate-400 hover:text-slate-200 border-transparent'
}`} >
<BookOpen size={16} />
<span>Cẩm nang học tập</span>
</button>
<button
onClick={() => setActiveTab('flashcards')} className={`flex items-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl transition-all border-b-2 ${ activeTab === 'flashcards'
? 'text-blue-400 border-blue-500 bg-slate-800/40'
: 'text-slate-400 hover:text-slate-200 border-transparent'
}`} >
<Layers size={16} />
<span>Flashcards ({localFlashcards.length})</span>
</button>
<button
onClick={() => setActiveTab('quiz')} className={`flex items-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl transition-all border-b-2 ${ activeTab === 'quiz'
? 'text-blue-400 border-blue-500 bg-slate-800/40'
: 'text-slate-400 hover:text-slate-200 border-transparent'
}`} >
<ListCheck size={16} />
<span>Trắc nghiệm ({quiz.length})</span>
</button>
<button
onClick={() => setActiveTab('audio')} className={`flex items-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl transition-all border-b-2 ${ activeTab === 'audio'
? 'text-indigo-400 border-indigo-500 bg-slate-800/40'
: 'text-slate-400 hover:text-slate-200 border-transparent'
}`} >
<Headphones size={16} />
<span className="flex items-center gap-1.5">
Audio Podcast
<span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
</span>
</button>
<button
onClick={() => setActiveTab('slides')} className={`flex items-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl transition-all border-b-2 ${ activeTab === 'slides'
? 'text-orange-400 border-orange-500 bg-slate-800/40'
: 'text-slate-400 hover:text-slate-200 border-transparent'
}`} >
<Presentation size={16} />
<span>Slide PowerPoint ({slideDeck.slides.length})</span>
</button>
</div>
{} <div className="pb-2">
{activeTab === 'guide' && (
<button
onClick={onRegenerateStudyGuide} disabled={isGenerating || selectedSourcesCount === 0} className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700/80 rounded-xl transition-all flex items-center gap-1.5 disabled:opacity-50"
title="Phân tích và tạo lại cẩm nang"
>
<RefreshCw size={12} className={isGenerating ? 'animate-spin text-blue-400' : ''} />
<span className="hidden sm:inline">Làm mới cẩm nang</span>
</button>
)} {activeTab === 'flashcards' && (
<button
onClick={onRegenerateFlashcards} disabled={isGenerating || selectedSourcesCount === 0} className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700/80 rounded-xl transition-all flex items-center gap-1.5 disabled:opacity-50"
title="Tạo bộ thẻ mới từ tài liệu"
>
<Sparkles size={12} className={isGenerating ? 'animate-spin text-blue-400' : ''} />
<span className="hidden sm:inline">Tạo bộ thẻ mới</span>
</button>
)} {activeTab === 'quiz' && (
<button
onClick={onRegenerateQuiz} disabled={isGenerating || selectedSourcesCount === 0} className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700/80 rounded-xl transition-all flex items-center gap-1.5 disabled:opacity-50"
title="Tạo đề thi trắc nghiệm mới"
>
<RotateCw size={12} className={isGenerating ? 'animate-spin text-blue-400' : ''} />
<span className="hidden sm:inline">Tạo đề thi mới</span>
</button>
)} {activeTab === 'audio' && (
<button
onClick={onRegenerateAudio} disabled={isGenerating || selectedSourcesCount === 0} className="px-3 py-1.5 text-xs font-medium text-indigo-300 hover:text-white bg-indigo-950/40 hover:bg-indigo-900/50 border border-indigo-700/60 rounded-xl transition-all flex items-center gap-1.5 disabled:opacity-50"
title="Tạo kịch bản podcast mới"
>
<Sparkles size={12} className={isGenerating ? 'animate-spin text-indigo-400' : ''} />
<span className="hidden sm:inline">Viết lại Podcast</span>
</button>
)} {activeTab === 'slides' && (
<button
onClick={onRegenerateSlides} disabled={isGenerating || selectedSourcesCount === 0} className="px-3 py-1.5 text-xs font-medium text-orange-300 hover:text-white bg-orange-950/40 hover:bg-orange-900/50 border border-orange-700/60 rounded-xl transition-all flex items-center gap-1.5 disabled:opacity-50"
title="Tạo lại bộ slide thuyết trình"
>
<Sparkles size={12} className={isGenerating ? 'animate-spin text-orange-400' : ''} />
<span className="hidden sm:inline">Tạo lại Slide</span>
</button>
)} </div>
</div>
{} <div className="flex-1 overflow-y-auto p-6">
{} {activeTab === 'guide' && (
<div className="max-w-4xl mx-auto space-y-6">
{} <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-850 to-blue-950/30 border border-slate-800 shadow-xl relative overflow-hidden">
<div className="flex items-start justify-between gap-4">
<div>
<div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-2.5">
<Sparkles size={12} /> Cẩm nang tổng hợp thông minh
</div>
<h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
{studyGuide.title} </h1>
</div>
<button
onClick={handleCopyGuide} className="px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5 shrink-0"
>
{copiedGuide ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />} <span>{copiedGuide ? 'Đã sao chép' : 'Sao chép Markdown'}</span>
</button>
</div>
{} <div className="mt-4 pt-4 border-t border-slate-800/80 text-sm text-slate-300 leading-relaxed space-y-2">
<p>{studyGuide.summary}</p>
</div>
</div>
{} <div className="space-y-3">
<div className="flex items-center gap-2 text-white font-semibold text-base">
<Lightbulb size={18} className="text-amber-400" />
<h2>Khái niệm &amp; Định nghĩa cốt lõi</h2>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
{studyGuide.keyConcepts.map((concept, idx) => (
<div
key={idx} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-2 shadow-sm"
>
<div className="flex items-center justify-between gap-2">
<span className="text-sm font-bold text-blue-300">{concept.term}</span>
{concept.importance && (
<span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700/60">
{concept.importance} </span>
)} </div>
<p className="text-xs text-slate-300 leading-relaxed">{concept.definition}</p>
</div>
))} </div>
</div>
{} <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
<div className="flex items-center gap-2 text-white font-semibold text-base">
<Award size={18} className="text-emerald-400" />
<h2>Điểm đúc kết then chốt (Key Takeaways)</h2>
</div>
<ul className="space-y-2.5">
{studyGuide.takeaways.map((takeaway, idx) => (
<li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
<CheckCircle size={16} className="text-emerald-400 shrink-0 mt-0.5" />
<span>{takeaway}</span>
</li>
))} </ul>
</div>
{} {studyGuide.faqs && studyGuide.faqs.length > 0 && (
<div className="space-y-3">
<div className="flex items-center gap-2 text-white font-semibold text-base">
<HelpCircle size={18} className="text-indigo-400" />
<h2>Câu hỏi thường gặp trong tài liệu</h2>
</div>
<div className="space-y-2.5">
{studyGuide.faqs.map((faq, idx) => (
<div
key={idx} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1.5"
>
<h3 className="text-sm font-semibold text-indigo-300">{faq.question}</h3>
<p className="text-xs text-slate-300 leading-relaxed">{faq.answer}</p>
</div>
))} </div>
</div>
)} </div>
)} {} {activeTab === 'flashcards' && (
<div className="max-w-2xl mx-auto space-y-6">
<div className="flex items-center justify-between text-xs text-slate-400">
<div className="flex items-center gap-2">
<span>
Thẻ <strong>{currentCardIndex + 1}</strong> / {localFlashcards.length} </span>
<span className="w-1 h-1 rounded-full bg-slate-600" />
<span className="text-emerald-400">
{localFlashcards.filter((c) => c.mastered).length} đã thuộc
</span>
</div>
<div className="flex items-center gap-2">
<button
onClick={handleShuffleCards} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1"
title="Xáo trộn thứ tự thẻ"
>
<Shuffle size={14} />
<span>Xáo trộn</span>
</button>
</div>
</div>
{} {currentCard && (
<div
onClick={() => setIsFlipped(!isFlipped)} className="w-full h-80 cursor-pointer select-none perspective-1000 group"
>
<div
className={`w-full h-full relative duration-500 rounded-3xl p-8 border shadow-2xl transition-transform transform-style-3d ${ isFlipped
? 'rotate-y-180 bg-gradient-to-br from-indigo-950/70 via-slate-900 to-slate-950 border-indigo-500/50'
: 'bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 border-slate-750 group-hover:border-slate-600'
}`} >
{} <div
className={`absolute inset-0 p-8 flex flex-col justify-between backface-hidden ${ isFlipped ? 'invisible' : 'visible'
}`} >
<div className="flex items-center justify-between">
<span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
{currentCard.category || 'Câu hỏi'} </span>
<span className="text-xs text-slate-400">Chạm để lật đáp án</span>
</div>
<div className="text-center my-auto px-4">
<h3 className="text-lg sm:text-xl font-bold text-white leading-relaxed">
{currentCard.question} </h3>
</div>
<div className="text-center text-[11px] text-slate-400 flex items-center justify-center gap-1">
<RotateCw size={12} />
<span>Bấm chuột vào thẻ để xem câu trả lời</span>
</div>
</div>
{} <div
className={`absolute inset-0 p-8 flex flex-col justify-between rotate-y-180 backface-hidden ${ isFlipped ? 'visible' : 'invisible'
}`} >
<div className="flex items-center justify-between">
<span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
Đáp án &amp; Lời giải
</span>
<span className="text-xs text-indigo-300">Chạm để lật câu hỏi</span>
</div>
<div className="text-center my-auto px-4">
<p className="text-base sm:text-lg text-indigo-100 font-medium leading-relaxed">
{currentCard.answer} </p>
</div>
<div className="flex items-center justify-center gap-2">
<button
onClick={(e) => { e.stopPropagation(); handleToggleMastered(currentCard.id); }} className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${ currentCard.mastered
? 'bg-emerald-500 text-white'
: 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
}`} >
<Check size={14} />
<span>{currentCard.mastered ? 'Đã nắm vững' : 'Đánh dấu đã thuộc'}</span>
</button>
</div>
</div>
</div>
</div>
)} {} <div className="flex items-center justify-between px-4">
<button
onClick={handlePrevCard} className="p-3 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800 rounded-2xl transition-all flex items-center gap-2 text-sm"
>
<ChevronLeft size={18} />
<span>Thẻ trước</span>
</button>
<button
onClick={() => setIsFlipped(!isFlipped)} className="px-5 py-2.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 border border-slate-700 rounded-xl transition-all flex items-center gap-1.5"
>
<RotateCw size={14} />
<span>Lật mặt thẻ</span>
</button>
<button
onClick={handleNextCard} className="p-3 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800 rounded-2xl transition-all flex items-center gap-2 text-sm"
>
<span>Thẻ tiếp theo</span>
<ChevronRight size={18} />
</button>
</div>
{} <div className="pt-6 border-t border-slate-800 space-y-3">
<h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
Danh mục toàn bộ thẻ ghi nhớ:
</h4>
<div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
{localFlashcards.map((c, idx) => (
<div
key={c.id} onClick={() => { setCurrentCardIndex(idx); setIsFlipped(false); }} className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${ currentCardIndex === idx
? 'border-blue-500 bg-blue-500/10 text-white'
: 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:border-slate-750'
}`} >
<div className="flex items-center justify-between mb-1">
<span className="font-semibold text-slate-300 truncate">Thẻ {idx + 1}</span>
{c.mastered && <CheckCircle size={13} className="text-emerald-400 shrink-0" />} </div>
<p className="line-clamp-2">{c.question}</p>
</div>
))} </div>
</div>
</div>
)} {} {activeTab === 'quiz' && (
<div className="max-w-3xl mx-auto space-y-6">
{} <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
<div>
<h3 className="font-bold text-white text-base">Bộ câu hỏi trắc nghiệm tự kiểm tra</h3>
<p className="text-xs text-slate-400 mt-0.5">
Đánh giá mức độ hiểu sâu kiến thức bám sát tài liệu nguồn
</p>
</div>
<div className="flex items-center gap-4">
<div className="text-right">
<div className="text-xs text-slate-400">Điểm số:</div>
<div className="text-lg font-bold text-blue-400">
{quizScore} / {quiz.length} </div>
</div>
<button
onClick={handleResetQuiz} className="px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-xl transition-colors"
>
Làm lại
</button>
</div>
</div>
{} <div className="space-y-6">
{quiz.map((q, qIndex) => { const userChoice = selectedAnswers[qIndex]; const isAnswered = userChoice !== undefined; const isCorrect = userChoice === q.correctIndex; return (
<div
key={q.id || qIndex} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4"
>
<div className="flex items-start gap-3">
<span className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
{qIndex + 1} </span>
<h4 className="text-sm font-semibold text-white leading-relaxed">
{q.question} </h4>
</div>
{} <div className="space-y-2 pt-1 pl-9">
{q.options.map((option, optIdx) => { let btnStyle = 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700 hover:bg-slate-800/40'; if (isAnswered) { if (optIdx === q.correctIndex) { btnStyle = 'border-emerald-500 bg-emerald-500/10 text-emerald-200 font-semibold'; } else if (optIdx === userChoice) {
btnStyle = 'border-rose-500 bg-rose-500/10 text-rose-200 line-through'; } else { btnStyle = 'border-slate-800/60 bg-slate-950/30 text-slate-500 opacity-60'; } } return (
<button
key={optIdx} disabled={isAnswered} onClick={() => handleSelectAnswer(qIndex, optIdx)} className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm transition-all flex items-center justify-between ${btnStyle}`} >
<span>{option}</span>
{isAnswered && optIdx === q.correctIndex && (
<CheckCircle2 size={16} className="text-emerald-400 shrink-0 ml-2" />
)} {isAnswered && optIdx === userChoice && !isCorrect && (
<XCircle size={16} className="text-rose-400 shrink-0 ml-2" />
)} </button>
); })} </div>
{} {isAnswered && (
<div className="ml-9 p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2 animate-in fade-in">
<div className="flex items-center gap-1.5 font-semibold text-slate-200">
{isCorrect ? (
<span className="text-emerald-400 flex items-center gap-1">
<CheckCircle size={14} /> Chính xác!
</span>
) : (
<span className="text-rose-400 flex items-center gap-1">
<XCircle size={14} /> Chưa chính xác!
</span>
)} </div>
<p className="text-slate-300 leading-relaxed">{q.explanation}</p>
{q.sourceQuote && (
<div className="pt-2 border-t border-slate-800 text-slate-400 italic">
&ldquo;{q.sourceQuote}&rdquo; </div>
)} </div>
)} </div>
); })} </div>
</div>
)} {} {activeTab === 'audio' && (
<div className="max-w-2xl mx-auto space-y-6">
{} <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-950 border border-indigo-700/40 shadow-2xl space-y-4">
<div className="flex items-start justify-between gap-4">
<div className="flex items-center gap-3">
<div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
<Headphones size={22} />
</div>
<div>
<span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
NotebookLM Audio Overview
</span>
<h3 className="font-bold text-white text-base sm:text-lg mt-1">
{audioOverview.title} </h3>
</div>
</div>
</div>
<p className="text-xs text-slate-300">{audioOverview.summary}</p>
{} <div className="flex items-center justify-between pt-3 border-t border-slate-800">
<div className="flex items-center gap-3">
<button
onClick={handleTogglePlayAudio} className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-indigo-500/25 transition-all"
>
{isPlayingAudio ? (
<>
<Pause size={15} />
<span>Tạm dừng</span>
</>
) : (
<>
<Play size={15} />
<span>Nghe Podcast (Đọc thoại)</span>
</>
)} </button>
{isPlayingAudio && (
<button
onClick={handleStopAudio} className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
title="Dừng hẳn"
>
<Square size={15} />
</button>
)} </div>
{} <div className="flex items-center gap-1.5 text-xs text-slate-400">
<Volume2 size={14} className="text-indigo-400" />
<span className="mr-1">Tốc độ:</span>
{[1.0, 1.25, 1.5].map((rate) => (
<button
key={rate} onClick={() => setSpeechRate(rate)} className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors ${ speechRate === rate
? 'bg-indigo-600 text-white'
: 'bg-slate-800 text-slate-400 hover:text-slate-200'
}`} >
{rate}x
</button>
))} </div>
</div>
</div>
{} <div className="space-y-3 pt-2">
<h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
Kịch bản đối thoại trực quan:
</h4>
<div className="space-y-3">
{audioOverview.dialogue.map((item, idx) => { const isActive = currentDialogueIndex === idx; const isMinh = item.speaker.toLowerCase().includes('minh') || idx % 2 === 0; return (
<div
key={idx} onClick={() => { setIsPlayingAudio(true); speakDialogueItem(idx); }} className={`p-4 rounded-2xl border transition-all cursor-pointer ${ isActive
? 'bg-indigo-950/60 border-indigo-500 ring-1 ring-indigo-500 shadow-md'
: isMinh
? 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
: 'bg-slate-850/70 border-slate-800 hover:border-slate-700'
}`} >
<div className="flex items-center gap-2 mb-1.5">
<span className="text-lg">{item.avatar || (isMinh ? '👨‍💼' : '👩‍💼')}</span>
<span className="text-xs font-bold text-slate-200">{item.speaker}</span>
{isActive && (
<span className="text-[10px] text-indigo-400 font-medium px-2 py-0.2 rounded-full bg-indigo-500/20 border border-indigo-500/30 animate-pulse">
Đang đọc
</span>
)} </div>
<p className="text-xs sm:text-sm text-slate-300 leading-relaxed pl-7">
{item.text} </p>
</div>
); })} </div>
</div>
</div>
)} {} {activeTab === 'slides' && (
<div className="max-w-4xl mx-auto space-y-6">
{} <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-850 to-orange-950/20 border border-orange-500/30 shadow-2xl space-y-4">
<div className="flex items-center justify-between pb-3 border-b border-slate-800">
<div className="flex items-center gap-2.5">
<div className="p-2 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
<Presentation size={18} />
</div>
<div>
<h3 className="font-bold text-white text-base">{slideDeck.title}</h3>
<p className="text-xs text-slate-400">{slideDeck.description}</p>
</div>
</div>
<button
onClick={handleCopySlides} className="px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5"
>
{copiedSlides ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />} <span>{copiedSlides ? 'Đã sao chép' : 'Sao chép dàn ý Slide'}</span>
</button>
</div>
{} {currentSlide && (
<div className="relative w-full aspect-[16/9] max-h-[380px] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 rounded-2xl border border-slate-700/80 p-6 sm:p-10 flex flex-col justify-between shadow-inner">
{} <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800/60 pb-3">
<span className="uppercase tracking-wider font-semibold text-[11px] text-orange-400">
NotebookLearn Presentation
</span>
<span className="font-mono bg-slate-800 px-2.5 py-0.5 rounded-full text-[11px] text-slate-200">
Slide {currentSlide.slideNumber} / {slideDeck.slides.length} </span>
</div>
{} <div className="my-auto space-y-4">
<h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
{currentSlide.title} </h2>
<ul className="space-y-2.5">
{currentSlide.bullets.map((b, bIdx) => (
<li key={bIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200">
<span className="w-2 h-2 rounded-full bg-orange-400 mt-1.5 shrink-0" />
<span>{b}</span>
</li>
))} </ul>
</div>
{} {currentSlide.speakerNotes && (
<div className="pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 italic">
💬 <strong className="text-slate-300 not-italic">Gợi ý thuyết trình:</strong> {currentSlide.speakerNotes} </div>
)} </div>
)} {} <div className="flex items-center justify-between pt-2">
<button
onClick={() => setCurrentSlideIndex((prev) => Math.max(0, prev - 1))} disabled={currentSlideIndex === 0} className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-xl transition-all disabled:opacity-40 flex items-center gap-1.5"
>
<ChevronLeft size={16} /> Slide trước
</button>
<div className="flex items-center gap-1.5">
{slideDeck.slides.map((_, sIdx) => (
<button
key={sIdx} onClick={() => setCurrentSlideIndex(sIdx)} className={`h-2.5 rounded-full transition-all ${ currentSlideIndex === sIdx ? 'bg-orange-400 w-6' : 'bg-slate-700 hover:bg-slate-600 w-2.5'
}`} />
))} </div>
<button
onClick={() => setCurrentSlideIndex((prev) => Math.min(slideDeck.slides.length - 1, prev + 1))} disabled={currentSlideIndex === slideDeck.slides.length - 1}
className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-xl transition-all disabled:opacity-40 flex items-center gap-1.5"
>
Slide sau <ChevronRight size={16} />
</button>
</div>
</div>
{} <div className="space-y-3">
<h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
Tất cả các slide trong bài:
</h4>
<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
{slideDeck.slides.map((slide, sIdx) => (
<div
key={sIdx} onClick={() => setCurrentSlideIndex(sIdx)} className={`p-4 rounded-xl border text-xs cursor-pointer transition-all space-y-2 ${ currentSlideIndex === sIdx
? 'border-orange-500 bg-orange-500/10 text-white shadow-md'
: 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:border-slate-700'
}`} >
<div className="flex items-center justify-between">
<span className="font-bold text-slate-200">Slide {slide.slideNumber}</span>
<span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">
{slide.bullets.length} ý
</span>
</div>
<p className="font-semibold text-slate-300">{slide.title}</p>
<p className="text-[11px] line-clamp-2 text-slate-400">
{slide.bullets.join(' • ')} </p>
</div>
))} </div>
</div>
</div>
)} </div>
</div>
); };