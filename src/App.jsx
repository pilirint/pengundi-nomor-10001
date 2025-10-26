import React, { useState, useRef, useEffect } from 'react';
import { Trophy, RotateCw, Trash2, Download, Upload } from 'lucide-react';
import poster from './assets/poster.jpg';

const SpinWheel = () => {
  const [numbers, setNumbers] = useState(() => {
    const nums = [];
    for (let i = 10001; i <= 20000; i++) {
      nums.push(i.toString().padStart(5, '0'));
    }
    return nums;
  });
  
  const [displayNumber, setDisplayNumber] = useState('10001');
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState(null);
  const [history, setHistory] = useState([]);
  const [rotation, setRotation] = useState(0);
  
  const audioContextRef = useRef(null);

  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  const playSpinSound = () => {
    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.value = 200;
    oscillator.type = 'sine';
    gainNode.gain.value = 0.1;
    
    oscillator.start();
    const interval = setInterval(() => oscillator.frequency.value += 5, 50);
    
    setTimeout(() => {
      clearInterval(interval);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      oscillator.stop(ctx.currentTime + 0.5);
    }, 2000);
  };

  const playWinSound = () => {
    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.type = 'sine';
    gainNode.gain.value = 0.2;
    
    const notes = [523.25, 659.25, 783.99, 1046.5];
    let noteIndex = 0;
    
    oscillator.frequency.value = notes[0];
    oscillator.start();
    
    const noteInterval = setInterval(() => {
      noteIndex++;
      if (noteIndex < notes.length) {
        oscillator.frequency.value = notes[noteIndex];
      } else {
        clearInterval(noteInterval);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        oscillator.stop(ctx.currentTime + 0.2);
      }
    }, 150);
  };

  const spinWheel = () => {
    if (isSpinning || numbers.length === 0) return;
    setIsSpinning(true);
    setWinner(null);
    playSpinSound();
    
    const spinDuration = 3000;
    const startTime = Date.now();
    const extraRotations = 5 + Math.random() * 3;
    const startRotation = rotation;
    const endRotation = startRotation + (360 * extraRotations);
    
    const animateNumbers = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / spinDuration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentRotation = startRotation + (endRotation - startRotation) * easeOut;
      setRotation(currentRotation);
      
      if (progress < 1) {
        const randomIndex = Math.floor(Math.random() * numbers.length);
        setDisplayNumber(numbers[randomIndex]);
        requestAnimationFrame(animateNumbers);
      } else {
        const winnerIndex = Math.floor(Math.random() * numbers.length);
        const winningNumber = numbers[winnerIndex];
        setDisplayNumber(winningNumber);
        setWinner(winningNumber);
        setHistory(prev => [{ number: winningNumber, time: new Date().toLocaleString('id-ID') }, ...prev]);
        setNumbers(numbers.filter((_, idx) => idx !== winnerIndex));
        setIsSpinning(false);
        playWinSound();
      }
    };
    animateNumbers();
  };

  const resetNumbers = () => {
    const nums = [];
    for (let i = 10001; i <= 20000; i++) nums.push(i.toString().padStart(5, '0'));
    setNumbers(nums);
    setHistory([]);
    setDisplayNumber('10001');
    setWinner(null);
    setRotation(0);
  };

  const exportHistory = () => {
    const data = JSON.stringify({ history, remainingNumbers: numbers }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `undian-history-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importHistory = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.history) setHistory(data.history);
        if (data.remainingNumbers) setNumbers(data.remainingNumbers);
      } catch {
        alert('File tidak valid!');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">

        {/* Poster di atas */}
        <div className="mb-8">
          <img src={poster} alt="Poster" className="rounded-3xl shadow-2xl border-4 border-purple-700 w-full" />
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold text-center bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(255,255,255,0.4)] mb-2">
          Pesta Mameakhon Batu Ojahan HKBP Batam Centre
        </h1>
        <p className="text-center text-purple-200 mb-8 text-lg">Mesin Pengundi Nomor Undian 10.001 - 20.000</p>

        {/* BAGIAN UTAMA (roda, tombol, riwayat) */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl">
            <div className="relative w-full max-w-md mx-auto aspect-square">
              <div 
                className="absolute inset-0 rounded-full border-8 border-yellow-400 shadow-2xl overflow-hidden"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transition: isSpinning ? 'none' : 'transform 0.5s ease-out',
                  background: 'conic-gradient(from 0deg, #ef4444, #f59e0b, #10b981, #3b82f6, #8b5cf6, #ec4899, #ef4444)'
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white rounded-full w-2/3 h-2/3 flex items-center justify-center shadow-xl border-4 border-yellow-300">
                    <div className="text-center">
                      <div className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                        {displayNumber}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 z-10">
                <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[40px] border-t-red-500 drop-shadow-lg"></div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={spinWheel}
                disabled={isSpinning || numbers.length === 0}
                className={`px-12 py-4 rounded-full font-bold text-xl text-white shadow-lg transform transition-all duration-200 ${
                  isSpinning || numbers.length === 0
                    ? 'bg-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-pink-500 to-purple-600 hover:scale-105 hover:shadow-2xl active:scale-95'
                }`}
              >
                {isSpinning ? (
                  <span className="flex items-center gap-2 justify-center">
                    <RotateCw className="animate-spin" size={24} />
                    Berputar...
                  </span>
                ) : numbers.length === 0 ? (
                  'Nomor Habis'
                ) : (
                  'SPIN!'
                )}
              </button>

              <div className="mt-4 text-white/80">
                Sisa Nomor: <span className="font-bold text-yellow-300">{numbers.length}</span> / 10000
              </div>
            </div>

            <div className="flex gap-3 mt-6 justify-center flex-wrap">
              <button onClick={resetNumbers} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center gap-2">
                <Trash2 size={18} /> Reset
              </button>
              <button onClick={exportHistory} disabled={history.length === 0} className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center gap-2 disabled:bg-gray-500 disabled:cursor-not-allowed">
                <Download size={18} /> Export
              </button>
              <label className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-2 cursor-pointer">
                <Upload size={18} /> Import
                <input type="file" accept=".json" onChange={importHistory} className="hidden" />
              </label>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Trophy className="text-yellow-400" /> Riwayat Pemenang
            </h2>
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {history.length === 0 ? (
                <p className="text-purple-200 text-center py-8">Belum ada pemenang</p>
              ) : (
                history.map((item, index) => (
                  <div key={index} className="bg-white/20 rounded-lg p-4 backdrop-blur-sm border border-white/30">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-yellow-300">{item.number}</span>
                      <span className="text-xs text-purple-200">#{history.length - index}</span>
                    </div>
                    <div className="text-xs text-purple-200 mt-1">{item.time}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SpinWheel;
