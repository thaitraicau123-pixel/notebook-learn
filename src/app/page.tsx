'use client'; import React, { useState, useEffect } from 'react'; import { Header } from '@/components/Header'; import { SourcePanel } from '@/components/SourcePanel'; import { StudyStudio } from '@/components/StudyStudio'; import { ChatPanel } from '@/components/ChatPanel'; import { ApiKeyModal } from '@/components/ApiKeyModal';
import { DocumentModal } from '@/components/DocumentModal'; import { SourceDocument, StudyGuide, Flashcard, QuizQuestion, AudioOverview, ChatMessage, SlideDeck, } from '@/lib/types'; import { INITIAL_STUDY_GUIDE, INITIAL_FLASHCARDS, INITIAL_QUIZ, INITIAL_AUDIO_OVERVIEW, INITIAL_SLIDE_DECK, } from '@/lib/sample-data';
import { FileText, BookOpen, MessageSquare } from 'lucide-react'; import { parsePptxInBrowser } from '@/lib/client-parsers'; import { dbClient } from '@/lib/db-client'; import { getClientDeviceId } from '@/lib/client-id'; export default function Home() { const [sources, setSources] = useState<SourceDocument[]>([]);
const [selectedDocPreview, setSelectedDocPreview] = useState<SourceDocument | null>(null); const [isAddTextOpen, setIsAddTextOpen] = useState(false); const [isUploading, setIsUploading] = useState(false); const [studyGuide, setStudyGuide] = useState<StudyGuide>(INITIAL_STUDY_GUIDE);
const [flashcards, setFlashcards] = useState<Flashcard[]>(INITIAL_FLASHCARDS); const [quiz, setQuiz] = useState<QuizQuestion[]>(INITIAL_QUIZ); const [audioOverview, setAudioOverview] = useState<AudioOverview>(INITIAL_AUDIO_OVERVIEW); const [slideDeck, setSlideDeck] = useState<SlideDeck>(INITIAL_SLIDE_DECK);
const [messages, setMessages] = useState<ChatMessage[]>([]); const [isSendingChat, setIsSendingChat] = useState(false); const [apiKey, setApiKey] = useState<string>(
process.env.NEXT_PUBLIC_GEMINI_API_KEY || ''
); const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false); const [isGenerating, setIsGenerating] = useState(false); const [mobileTab, setMobileTab] = useState<'sources' | 'studio' | 'chat'>('studio'); useEffect(() => { getClientDeviceId(); const savedKey = localStorage.getItem('notebook_learn_gemini_key'); if (savedKey) {
setApiKey(savedKey); } else if (process.env.NEXT_PUBLIC_GEMINI_API_KEY) { setApiKey(process.env.NEXT_PUBLIC_GEMINI_API_KEY); } try { const localSourcesStr = localStorage.getItem('notebook_user_sources'); if (localSourcesStr) { const parsed = JSON.parse(localSourcesStr); if (Array.isArray(parsed) && parsed.length > 0) { setSources(parsed); } }
const localGuide = localStorage.getItem('notebook_saved_guide'); if (localGuide) setStudyGuide(JSON.parse(localGuide)); const localCards = localStorage.getItem('notebook_saved_cards'); if (localCards) setFlashcards(JSON.parse(localCards)); const localQuiz = localStorage.getItem('notebook_saved_quiz');
if (localQuiz) setQuiz(JSON.parse(localQuiz)); const localAudio = localStorage.getItem('notebook_saved_audio'); if (localAudio) setAudioOverview(JSON.parse(localAudio)); const localSlides = localStorage.getItem('notebook_saved_slides'); if (localSlides) setSlideDeck(JSON.parse(localSlides));
const localMsgs = localStorage.getItem('notebook_saved_messages'); if (localMsgs) setMessages(JSON.parse(localMsgs)); } catch (e) { console.warn('Error reading local cache:', e); } async function syncWithSQLite() { try { const dbSources = await dbClient.getSources(); if (Array.isArray(dbSources) && dbSources.length > 0) {
setSources(dbSources); localStorage.setItem('notebook_user_sources', JSON.stringify(dbSources)); } else { const localStr = localStorage.getItem('notebook_user_sources'); if (localStr) { const parsed = JSON.parse(localStr); if (Array.isArray(parsed) && parsed.length > 0) { for (const doc of parsed) { await dbClient.saveSource(doc); } } } }
} catch (err) { console.warn('Sync sources error:', err); } try { const dbMaterials = await dbClient.getMaterials(); if (dbMaterials) { if (dbMaterials.studyGuide) { setStudyGuide(dbMaterials.studyGuide); localStorage.setItem('notebook_saved_guide', JSON.stringify(dbMaterials.studyGuide)); } if (dbMaterials.flashcards) {
setFlashcards(dbMaterials.flashcards); localStorage.setItem('notebook_saved_cards', JSON.stringify(dbMaterials.flashcards)); } if (dbMaterials.quiz) { setQuiz(dbMaterials.quiz); localStorage.setItem('notebook_saved_quiz', JSON.stringify(dbMaterials.quiz)); } if (dbMaterials.audioOverview) { setAudioOverview(dbMaterials.audioOverview);
localStorage.setItem('notebook_saved_audio', JSON.stringify(dbMaterials.audioOverview)); } if (dbMaterials.slideDeck) { setSlideDeck(dbMaterials.slideDeck); localStorage.setItem('notebook_saved_slides', JSON.stringify(dbMaterials.slideDeck)); } } } catch (err) { console.warn('Sync materials error:', err); } try {
const dbMessages = await dbClient.getMessages(); if (Array.isArray(dbMessages) && dbMessages.length > 0) { setMessages(dbMessages); localStorage.setItem('notebook_saved_messages', JSON.stringify(dbMessages)); } } catch (err) { console.warn('Sync messages error:', err); } } syncWithSQLite(); }, []); const handleSaveApiKey = (key: string) => {
setApiKey(key); localStorage.setItem('notebook_learn_gemini_key', key); }; const handleToggleSelect = (id: string) => { setSources((prev) => { const updated = prev.map((s) => (s.id === id ? { ...s, selected: !s.selected } : s)); localStorage.setItem('notebook_user_sources', JSON.stringify(updated));
const target = updated.find((s) => s.id === id); if (target) { dbClient.updateSourceSelection(id, target.selected); } return updated; }); }; const handleToggleSelectAll = () => { const allSelected = sources.every((s) => s.selected); const newSelected = !allSelected; const updated = sources.map((s) => ({ ...s, selected: newSelected }));
setSources(updated); localStorage.setItem('notebook_user_sources', JSON.stringify(updated)); dbClient.toggleSelectAll(newSelected); }; const handleDeleteSource = async (id: string) => { const updated = sources.filter((s) => s.id !== id); setSources(updated); localStorage.setItem('notebook_user_sources', JSON.stringify(updated));
await dbClient.deleteSource(id); }; const handleResetSampleData = async () => { setSources([]); setStudyGuide(INITIAL_STUDY_GUIDE); setFlashcards(INITIAL_FLASHCARDS); setQuiz(INITIAL_QUIZ); setAudioOverview(INITIAL_AUDIO_OVERVIEW); setSlideDeck(INITIAL_SLIDE_DECK); setMessages([]); localStorage.removeItem('notebook_user_sources');
localStorage.removeItem('notebook_saved_guide'); localStorage.removeItem('notebook_saved_cards'); localStorage.removeItem('notebook_saved_quiz'); localStorage.removeItem('notebook_saved_audio'); localStorage.removeItem('notebook_saved_slides'); localStorage.removeItem('notebook_saved_messages'); try {
await fetch('/api/db/sources?all=true', { method: 'DELETE' }); await dbClient.clearMessages(); } catch (e) {} }; const handleUploadFile = async (file: File) => { setIsUploading(true); try { const ext = file.name.split('.').pop()?.toLowerCase() || ''; if (ext === 'pptx') { try { const text = await parsePptxInBrowser(file);
if (text && text.trim().length > 0) { await handleAddTextDocument(file.name, text, 'pptx'); return; } } catch (clientErr) { console.warn('Lỗi trích xuất PPTX trên trình duyệt, chuyển sang xử lý máy chủ:', clientErr); } } if (ext === 'txt' || ext === 'md') { try { const text = await file.text(); if (text && text.trim().length > 0) {
await handleAddTextDocument(file.name, text, 'txt'); return; } } catch (e) { console.warn('Lỗi đọc text trực tiếp:', e); } } const formData = new FormData(); formData.append('file', file); const res = await fetch('/api/upload', { method: 'POST', headers: { 'x-client-id': getClientDeviceId(), }, body: formData, });
const responseText = await res.text(); let data; try { data = JSON.parse(responseText); } catch { if (res.status === 413) { throw new Error('Tệp tải lên quá nặng (>4.5MB). Vui lòng chọn tệp nhỏ hơn.'); } throw new Error(`Máy chủ không thể phản hồi xử lý tệp này (Mã lỗi ${res.status}).`); } if (!res.ok) {
throw new Error(data?.error || 'Lỗi khi tải file'); } const newDoc: SourceDocument = data.doc; const updated = [newDoc, ...sources]; setSources(updated); localStorage.setItem('notebook_user_sources', JSON.stringify(updated)); await dbClient.saveSource(newDoc); handleGenerateAllLearningMaterials([newDoc, ...sources.filter((s) => s.selected)]);
} finally { setIsUploading(false); } }; const handleAddTextDocument = async (title: string, content: string, type: SourceDocument['type'] = 'text') => { try { const trimmedText = content.trim(); if (!trimmedText) { alert('Tài liệu trống, không tìm thấy nội dung văn bản.'); return; } const newDoc: SourceDocument = {
id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`, name: title.trim() || `Tài liệu-${new Date().toLocaleTimeString('vi-VN')}.txt`, type: type, content: trimmedText, wordCount: trimmedText.split(/\s+/).filter(Boolean).length, charCount: trimmedText.length, uploadedAt: new Date().toLocaleDateString('vi-VN'),
selected: true, }; const updated = [newDoc, ...sources]; setSources(updated); localStorage.setItem('notebook_user_sources', JSON.stringify(updated)); await dbClient.saveSource(newDoc); handleGenerateAllLearningMaterials([newDoc, ...sources.filter((s) => s.selected)]); } catch (err) { console.error('Error adding document:', err); } };
const getApiHeaders = () => { const headers: Record<string, string> = { 'Content-Type': 'application/json', }; if (apiKey) { headers['x-gemini-key'] = apiKey; } return headers; }; const handleGenerateAllLearningMaterials = async (currentSources: SourceDocument[]) => { setIsGenerating(true); try {
const selected = currentSources.filter((s) => s.selected); if (selected.length === 0) return; try { const guideRes = await fetch('/api/study-guide', { method: 'POST', headers: getApiHeaders(), body: JSON.stringify({ sources: selected }), }); if (guideRes.ok) { const guideData = await guideRes.json(); if (guideData?.studyGuide) {
setStudyGuide(guideData.studyGuide); localStorage.setItem('notebook_saved_guide', JSON.stringify(guideData.studyGuide)); dbClient.saveMaterial('studyGuide', guideData.studyGuide); } } } catch (e) { console.warn('Study guide error:', e); } try { const cardsRes = await fetch('/api/flashcards', { method: 'POST', headers: getApiHeaders(),
body: JSON.stringify({ sources: selected, count: 6 }), }); if (cardsRes.ok) { const cardsData = await cardsRes.json(); if (cardsData?.flashcards) { setFlashcards(cardsData.flashcards); localStorage.setItem('notebook_saved_cards', JSON.stringify(cardsData.flashcards)); dbClient.saveMaterial('flashcards', cardsData.flashcards); } }
} catch (e) { console.warn('Flashcards error:', e); } try { const quizRes = await fetch('/api/quiz', { method: 'POST', headers: getApiHeaders(), body: JSON.stringify({ sources: selected, count: 4 }), }); if (quizRes.ok) { const quizData = await quizRes.json(); if (quizData?.quiz) { setQuiz(quizData.quiz);
localStorage.setItem('notebook_saved_quiz', JSON.stringify(quizData.quiz)); dbClient.saveMaterial('quiz', quizData.quiz); } } } catch (e) { console.warn('Quiz error:', e); } try { const audioRes = await fetch('/api/audio', { method: 'POST', headers: getApiHeaders(), body: JSON.stringify({ sources: selected }), }); if (audioRes.ok) {
const audioData = await audioRes.json(); if (audioData?.overview) { setAudioOverview(audioData.overview); localStorage.setItem('notebook_saved_audio', JSON.stringify(audioData.overview)); dbClient.saveMaterial('audioOverview', audioData.overview); } } } catch (e) { console.warn('Audio error:', e); } try {
const slidesRes = await fetch('/api/slides', { method: 'POST', headers: getApiHeaders(), body: JSON.stringify({ sources: selected }), }); if (slidesRes.ok) { const slidesData = await slidesRes.json(); if (slidesData?.slides) { setSlideDeck(slidesData.slides);
localStorage.setItem('notebook_saved_slides', JSON.stringify(slidesData.slides)); dbClient.saveMaterial('slideDeck', slidesData.slides); } } } catch (e) { console.warn('Slides error:', e); } } catch (error) { console.error('Error generating learning materials:', error); } finally { setIsGenerating(false); } };
const handleRegenerateStudyGuide = async () => { setIsGenerating(true); try { const res = await fetch('/api/study-guide', { method: 'POST', headers: getApiHeaders(), body: JSON.stringify({ sources }), }); const data = await res.json(); if (data.studyGuide) { setStudyGuide(data.studyGuide);
localStorage.setItem('notebook_saved_guide', JSON.stringify(data.studyGuide)); dbClient.saveMaterial('studyGuide', data.studyGuide); } if (data.error) alert(data.error); } finally { setIsGenerating(false); } }; const handleRegenerateFlashcards = async () => { setIsGenerating(true); try { const res = await fetch('/api/flashcards', {
method: 'POST', headers: getApiHeaders(), body: JSON.stringify({ sources, count: 6 }), }); const data = await res.json(); if (data.flashcards) { setFlashcards(data.flashcards); localStorage.setItem('notebook_saved_cards', JSON.stringify(data.flashcards)); dbClient.saveMaterial('flashcards', data.flashcards); }
if (data.error) alert(data.error); } finally { setIsGenerating(false); } }; const handleRegenerateQuiz = async () => { setIsGenerating(true); try { const res = await fetch('/api/quiz', { method: 'POST', headers: getApiHeaders(), body: JSON.stringify({ sources, count: 4 }), }); const data = await res.json(); if (data.quiz) {
setQuiz(data.quiz); localStorage.setItem('notebook_saved_quiz', JSON.stringify(data.quiz)); dbClient.saveMaterial('quiz', data.quiz); } if (data.error) alert(data.error); } finally { setIsGenerating(false); } }; const handleRegenerateAudio = async () => { setIsGenerating(true); try { const res = await fetch('/api/audio', { method: 'POST',
headers: getApiHeaders(), body: JSON.stringify({ sources }), }); const data = await res.json(); if (data.overview) { setAudioOverview(data.overview); localStorage.setItem('notebook_saved_audio', JSON.stringify(data.overview)); dbClient.saveMaterial('audioOverview', data.overview); } if (data.error) alert(data.error); } finally {
setIsGenerating(false); } }; const handleRegenerateSlides = async () => { setIsGenerating(true); try { const res = await fetch('/api/slides', { method: 'POST', headers: getApiHeaders(), body: JSON.stringify({ sources }), }); const data = await res.json(); if (data.slides) { setSlideDeck(data.slides);
localStorage.setItem('notebook_saved_slides', JSON.stringify(data.slides)); dbClient.saveMaterial('slideDeck', data.slides); } if (data.error) alert(data.error); } finally { setIsGenerating(false); } }; const handleSendMessage = async (content: string) => { const userMsg: ChatMessage = { id: `msg-${Date.now()}`, role: 'user', content,
timestamp: new Date().toLocaleTimeString('vi-VN'), }; const newMessages = [...messages, userMsg]; setMessages(newMessages); localStorage.setItem('notebook_saved_messages', JSON.stringify(newMessages)); setIsSendingChat(true); dbClient.saveMessage(userMsg); try { const res = await fetch('/api/chat', { method: 'POST',
headers: getApiHeaders(), body: JSON.stringify({ messages: newMessages, sources: sources.filter((s) => s.selected), }), }); const data = await res.json(); const botMsg: ChatMessage = { id: `msg-${Date.now() + 1}`, role: 'assistant', content: data.reply || 'Không nhận được phản hồi', citations: data.citations || [],
timestamp: new Date().toLocaleTimeString('vi-VN'), }; const finalMessages = [...newMessages, botMsg]; setMessages(finalMessages); localStorage.setItem('notebook_saved_messages', JSON.stringify(finalMessages)); dbClient.saveMessage(botMsg); } catch { const errMsg: ChatMessage = { id: `msg-${Date.now() + 1}`, role: 'assistant',
content: 'Đã xảy ra sự cố kết nối tới máy chủ AI.', timestamp: new Date().toLocaleTimeString('vi-VN'), }; const finalMessages = [...newMessages, errMsg]; setMessages(finalMessages); localStorage.setItem('notebook_saved_messages', JSON.stringify(finalMessages)); } finally { setIsSendingChat(false); } };
const selectedSourcesCount = sources.filter((s) => s.selected).length; const totalWords = sources.reduce((acc, s) => acc + s.wordCount, 0); return (
<div className="flex flex-col h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
{} <Header
sourceCount={sources.length} totalWords={totalWords} hasApiKey={Boolean(apiKey)} onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)} onResetSampleData={handleResetSampleData} />
{} <div className="flex md:hidden border-b border-slate-800 bg-slate-900 px-4 py-2 justify-around text-xs">
<button
onClick={() => setMobileTab('sources')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${ mobileTab === 'sources' ? 'bg-blue-600 text-white' : 'text-slate-400'
}`} >
<FileText size={14} />
<span>Nguồn ({sources.length})</span>
</button>
<button
onClick={() => setMobileTab('studio')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${ mobileTab === 'studio' ? 'bg-blue-600 text-white' : 'text-slate-400'
}`} >
<BookOpen size={14} />
<span>Studio</span>
</button>
<button
onClick={() => setMobileTab('chat')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${ mobileTab === 'chat' ? 'bg-blue-600 text-white' : 'text-slate-400'
}`} >
<MessageSquare size={14} />
<span>Hỏi đáp</span>
</button>
</div>
{} <div className="flex-1 flex overflow-hidden">
{} <div
className={`${ mobileTab === 'sources' ? 'flex' : 'hidden'
} md:flex flex-col w-full md:w-80 lg:w-96 border-r border-slate-800 bg-slate-900/60 shrink-0`} >
<SourcePanel
sources={sources} onToggleSelect={handleToggleSelect} onToggleSelectAll={handleToggleSelectAll} onDeleteSource={handleDeleteSource} onUploadFile={handleUploadFile} onOpenAddText={() => setIsAddTextOpen(true)} onPreviewSource={(doc: SourceDocument) => setSelectedDocPreview(doc)} isUploading={isUploading} />
</div>
{} <div
className={`${ mobileTab === 'studio' ? 'flex' : 'hidden'
} md:flex flex-1 flex-col overflow-hidden bg-slate-950 border-r border-slate-800`} >
<StudyStudio
studyGuide={studyGuide} flashcards={flashcards} quiz={quiz} audioOverview={audioOverview} slideDeck={slideDeck} isGenerating={isGenerating} selectedSourcesCount={selectedSourcesCount} onRegenerateStudyGuide={handleRegenerateStudyGuide} onRegenerateFlashcards={handleRegenerateFlashcards} onRegenerateQuiz={handleRegenerateQuiz}
onRegenerateAudio={handleRegenerateAudio} onRegenerateSlides={handleRegenerateSlides} />
</div>
{} <div
className={`${ mobileTab === 'chat' ? 'flex' : 'hidden'
} md:flex flex-col w-full md:w-80 lg:w-96 bg-slate-900/40 shrink-0`} >
<ChatPanel
messages={messages} isSending={isSendingChat} selectedSourcesCount={selectedSourcesCount} onSendMessage={handleSendMessage} onClearChat={async () => { setMessages([]); localStorage.removeItem('notebook_saved_messages'); await dbClient.clearMessages(); }} />
</div>
</div>
{} <ApiKeyModal
isOpen={isApiKeyModalOpen} apiKey={apiKey} onClose={() => setIsApiKeyModalOpen(false)} onSaveApiKey={handleSaveApiKey} />
<DocumentModal
previewDoc={selectedDocPreview} onClosePreview={() => setSelectedDocPreview(null)} isAddTextOpen={isAddTextOpen} onCloseAddText={() => setIsAddTextOpen(false)} onAddTextDocument={(title: string, content: string) => { handleAddTextDocument(title, content, 'text'); setIsAddTextOpen(false); }} />
</div>
); }