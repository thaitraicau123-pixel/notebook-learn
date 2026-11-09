import { GoogleGenerativeAI } from '@google/generative-ai'; import { StudyGuide, Flashcard, QuizQuestion, AudioOverview, Citation, ChatMessage, SlideDeck } from './types'; export function getApiKey(headerKey?: string | null): string | undefined { if (headerKey && headerKey.trim() !== '') { return headerKey.trim(); }
return process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || undefined; } export async function generateWithGemini(apiKey: string, prompt: string): Promise<string> { const genAI = new GoogleGenerativeAI(apiKey); const modelsToTry = [
'gemini-3.5-flash-lite', 'gemini-3.5-flash', 'gemini-flash-latest', 'gemini-3.8-flash', ]; let lastError: Error | null = null; for (const modelName of modelsToTry) { try { const model = genAI.getGenerativeModel({ model: modelName }); const response = await model.generateContent(prompt); const text = response.response.text();
if (text && text.trim().length > 0) { return text; } } catch (err) { lastError = err instanceof Error ? err : new Error(String(err)); console.warn(`Model ${modelName} error, trying next fallback:`, lastError.message); } } throw lastError || new Error('Không thể kết nối tới mô hình Gemini'); } export async function generateStudyGuideWithGemini(
sourcesText: string, apiKey?: string
): Promise<StudyGuide> { if (!apiKey) { throw new Error('API_KEY_REQUIRED'); } const prompt = `
Bạn là một chuyên gia sư phạm học tập thông minh tương tự Google NotebookLM.
Dưới đây là các tài liệu người dùng đã tải lên:
---
${sourcesText} ---
Nhiệm vụ: Hãy phân tích kỹ các tài liệu trên và tổng hợp thành một Cẩm nang học tập (Study Guide) có cấu trúc giúp người học tiếp thu nhanh nhất.
CHỈ DỰA VÀO NỘI DUNG TÀI LIỆU TRÊN. Không bịa đặt thông tin.
Đầu ra BẮT BUỘC là định dạng JSON hợp lệ duy nhất:
{ "title": "Tiêu đề bài học tổng hợp ngắn gọn, hấp dẫn", "summary": "Tóm tắt súc tích, mạch lạc từ 2-4 đoạn văn nêu bật bức tranh toàn cảnh và mục tiêu học tập", "keyConcepts": [
{ "term": "Tên thuật ngữ / khái niệm 1", "definition": "Định nghĩa chính xác, dễ hiểu dựa vào tài liệu", "importance": "Tại sao cần nắm vững khái niệm này"
} ], "takeaways": [
"Ý chính rút ra 1", "Ý chính rút ra 2", "Ý chính rút ra 3", "Ý chính rút ra 4"
], "faqs": [
{ "question": "Câu hỏi mấu chốt người học hay thắc mắc?", "answer": "Câu trả lời cô đọng dựa trên tài liệu"
} ], "suggestedTopics": [
"Chủ đề hoặc câu hỏi gợi ý để tìm hiểu sâu hơn 1", "Chủ đề hoặc câu hỏi gợi ý để tìm hiểu sâu hơn 2"
]
} `; const text = await generateWithGemini(apiKey, prompt); const cleaned = cleanJsonResponse(text); return JSON.parse(cleaned) as StudyGuide; } export async function generateFlashcardsWithGemini(
sourcesText: string, count = 6, apiKey?: string
): Promise<Flashcard[]> { if (!apiKey) { throw new Error('API_KEY_REQUIRED'); } const prompt = `
Bạn là trợ lý học tập tạo thẻ ghi nhớ (Flashcards) theo phương pháp Active Recall.
Dưới đây là tài liệu học tập:
---
${sourcesText} ---
Hãy tạo ${count} thẻ ghi nhớ Flashcard chất lượng cao nhất giúp người học nhớ lâu.
Yêu cầu:
- Mặt trước (question): Đặt câu hỏi kích thích tư duy hoặc nêu một khái niệm cần giải nghĩa.
- Mặt sau (answer): Câu trả lời súc tích, trực diện, dễ nhớ.
- Phân loại (category): Chủ đề của thẻ.
Trả về DUY NHẤT định dạng JSON:
[
{ "id": "fc-1", "question": "Câu hỏi ngắn gọn?", "answer": "Câu trả lời trọng tâm", "category": "Chủ đề con"
} ]
`; const text = await generateWithGemini(apiKey, prompt); const cleaned = cleanJsonResponse(text); const cards = JSON.parse(cleaned) as Array<{ id?: string; question: string; answer: string; category?: string }>; return cards.map((c, idx) => ({ id: `fc-${Date.now()}-${idx}`, question: c.question, answer: c.answer,
category: c.category || 'Tổng hợp', mastered: false, })); } export async function generateQuizWithGemini(
sourcesText: string, count = 4, apiKey?: string
): Promise<QuizQuestion[]> { if (!apiKey) { throw new Error('API_KEY_REQUIRED'); } const prompt = `
Dưới đây là tài liệu học tập:
---
${sourcesText} ---
Hãy tạo ${count} câu hỏi trắc nghiệm kiểm tra độ hiểu sâu của người học (4 lựa chọn A, B, C, D).
Mỗi câu hỏi cần có giải thích chi tiết và trích dẫn câu văn gốc trong tài liệu để chứng minh đáp án.
Trả về DUY NHẤT định dạng JSON:
[
{ "id": "qz-1", "question": "Nội dung câu hỏi?", "options": ["Lựa chọn A", "Lựa chọn B", "Lựa chọn C", "Lựa chọn D"], "correctIndex": 0, "explanation": "Giải thích vì sao đáp án này đúng và các đáp án khác sai", "sourceQuote": "Trích dẫn nguyên văn từ tài liệu làm chứng cứ"
} ]
`; const text = await generateWithGemini(apiKey, prompt); const cleaned = cleanJsonResponse(text); const quiz = JSON.parse(cleaned) as Array<QuizQuestion>; return quiz.map((q, idx) => ({ ...q, id: `qz-${Date.now()}-${idx}`, })); } export async function chatWithSourcesWithGemini(
messages: ChatMessage[], sourcesText: string, apiKey?: string
): Promise<{ reply: string; citations: Citation[] }> { if (!apiKey) { throw new Error('API_KEY_REQUIRED'); } const historyText = messages
.slice(-6)
.map((m) => `${m.role === 'user' ? 'Người học' : 'Trợ lý NotebookLM'}: ${m.content}`)
.join('\n'); const prompt = `
Bạn là Trợ lý Học tập AI NotebookLM (Grounding Assistant).
Quy tắc VÀNG:
1. Bạn CHỈ ĐƯỢC PHÉP trả lời dựa trên thông tin có trong TÀI LIỆU NGUỒN dưới đây.
2. Nếu câu hỏi không có trong tài liệu, hãy thành thật trả lời: "Tài liệu bạn tải lên không đề cập đến thông tin này." và gợi ý những gì có trong tài liệu.
3. Kèm theo trích dẫn nguồn cụ thể (chứa trích đoạn ngắn chính xác từ tài liệu).
TÀI LIỆU NGUỒN:
---
${sourcesText} ---
LỊCH SỬ HỘI THOẠI GẦN ĐÂY:
${historyText} Hãy trả lời câu hỏi mới nhất của người học.
Trả về DUY NHẤT một định dạng JSON:
{ "reply": "Nội dung câu trả lời hoàn chỉnh, trình bày bằng định dạng Markdown rõ ràng, dễ hiểu với các gạch đầu dòng và nhấn mạnh từ khóa.", "citations": [
{ "sourceName": "Tên tài liệu nguồn", "quote": "Đoạn trích dẫn nguyên văn chứng minh cho câu trả lời", "relevance": "Ngữ cảnh hoặc vị trí"
} ]
} `; const text = await generateWithGemini(apiKey, prompt); try { const cleaned = cleanJsonResponse(text); return JSON.parse(cleaned); } catch { return { reply: text, citations: [], }; } } export async function generateAudioScriptWithGemini(
sourcesText: string, apiKey?: string
): Promise<AudioOverview> { if (!apiKey) { throw new Error('API_KEY_REQUIRED'); } const prompt = `
Tương tự tính năng "Audio Overview" nổi tiếng của Google NotebookLM:
Hãy biến tài liệu sau đây thành một kịch bản hội thoại Podcast sống động, tự nhiên, thú vị giữa 2 người:
- Minh (Người dẫn chuyện nam, nhiệt tình, thích liên hệ thực tế)
- Lan (Người dẫn chuyện nữ, thông minh, hay tóm tắt ý chính và đặt câu hỏi sắc bén)
TÀI LIỆU:
---
${sourcesText} ---
Yêu cầu:
- Viết bằng Tiếng Việt tự nhiên, đàm thoại như 2 bạn học đang cùng nhau bóc tách một đề tài hấp dẫn.
- Độ dài khoảng 6-8 lượt trao đổi qua lại.
- Giúp người nghe hiểu ngay bản chất mà không thấy nhàm chán.
Trả về DUY NHẤT định dạng JSON:
{ "title": "Tiêu đề tập Podcast", "summary": "Tóm tắt ngắn 1 câu về nội dung cuộc trò chuyện", "dialogue": [
{ "speaker": "Minh", "avatar": "👨‍💼", "text": "Lời thoại..."
}, { "speaker": "Lan", "avatar": "👩‍💼", "text": "Lời thoại..."
} ]
} `; const text = await generateWithGemini(apiKey, prompt); const cleaned = cleanJsonResponse(text); return JSON.parse(cleaned) as AudioOverview; } export async function generateSlideDeckWithGemini(
sourcesText: string, apiKey?: string
): Promise<SlideDeck> { if (!apiKey) { throw new Error('API_KEY_REQUIRED'); } const prompt = `
Bạn là chuyên gia thiết kế bài giảng và slide thuyết trình chuyên nghiệp (PowerPoint presentation designer).
Dưới đây là tài liệu học tập:
---
${sourcesText} ---
Hãy tạo một bộ Slide thuyết trình tóm tắt các điểm quan trọng nhất (khoảng 4-6 slide) giúp người học nắm bài hoặc dùng để thuyết trình.
Mỗi slide gồm:
- slideNumber: số thứ tự slide (1, 2, 3...)
- title: tiêu đề slide ngắn gọn, súc tích
- bullets: mảng 3-4 ý chính dễ hiểu (bullets)
- speakerNotes: lời thuyết minh gợi ý cho người trình bày (speaker notes)
Trả về DUY NHẤT định dạng JSON:
{ "title": "Tiêu đề bài thuyết trình", "description": "Mô tả ngắn gọn về bài thuyết trình", "slides": [
{ "slideNumber": 1, "title": "Tiêu đề Slide", "bullets": ["Ý chính 1", "Ý chính 2", "Ý chính 3"], "speakerNotes": "Lời khuyên thuyết trình..."
} ]
} `; const text = await generateWithGemini(apiKey, prompt); const cleaned = cleanJsonResponse(text); return JSON.parse(cleaned) as SlideDeck; } function cleanJsonResponse(raw: string): string { let cleaned = raw.trim(); const codeBlock = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i); if (codeBlock && codeBlock[1]) {
cleaned = codeBlock[1].trim(); } const firstBrace = cleaned.indexOf('{'); const lastBrace = cleaned.lastIndexOf('}'); const firstBracket = cleaned.indexOf('['); const lastBracket = cleaned.lastIndexOf(']'); if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket) && lastBrace > firstBrace) {
return cleaned.slice(firstBrace, lastBrace + 1).trim(); } if (firstBracket !== -1 && lastBracket > firstBracket) { return cleaned.slice(firstBracket, lastBracket + 1).trim(); } return cleaned.trim(); }