import React, { useState } from 'react';
import { type Flashcard } from './types';
import InputSourceSelector from './components/InputSourceSelector';
import FlashcardEditor from './components/FlashcardEditor';
import FlashcardViewer from './components/FlashcardViewer';
import Loader from './components/Loader';
import { extractTextFromPdf } from './services/pdfProcessor';
import { generateFlashcardsFromText } from './services/geminiService';
import { fetchContentFromUrl } from './services/contentFetcher';

type AppState = 'INPUT' | 'LOADING' | 'EDITING' | 'VIEWING';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('INPUT');
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  
  const MAX_FILE_SIZE_MB = 10;

  const handleGenerate = async (source: { type: string; data: File | string }) => {
    setError(null);
    setAppState('LOADING');

    try {
        let text = '';
        switch (source.type) {
            case 'pdf':
                setLoadingMessage('Đang trích xuất văn bản từ PDF...');
                if ((source.data as File).size > MAX_FILE_SIZE_MB * 1024 * 1024) {
                  throw new Error(`Kích thước file quá lớn. Kích thước tối đa là ${MAX_FILE_SIZE_MB}MB.`);
                }
                text = await extractTextFromPdf(source.data as File);
                break;
            case 'text':
                setLoadingMessage('Đang chuẩn bị văn bản...');
                text = source.data as string;
                break;
            case 'url':
                setLoadingMessage('Đang lấy nội dung từ URL...');
                text = await fetchContentFromUrl(source.data as string);
                break;
            case 'youtube':
                throw new Error("Tính năng tạo thẻ ôn tập từ YouTube chưa được hỗ trợ.");
            default:
                throw new Error("Loại nguồn không xác định.");
        }

        if (!text.trim()) {
            throw new Error("Không tìm thấy nội dung để tạo thẻ ôn tập.");
        }

        setLoadingMessage('Đang tạo thẻ ôn tập, vui lòng đợi trong giây lát.');
        const generatedCards = await generateFlashcardsFromText(text);

        if (generatedCards.length === 0) {
            throw new Error("Không thể tạo thẻ ôn tập từ tài liệu này.");
        }
        
        setFlashcards(generatedCards);
        setAppState('EDITING');

    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định.';
        setError(errorMessage);
        setAppState('INPUT');
    } finally {
        setLoadingMessage('');
    }
  };

  const handleSaveCards = (cards: Flashcard[]) => {
    setFlashcards(cards);
    setAppState('VIEWING');
  };

  const handleStartOver = () => {
    setAppState('INPUT');
    setFlashcards([]);
    setError(null);
  };
  
  const renderContent = () => {
    switch(appState) {
        case 'INPUT':
            return <InputSourceSelector onGenerate={handleGenerate} maxFileSizeMB={MAX_FILE_SIZE_MB} disabled={false} />;
        case 'LOADING':
            return <Loader message={loadingMessage} />;
        case 'EDITING':
            return <FlashcardEditor initialCards={flashcards} onSave={handleSaveCards} onStartOver={handleStartOver} />;
        case 'VIEWING':
            return <FlashcardViewer cards={flashcards} onStartOver={handleStartOver} />;
        default:
            return null;
    }
  };

  return (
    <div className="bg-slate-100 text-slate-800 min-h-screen flex flex-col items-center justify-center p-4 sm:p-6">
      <main className="w-full max-w-4xl mx-auto flex flex-col items-center">
        <header className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600">
              LearnCard
            </h1>
            <p className="text-slate-600 mt-2 text-lg">
              Tạo thẻ ôn tập tự động - hăng say học tập
            </p>
        </header>

        {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6 w-full max-w-2xl text-center" role="alert">
                <strong className="font-bold">Lỗi!</strong>
                <span className="block sm:inline ml-2">{error}</span>
            </div>
        )}
        
        <div className="w-full max-w-2xl">
            {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;