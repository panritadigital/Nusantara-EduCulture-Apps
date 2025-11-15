import React from 'react';
import { logoBase64Url } from '../assets/logo';

interface PPTViewerProps {
  powerpoint: {
    name: string;
    url: string;
  };
  onClose: () => void;
}

export default function PPTViewer({ powerpoint, onClose }: PPTViewerProps) {
  return (
    <div className="fixed inset-0 bg-brand-background z-[100] flex flex-col">
      <header className="flex items-center justify-between p-3 bg-brand-primary text-white shadow-md flex-shrink-0">
        <button onClick={onClose} className="flex items-center space-x-2 text-white hover:opacity-80 transition-opacity p-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="hidden sm:inline">Kembali</span>
        </button>
        <div className="flex flex-col items-center text-center">
            <div className="flex items-center space-x-2">
                <img src={logoBase64Url} alt="Logo" className="h-14 w-14 object-contain" style={{ filter: 'brightness(0) invert(1)' }}/>
                <h1 className="text-lg font-semibold truncate hidden sm:block">Nusantara EduCulture</h1>
            </div>
            <p className="text-xs text-gray-300 truncate">{powerpoint.name}</p>
        </div>
        <div className="w-28 sm:w-32"></div> {/* Spacer to balance the back button */}
      </header>
      <main className="flex-grow bg-gray-200">
        <object
          data={powerpoint.url}
          type="application/pdf"
          className="w-full h-full"
        >
            {/* Fallback UI for browsers that can't embed the PDF */}
            <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-white">
                <h2 className="text-xl font-semibold text-brand-primary mb-2">Pratinjau tidak tersedia</h2>
                <p className="text-gray-600 mb-4">
                  Browser Anda tidak dapat menampilkan pratinjau file ini secara langsung.
                </p>
                <a 
                    href={powerpoint.url} 
                    download={powerpoint.name}
                    className="bg-brand-secondary text-white px-6 py-2 rounded-md font-semibold hover:bg-opacity-90 transition-colors"
                >
                    Unduh {powerpoint.name}
                </a>
            </div>
        </object>
      </main>
    </div>
  );
}