import { SourceDocument, StudyGuide, Flashcard, QuizQuestion, AudioOverview, SlideDeck } from './types'; export const SAMPLE_DOCUMENTS: SourceDocument[] = []; export const INITIAL_STUDY_GUIDE: StudyGuide = { title: 'Cẩm nang Học tập Trống',
summary: 'Chưa có tài liệu học tập nào được tải lên. Bạn hãy thêm tài liệu (PDF, Word, PPTX, TXT hoặc dán văn bản) ở cột bên trái, sau đó bấm nút để AI tự động tạo Cẩm nang học tập chuyên sâu!', keyConcepts: [], takeaways: [
'Thêm tài liệu ở cột bên trái để bắt đầu.', 'AI sẽ tự động đọc, trích xuất và hệ thống hóa kiến thức cho bạn.'
], faqs: [], suggestedTopics: ['Thêm tài liệu để nhận câu hỏi gợi ý']
}; export const INITIAL_FLASHCARDS: Flashcard[] = []; export const INITIAL_QUIZ: QuizQuestion[] = []; export const INITIAL_AUDIO_OVERVIEW: AudioOverview = { title: 'Chưa tạo tóm tắt âm thanh', summary: 'Tải lên tài liệu và bấm "Tạo thảo luận âm thanh" để AI biến bài học của bạn thành cuộc trò chuyện podcast sinh động!', dialogue: []
}; export const INITIAL_SLIDE_DECK: SlideDeck = { title: 'Trình chiếu Bài Giảng Trống', description: 'Thêm tài liệu và bấm "Tạo Slide Thuyết Trình" để AI trích xuất nội dung thành các trang slide chuẩn!', slides: []
};