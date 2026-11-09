import type { Metadata } from 'next'; import './globals.css'; export const metadata: Metadata = { title: 'NotebookLearn - Không gian học tập cá nhân hóa & Nghiên cứu thông minh', description: 'Tải tài liệu PDF, DOCX, TXT để tự động tổng hợp cẩm nang học tập, thẻ ghi nhớ Flashcards, trắc nghiệm và Audio Podcast học tập chuyên sâu.', };
export default function RootLayout({ children, }: { children: React.ReactNode; }) { return (
<html lang="vi" className="h-full antialiased dark">
<body className="h-full flex flex-col bg-slate-950 text-slate-100 overflow-hidden">
{children} </body>
</html>
); }