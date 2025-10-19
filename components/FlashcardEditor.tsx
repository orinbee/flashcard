import React, { useState } from 'react';
import { type Flashcard as FlashcardType } from '../types';
import { PlusIcon, TrashIcon, PlayIcon } from './Icons';

interface FlashcardEditorProps {
  initialCards: FlashcardType[];
  onSave: (cards: FlashcardType[]) => void;
  onStartOver: () => void;
}

const FlashcardEditor: React.FC<FlashcardEditorProps> = ({ initialCards, onSave, onStartOver }) => {
  const [cards, setCards] = useState<FlashcardType[]>(initialCards);

  const handleCardChange = (id: string, field: 'question' | 'answer', value: string) => {
    setCards(currentCards =>
      currentCards.map(card =>
        card.id === id ? { ...card, [field]: value } : card
      )
    );
  };

  const handleDeleteCard = (id: string) => {
    setCards(currentCards => currentCards.filter(card => card.id !== id));
  };

  const handleAddCard = () => {
    const newCard: FlashcardType = {
      id: crypto.randomUUID(),
      question: '',
      answer: '',
    };
    setCards(currentCards => [...currentCards, newCard]);
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-lg p-6 sm:p-8 border border-slate-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Chỉnh sửa bộ thẻ của bạn</h2>
        <button 
            onClick={onStartOver}
            className="px-4 py-2 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300 transition-colors text-sm"
        >
            Bắt đầu lại
        </button>
      </div>
      
      <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
        {cards.map((card, index) => (
          <div key={card.id} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm font-bold text-blue-600">Thẻ {index + 1}</span>
              <button 
                onClick={() => handleDeleteCard(card.id)}
                className="text-slate-400 hover:text-red-500 transition-colors"
                aria-label={`Xóa thẻ ${index + 1}`}
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor={`question-${card.id}`} className="block text-sm font-medium text-slate-500 mb-1">Câu hỏi</label>
                <textarea
                  id={`question-${card.id}`}
                  value={card.question}
                  onChange={(e) => handleCardChange(card.id, 'question', e.target.value)}
                  className="w-full h-24 p-2 bg-white border border-slate-300 rounded-md text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                  placeholder="Nhập câu hỏi..."
                />
              </div>
              <div>
                <label htmlFor={`answer-${card.id}`} className="block text-sm font-medium text-slate-500 mb-1">Câu trả lời</label>
                <textarea
                  id={`answer-${card.id}`}
                  value={card.answer}
                  onChange={(e) => handleCardChange(card.id, 'answer', e.target.value)}
                  className="w-full h-24 p-2 bg-white border border-slate-300 rounded-md text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                  placeholder="Nhập câu trả lời..."
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <button
          onClick={handleAddCard}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2 border-2 border-dashed border-slate-300 text-slate-500 font-semibold rounded-lg hover:border-blue-500 hover:text-blue-500 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          Thêm thẻ mới
        </button>
        <button
            onClick={() => onSave(cards)}
            disabled={cards.length === 0}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-lg hover:from-cyan-600 hover:to-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all duration-300 shadow"
        >
            <PlayIcon className="w-5 h-5" />
            Lưu và Bắt đầu học
        </button>
      </div>
    </div>
  );
};

export default FlashcardEditor;