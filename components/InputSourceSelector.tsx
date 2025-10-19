import React, { useState } from 'react';
import FileUpload from './FileUpload';
import { PlayIcon } from './Icons';

type InputSource = 'pdf' | 'text' | 'url' | 'youtube';

interface InputSourceSelectorProps {
  onGenerate: (source: { type: InputSource; data: File | string }) => void;
  maxFileSizeMB: number;
  disabled: boolean;
}

const tabs: { id: InputSource; label: string }[] = [
  { id: 'pdf', label: 'Tải lên PDF' },
  { id: 'text', label: 'Dán văn bản' },
  { id: 'url', label: 'Từ URL' },
  { id: 'youtube', label: 'Từ YouTube' },
];

const InputSourceSelector: React.FC<InputSourceSelectorProps> = ({ onGenerate, maxFileSizeMB, disabled }) => {
    const [activeTab, setActiveTab] = useState<InputSource>('pdf');
    
    const [file, setFile] = useState<File | null>(null);
    const [text, setText] = useState<string>('');
    const [url, setUrl] = useState<string>('');
    const [youtubeUrl, setYoutubeUrl] = useState<string>('');

    const handleGenerateClick = () => {
        if (disabled) return;

        switch (activeTab) {
            case 'pdf':
                if (file) onGenerate({ type: 'pdf', data: file });
                break;
            case 'text':
                if (text.trim()) onGenerate({ type: 'text', data: text });
                break;
            case 'url':
                if (url.trim()) onGenerate({ type: 'url', data: url });
                break;
            case 'youtube':
                if (youtubeUrl.trim()) onGenerate({ type: 'youtube', data: youtubeUrl });
                break;
        }
    };
    
    const isGenerateButtonDisabled = () => {
        if (disabled) return true;
        switch (activeTab) {
            case 'pdf':
                return !file;
            case 'text':
                return text.trim() === '';
            case 'url':
                return url.trim() === '';
            case 'youtube':
                return youtubeUrl.trim() === '';
            default:
                return true;
        }
    };

    return (
        <div className="w-full">
            <div className="bg-white rounded-lg border border-slate-200 shadow-lg">
                <div className="flex border-b border-slate-200">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            disabled={disabled}
                            className={`flex-1 py-3 px-2 text-sm font-medium transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed ${
                                activeTab === tab.id
                                    ? 'text-blue-600 font-semibold border-b-2 border-blue-600'
                                    : 'text-slate-500 hover:bg-slate-100'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="p-6 min-h-[250px] flex flex-col justify-center">
                    {activeTab === 'pdf' && (
                        <FileUpload 
                            onFileChange={setFile}
                            maxFileSizeMB={maxFileSizeMB}
                            disabled={disabled}
                        />
                    )}
                    {activeTab === 'text' && (
                        <div>
                            <textarea
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                className="w-full h-48 p-3 bg-slate-100 border border-slate-300 rounded-md text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-y"
                                placeholder="Dán nội dung văn bản của bạn vào đây..."
                                disabled={disabled}
                            />
                            <p className="text-xs text-slate-500 mt-2">Dán nội dung từ tài liệu của bạn để tạo flashcards.</p>
                        </div>
                    )}
                    {activeTab === 'url' && (
                         <div>
                            <label htmlFor="url-input" className="block text-sm font-medium text-slate-600 mb-2">Nhập URL của trang web</label>
                            <input
                                id="url-input"
                                type="url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                className="w-full p-3 bg-slate-100 border border-slate-300 rounded-md text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                placeholder="https://example.com/article"
                                disabled={disabled}
                            />
                            <p className="text-xs text-orange-600 mt-2">Lưu ý: Tính năng này đang trong giai đoạn phát triển</p>
                        </div>
                    )}
                    {activeTab === 'youtube' && (
                         <div>
                            <label htmlFor="youtube-url-input" className="block text-sm font-medium text-slate-600 mb-2">Nhập URL của video YouTube</label>
                            <input
                                id="youtube-url-input"
                                type="url"
                                value={youtubeUrl}
                                onChange={(e) => setYoutubeUrl(e.target.value)}
                                className="w-full p-3 bg-slate-100 border border-slate-300 rounded-md text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                placeholder="https://www.youtube.com/watch?v=..."
                                disabled={disabled}
                            />
                            <p className="text-xs text-amber-600 mt-2">Lưu ý: Tính năng này đang trong giai đoạn phát triển</p>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-slate-200 bg-slate-50 rounded-b-lg">
                    <button
                        onClick={handleGenerateClick}
                        disabled={isGenerateButtonDisabled()}
                        className="w-full flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-lg hover:from-cyan-600 hover:to-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all duration-300 shadow"
                    >
                        <PlayIcon className="w-5 h-5" />
                        Bắt đầu tạo thẻ
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InputSourceSelector;