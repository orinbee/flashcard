
import React from 'react';

interface LoaderProps {
  message: string;
}

const Loader: React.FC<LoaderProps> = ({ message }) => {
  return (
    <div className="mt-8 flex flex-col items-center justify-center space-y-4">
      <div className="w-12 h-12 border-4 border-slate-300 border-t-blue-500 rounded-full animate-spin"></div>
      <p className="text-slate-600">{message}</p>
    </div>
  );
};

export default Loader;