import React, { useState, useEffect } from 'react';
import { type Flashcard as FlashcardType } from '../types';
import Flashcard from './Flashcard';
import { ArrowLeftIcon, ArrowRightIcon, ExportIcon } from './Icons';

declare const docx: any;
declare global {
  interface Window {
    jspdf: any;
    html2canvas: any;
  }
}

interface FlashcardViewerProps {
  cards: FlashcardType[];
  onStartOver: () => void;
}

const FlashcardViewer: React.FC<FlashcardViewerProps> = ({ cards, onStartOver }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isDocxLibLoaded, setIsDocxLibLoaded] = useState(false);
  const [isPdfLibLoaded, setIsPdfLibLoaded] = useState(false);

  useEffect(() => {
    // Reset flip state when card changes
    setIsFlipped(false);
  }, [currentIndex]);

  useEffect(() => {
    let docxInterval: number | undefined;
    let pdfInterval: number | undefined;

    // Check for the docx library.
    if (typeof docx === 'undefined') {
        docxInterval = window.setInterval(() => {
            if (typeof docx !== 'undefined') {
                setIsDocxLibLoaded(true);
                clearInterval(docxInterval);
            }
        }, 500);
    } else {
        setIsDocxLibLoaded(true);
    }
    
    // Check for the PDF libraries
    if (typeof window.jspdf === 'undefined' || typeof window.html2canvas === 'undefined') {
        pdfInterval = window.setInterval(() => {
            if (typeof window.jspdf !== 'undefined' && typeof window.html2canvas !== 'undefined') {
                setIsPdfLibLoaded(true);
                clearInterval(pdfInterval);
            }
        }, 500);
    } else {
        setIsPdfLibLoaded(true);
    }
    
    // Cleanup on unmount
    return () => {
        if (docxInterval) clearInterval(docxInterval);
        if (pdfInterval) clearInterval(pdfInterval);
    };
  }, []);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % cards.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + cards.length) % cards.length);
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };
  
  const handleExportPdf = async () => {
    if (!isPdfLibLoaded) {
      alert('Thư viện xuất PDF chưa sẵn sàng. Vui lòng đợi một lát rồi thử lại.');
      return;
    }
    if (!cards || cards.length === 0) return;

    // Create a hidden element with the content to be exported
    const report = document.createElement('div');
    report.style.position = 'absolute';
    report.style.left = '-9999px';
    report.style.width = '794px'; // A4-ish width for better layouting
    report.innerHTML = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; padding: 40px; color: #333;">
          <h1 style="border-bottom: 2px solid #ccc; padding-bottom: 10px; color: #000; font-size: 24px;">Flashcards</h1>
          ${cards.map((card, index) => `
              <div style="border: 1px solid #ddd; border-radius: 8px; padding: 15px; margin-bottom: 20px; page-break-inside: avoid; background-color: #f9f9f9;">
                  <div style="font-weight: bold; font-size: 1.1em;">Câu hỏi ${index + 1}: ${card.question}</div>
                  <div style="margin-top: 8px;">Trả lời: ${card.answer}</div>
              </div>
          `).join('')}
      </div>
    `;
    document.body.appendChild(report);

    try {
      const { jsPDF } = window.jspdf;
      const canvas = await window.html2canvas(report, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      const canvasHeightInMM = (imgHeight * pdfWidth) / imgWidth;
      let position = 0;
      let heightLeft = canvasHeightInMM;
      
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, canvasHeightInMM);
      heightLeft -= pdfHeight;

      while (heightLeft >= 0) {
        position = -heightLeft;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, canvasHeightInMM);
        heightLeft -= pdfHeight;
      }
      
      pdf.save('flashcards.pdf');
    } catch (error) {
      console.error("Lỗi khi xuất PDF:", error);
      alert("Đã xảy ra lỗi khi tạo file PDF.");
    } finally {
      document.body.removeChild(report);
    }
  };

  const handleExportDocx = () => {
    if (!isDocxLibLoaded) {
        console.error('DOCX library not loaded or not ready.');
        alert('Thư viện xuất DOCX chưa sẵn sàng. Vui lòng đợi một lát rồi thử lại.');
        return;
    }
    if (!cards || cards.length === 0) {
        return;
    };

    const docChildren = cards.flatMap((card, index) => [
        new docx.Paragraph({
            children: [
                new docx.TextRun({ text: `Câu hỏi ${index + 1}: `, bold: true }),
                new docx.TextRun({text: card.question}),
            ],
            spacing: { after: 100 },
        }),
        new docx.Paragraph({
            children: [
                new docx.TextRun({ text: `Trả lời: `, bold: true }),
                new docx.TextRun({text: card.answer}),
            ],
            spacing: { after: 300 },
        }),
    ]);

    const document = new docx.Document({
        sections: [{
            children: docChildren,
        }],
    });
    
    docx.Packer.toBlob(document).then((blob: Blob) => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'flashcards.docx';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    });
  };

  if (!cards || cards.length === 0) {
    return (
      <div className="text-center text-slate-500">
        <p>Không có thẻ nào để hiển thị.</p>
        <button 
            onClick={onStartOver}
            className="mt-4 px-4 py-2 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300 transition-colors"
        >
            Bắt đầu lại
        </button>
      </div>
    );
  }

  const currentCard = cards[currentIndex];

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
      <div className="w-full mb-6">
          <Flashcard 
              question={currentCard.question}
              answer={currentCard.answer}
              isFlipped={isFlipped}
              onFlip={handleFlip}
          />
      </div>
      
      <div className="text-center text-slate-600 font-medium mb-6">
          Thẻ {currentIndex + 1} / {cards.length}
      </div>

      <div className="flex items-center justify-center w-full space-x-4 mb-8">
          <button onClick={handlePrev} className="p-3 rounded-full bg-white hover:bg-slate-200 text-slate-600 border border-slate-300 transition-colors shadow-sm" aria-label="Thẻ trước">
              <ArrowLeftIcon className="w-6 h-6" />
          </button>
          <button onClick={handleNext} className="p-3 rounded-full bg-white hover:bg-slate-200 text-slate-600 border border-slate-300 transition-colors shadow-sm" aria-label="Thẻ tiếp theo">
              <ArrowRightIcon className="w-6 h-6" />
          </button>
      </div>

      <div className="flex items-center justify-center w-full flex-wrap gap-4">
        <button 
            onClick={onStartOver}
            className="px-6 py-2 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300 transition-colors"
        >
            Bắt đầu lại
        </button>
        <button 
            onClick={handleExportPdf}
            disabled={!isPdfLibLoaded}
            className="flex items-center justify-center gap-2 px-6 py-2 bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-semibold rounded-lg hover:from-sky-600 hover:to-cyan-600 transition-all shadow disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Tải về bộ thẻ dưới dạng PDF"
        >
            <ExportIcon className="w-5 h-5" />
            {isPdfLibLoaded ? 'Tải về PDF' : 'Đang tải...'}
        </button>
        <button 
            onClick={handleExportDocx}
            disabled={!isDocxLibLoaded}
            className="flex items-center justify-center gap-2 px-6 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold rounded-lg hover:from-teal-600 hover:to-emerald-600 transition-all shadow disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Tải về bộ thẻ dưới dạng DOCX"
        >
            <ExportIcon className="w-5 h-5" />
            {isDocxLibLoaded ? 'Tải về DOCX' : 'Đang tải...'}
        </button>
      </div>
    </div>
  );
};

export default FlashcardViewer;