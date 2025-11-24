import React, { useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Constellation } from './components/Constellation';
import { APP_DATA, MessageData, MESSAGES } from './constants';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';

const App: React.FC = () => {
  const [started, setStarted] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<MessageData | null>(null);
  const [viewedCount, setViewedCount] = useState(0);
  const [showFinal, setShowFinal] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);

  // Check if all messages viewed (or a significant portion) to show final phrase
  useEffect(() => {
    if (viewedCount > 0 && viewedCount === MESSAGES.length) {
      // Optional: trigger something when all read
    }
    // Show final phrase if formed and we want to just show it alongside
    if (started) {
      const timer = setTimeout(() => setShowFinal(true), 8000);
      return () => clearTimeout(timer);
    }
  }, [started, viewedCount]);

  const handleStart = () => {
    setStarted(true);
    // Here we would play audio if we had an asset
  };

  const handleMessageSelect = (msg: MessageData) => {
    setSelectedMessage(msg);
    setViewedCount(prev => prev + 1);
  };

  const closeMessage = () => {
    setSelectedMessage(null);
  };

  return (
    <div className="relative w-full h-full bg-slate-900 text-white overflow-hidden selection:bg-pink-500 selection:text-white select-none">
      
      {/* 3D Scene */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 20], fov: 60 }}>
          <color attach="background" args={['#020617']} />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          
          <Suspense fallback={null}>
            <Constellation 
              isFormed={started} 
              onMessageSelect={handleMessageSelect} 
              selectedId={selectedMessage?.id}
            />
          </Suspense>

          <EffectComposer>
            <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} height={300} intensity={1.5} />
            {/* Reduced darkness to prevent black corners obscuring the heart tip */}
            <Vignette eskil={false} offset={0.1} darkness={0.4} />
          </EffectComposer>
        </Canvas>
      </div>

      {/* UI Layer */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col items-center justify-center">
        
        {/* Intro Screen */}
        {!started && (
          <div className="pointer-events-auto text-center px-6 animate-fade-in transition-opacity duration-1000">
            <h1 className="text-4xl md:text-6xl font-light tracking-widest mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 drop-shadow-lg">
              {APP_DATA.title}
            </h1>
            <p className="text-lg md:text-xl text-slate-300 font-light mb-12 tracking-wide">
              {APP_DATA.subtitle}
            </p>
            <button
              onClick={handleStart}
              className="group relative px-8 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white font-medium tracking-wider hover:bg-white/20 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(255,255,255,0.2)]"
            >
              <span className="relative z-10">ABRIR EL CIELO</span>
            </button>
          </div>
        )}

        {/* Message Modal */}
        {selectedMessage && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md pointer-events-auto animate-fade-in">
            <div 
              className="relative max-w-lg w-full bg-slate-800/80 border border-white/10 rounded-2xl p-8 shadow-2xl animate-scale-in"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={closeMessage}
                className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors p-2"
                aria-label="Cerrar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="mb-6">
                <h3 className="text-2xl font-light text-pink-200 mb-1">{selectedMessage.name}</h3>
                <div className="h-0.5 w-12 bg-gradient-to-r from-pink-500 to-transparent"></div>
              </div>

              <div className="max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                <p className="text-lg text-slate-100 leading-relaxed font-light whitespace-pre-wrap">
                  {selectedMessage.message}
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-white/5 flex justify-center">
                <button
                  onClick={closeMessage}
                  className="text-sm text-slate-400 hover:text-white transition-colors uppercase tracking-widest"
                >
                  Seguir mirando
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer / Final Phrase */}
        {started && !selectedMessage && (
          <div className="absolute bottom-10 left-0 right-0 text-center pointer-events-none px-4">
             <div className={`transition-opacity duration-2000 ${showFinal ? 'opacity-100' : 'opacity-0'}`}>
               <p className="text-xl md:text-3xl font-light text-white/80 tracking-widest drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                 {APP_DATA.finalPhrase}
               </p>
               <p className="text-xs text-white/30 mt-4 uppercase tracking-[0.3em]">
                 Haz clic en las estrellas
               </p>
             </div>
          </div>
        )}
      </div>

      {/* Basic Tailwind Animation Keyframes via style injection since we aren't using an external CSS file for these specific animations */}
      <style>{`
        @keyframes fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }

        @keyframes scale-in {
          0% { opacity: 0; transform: scale(0.9); }
          100% { opacity: 1; transform: scale(1); }
        }
        .animate-scale-in {
          animation: scale-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default App;