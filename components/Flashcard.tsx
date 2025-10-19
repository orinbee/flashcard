import React from 'react';

interface FlashcardProps {
  question: string;
  answer: string;
  isFlipped: boolean;
  onFlip: () => void;
}

const Flashcard: React.FC<FlashcardProps> = ({ question, answer, isFlipped, onFlip }) => {
  return (
    <div 
      className="group w-full h-80 [perspective:1000px]"
      onClick={onFlip}
    >
      <div
        className="relative w-full h-full cursor-pointer rounded-xl transition-transform duration-700 [transform-style:preserve-3d]"
        style={{ transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
      >
        {}
        <div
          className="absolute w-full h-full p-6 flex flex-col justify-center items-center text-center bg-gradient-to-br from-yellow-100 via-orange-100 to-yellow-200 border border-orange-200 rounded-xl shadow-lg shadow-orange-200/50 [backface-visibility:hidden]"
        >
          <p className="text-sm font-bold tracking-wider text-orange-600 mb-4">CÂU HỎI</p>
          <p className="text-2xl font-bold text-orange-900">{question}</p>
          <div className="absolute bottom-4 text-xs text-orange-500 transition-opacity group-hover:opacity-0">Nhấn để xem câu trả lời</div>
          <div className="absolute bottom-4 text-xs text-orange-600 opacity-0 transition-opacity group-hover:opacity-100">Lật thẻ</div>
        </div>
        
        {/* Back Side (Answer) */}
        <div
          className="absolute w-full h-full p-6 flex flex-col justify-center items-center text-center bg-gradient-to-br from-rose-400 via-fuchsia-500 to-indigo-500 border border-fuchsia-400 rounded-xl shadow-2xl shadow-fuchsia-500/50 [backface-visibility:hidden] [transform:rotateY(180deg)]"
        >
          <p className="text-sm font-bold tracking-wider text-fuchsia-100 mb-4">CÂU TRẢ LỜI</p>
          <p className="text-2xl font-bold text-white">{answer}</p>
          <div className="absolute bottom-4 text-xs text-fuchsia-100">Nhấn để xem câu hỏi</div>
        </div>
      </div>
    </div>
  );
};

export default Flashcard;