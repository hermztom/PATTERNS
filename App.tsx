
import React from 'react';
import { Sidebar } from './components/Sidebar';
import { CanvasPreview } from './components/CanvasPreview';

const App: React.FC = () => {
  return (
    <div className="flex h-screen w-screen bg-[#0f0f0f] text-white selection:bg-white selection:text-black">
      <Sidebar />
      <main className="flex-1 h-full relative overflow-hidden">
        <div className="absolute top-8 right-8 z-20 pointer-events-none">
          <div className="bg-black/80 backdrop-blur px-4 py-2 border border-[#333] flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-[10px] mono uppercase tracking-widest">Live Renderer_Active</span>
            </div>
          </div>
        </div>
        <CanvasPreview />
      </main>
    </div>
  );
};

export default App;
