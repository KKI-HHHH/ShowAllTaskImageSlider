
import React, { useState } from 'react';
import ImageCarouselModal from './components/ImageCarouselModal';
import { MOCK_IMAGES } from './constants';

const CameraIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.776 48.776 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
    </svg>
);

const App: React.FC = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 p-4">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Image Gallery Showcase</h1>
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-8">Click the button below to view a collection of beautiful images in a responsive carousel.</p>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-3 bg-red-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-300 dark:focus:ring-red-800 transition-all duration-300 ease-in-out transform hover:scale-105"
        >
          <CameraIcon className="h-6 w-6" />
          Open Image Gallery
        </button>
      </div>

      <ImageCarouselModal
        show={showModal}
        onHide={() => setShowModal(false)}
        images={MOCK_IMAGES}
      />
    </div>
  );
};

export default App;
