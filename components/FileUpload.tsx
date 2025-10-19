
import React, { useState, useCallback, useRef } from 'react';
import { UploadIcon } from './Icons';

interface FileUploadProps {
  onFileChange: (file: File | null) => void;
  maxFileSizeMB: number;
  disabled: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileChange, maxFileSizeMB, disabled }) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((file: File | null) => {
    if (file) {
      setFileName(file.name);
      onFileChange(file);
    } else {
      setFileName(null);
      onFileChange(null);
    }
  }, [onFileChange]);

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (disabled) return;
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const onFileChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div
        onDragOver={onDragOver}
        onDrop={onDrop}
        onClick={onButtonClick}
        className={`w-full p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-300 ${
          disabled ? 'border-slate-300 bg-slate-200 cursor-not-allowed' : 'border-slate-300 hover:border-blue-500 hover:bg-slate-50'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={onFileChangeHandler}
          accept=".pdf"
          className="hidden"
          disabled={disabled}
        />
        <div className="flex flex-col items-center text-center">
          <UploadIcon className="w-12 h-12 text-slate-400 mb-4" />
          <p className="text-lg font-semibold text-slate-700">
            Kéo và thả file PDF của bạn vào đây
          </p>
          <p className="text-slate-500">hoặc <span className="text-blue-600 font-medium">nhấn để chọn file</span></p>
          <p className="text-xs text-slate-500 mt-2">Kích thước file tối đa: {maxFileSizeMB}MB</p>
        </div>
      </div>
      {fileName && (
        <div className="mt-4 text-center text-sm text-slate-600 bg-slate-200 px-4 py-2 rounded-md">
          Tệp đã chọn: <span className="font-semibold text-slate-800">{fileName}</span>
        </div>
      )}
    </div>
  );
};

export default FileUpload;