import React, { useState, useRef, useEffect } from 'react';
import { Activity, Shuffle, Power } from 'lucide-react';

// Typ dla emocji
type Emotion = {
  name: string;
  plName: string;
  code: string;
  color: string;
};

// Komponent RetroPanel
const RetroPanel = ({ children, variant = 'default' }) => {
  const variants = {
    default: 'from-gray-800 to-gray-900',
    darker: 'from-gray-900 to-gray-950',
    lighter: 'from-gray-700 to-gray-800'
  };

  return (
    <div className={`
      bg-gradient-to-b ${variants[variant]}
      rounded-lg border border-gray-700
      shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]
      p-6
    `}>
      {children}
    </div>
  );
};

// Komponenty layoutu
const RetroLayout = ({ children }) => (
  <div className="p-6 bg-gradient-to-b from-gray-900 to-gray-950 rounded-xl shadow-2xl border border-gray-700">
    <div className="flex flex-col gap-4">
      {children}
    </div>
  </div>
);

const RetroDisplayPanel = ({ children }) => (
  <RetroPanel variant="darker">
    <div className="flex items-center gap-4">
      {children}
    </div>
  </RetroPanel>
);

const RetroControlPanel = ({ children }) => (
  <RetroPanel>
    <div className="flex flex-wrap justify-center gap-8">
      {children}
    </div>
  </RetroPanel>
);

// Poprawiony komponent RetroKnob
const RetroKnob = ({ 
  value = 5,
  onChange,
  color = '#ff0000',
  label = '',
  size = 'medium',
  showValue = true,
  min = 0,
  max = 10,
  step = 1,
  sensitivity = 0.5
}) => {
  const knobRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startValue, setStartValue] = useState(value);
  const [localValue, setLocalValue] = useState(value);
  const [rotation, setRotation] = useState(-135 + (270 * (value - min) / (max - min)));

  const sizes = {
    small: { knob: 'w-16 h-16', indicator: 'w-1 h-5', text: 'text-xs' },
    medium: { knob: 'w-20 h-20', indicator: 'w-1 h-6', text: 'text-sm' },
    large: { knob: 'w-24 h-24', indicator: 'w-1.5 h-8', text: 'text-base' }
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging && knobRef.current) {
        e.preventDefault();
        const deltaY = (startY - e.clientY) * sensitivity;
        const range = max - min;
        const deltaValue = (deltaY / 100) * range;
        const newValue = Math.round(Math.min(max, Math.max(min, startValue + deltaValue)));
        
        if (newValue !== localValue) {
          setLocalValue(newValue);
          setRotation(-135 + (270 * (newValue - min) / range));
          onChange(newValue);
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, startY, startValue, min, max, sensitivity, onChange, localValue]);

  useEffect(() => {
    setLocalValue(value);
    setRotation(-135 + (270 * (value - min) / (max - min)));
  }, [value, min, max]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartY(e.clientY);
    setStartValue(localValue);
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        ref={knobRef}
        className={`
          ${sizes[size].knob}
          rounded-full relative 
          cursor-grab active:cursor-grabbing
          transition-shadow duration-200
        `}
        style={{
          background: 'linear-gradient(145deg, #2a2a2a, #1a1a1a)',
          boxShadow: isDragging
            ? '4px 4px 8px #0a0a0a, -4px -4px 8px #3a3a3a'
            : '8px 8px 16px #0a0a0a, -8px -8px 16px #3a3a3a'
        }}
        onMouseDown={handleMouseDown}
      >
        <div
          className={`
            absolute 
            ${sizes[size].indicator}
            bg-gray-300 rounded-full 
            left-1/2 -translate-x-1/2 
            origin-bottom 
            transition-transform duration-75
          `}
          style={{
            bottom: '50%',
            transform: `translateX(-50%) rotate(${rotation}deg)`,
          }}
        />
      </div>
      {(label || showValue) && (
        <div className="text-center">
          {label && (
            <div 
              style={{ color }} 
              className={`${sizes[size].text} font-bold tracking-wider`}
            >
              {label}
            </div>
          )}
          {showValue && (
            <div 
              className={`${sizes[size].text} font-mono mt-1`}
              style={{ color }}
            >
              {localValue}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const EmotionMixer = () => {
  const [power, setPower] = useState(false);
  const [selectedEmotions, setSelectedEmotions] = useState([]);
  const [emotionValues, setEmotionValues] = useState({});
  const [activeRandomButton, setActiveRandomButton] = useState(null);

  const emotions = [
    { name: 'Joy', plName: 'Radość', code: 'JO', color: '#FFD700' },
    { name: 'Trust', plName: 'Zaufanie', code: 'TR', color: '#4CAF50' },
    { name: 'Fear', plName: 'Strach', code: 'FR', color: '#9C27B0' },
    { name: 'Surprise', plName: 'Zaskoczenie', code: 'SU', color: '#FF9800' },
    { name: 'Sadness', plName: 'Smutek', code: 'SA', color: '#2196F3' },
    { name: 'Disgust', plName: 'Odraza', code: 'DI', color: '#795548' },
    { name: 'Anger', plName: 'Gniew', code: 'AG', color: '#F44336' },
    { name: 'Anticipation', plName: 'Oczekiwanie', code: 'AN', color: '#3F51B5' }
  ];

  const handleEmotionSelect = (emotion) => {
    if (selectedEmotions.includes(emotion)) {
      setSelectedEmotions(selectedEmotions.filter(e => e !== emotion));
      const newValues = { ...emotionValues };
      delete newValues[emotion];
      setEmotionValues(newValues);
    } else if (selectedEmotions.length < 3) {
      setSelectedEmotions([...selectedEmotions, emotion]);
      setEmotionValues(prev => ({ ...prev, [emotion]: 5 }));
    }
  };

  const generateCSECode = () => {
    if (selectedEmotions.length === 0) return 'NO INPUT';
    
    const sortedEmotions = [...selectedEmotions].sort((a, b) => {
      const codeA = emotions.find(e => e.name === a).code;
      const codeB = emotions.find(e => e.name === b).code;
      return codeA.localeCompare(codeB);
    });

    const codes = sortedEmotions
      .map(name => emotions.find(e => e.name === name).code)
      .join('.');

    const intensities = sortedEmotions
      .map(name => {
        const value = emotionValues[name];
        return value <= 3 ? 'L' : value <= 7 ? 'M' : 'H';
      })
      .join('.');

    return `CSE-[${codes}]-[${intensities}]-001`;
  };

  const handleRandomClick = (count) => {
    setActiveRandomButton(count);
    setSelectedEmotions([]);
    setEmotionValues({});
    
    const shuffled = [...emotions]
      .sort(() => Math.random() - 0.5)
      .slice(0, count);
    
    const newEmotions = shuffled.map(emotion => emotion.name);
    const newValues = Object.fromEntries(
      shuffled.map(emotion => [
        emotion.name,
        Math.floor(Math.random() * 11)
      ])
    );
    
    setSelectedEmotions(newEmotions);
    setEmotionValues(newValues);
  };

  return (
    <RetroLayout>
      <RetroDisplayPanel>
        <div className="flex items-center w-full">
          <button
            onClick={() => setPower(!power)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              power 
                ? 'bg-red-500 shadow-lg shadow-red-500/50 hover:bg-red-600' 
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            <Power className="w-6 h-6" />
          </button>
          <div className="flex-1 flex justify-center">
            <h2 className="font-mono text-2xl tracking-wider whitespace-nowrap bg-gradient-to-r from-gray-100 to-gray-300 bg-clip-text text-transparent">
              EMOTION MIXER 3000
            </h2>
          </div>
        </div>
      </RetroDisplayPanel>

      <RetroDisplayPanel>
        <div className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 rounded font-mono border border-gray-800">
          <Activity className={`w-4 h-4 ${power ? 'text-green-500' : 'text-gray-600'}`} />
          <span className={`${power ? 'text-green-500' : 'text-gray-600'} min-w-[140px] text-right`}>
            {power ? generateCSECode() : 'OFFLINE'}
          </span>
        </div>
      </RetroDisplayPanel>

      {power && (
        <>
          <RetroDisplayPanel>
            <div className="w-full flex justify-center gap-4">
              {[1, 2, 3].map(count => (
                <button
                  key={count}
                  onClick={() => handleRandomClick(count)}
                  className={`flex items-center gap-2 px-6 py-3 bg-gradient-to-b from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 rounded-lg transition-all shadow-lg border border-gray-600 ${
                    activeRandomButton === count ? 'shadow-xl shadow-blue-500/20 text-white' : 'text-gray-300'
                  }`}
                >
                  <Shuffle className="w-4 h-4" />
                  <span className="font-mono">
                    {count} {count === 1 ? 'emocja' : 'emocje'}
                  </span>
                </button>
              ))}
            </div>
          </RetroDisplayPanel>
          
          <RetroPanel>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {emotions.map(({ name, plName, color, code }) => (
                <button
                  key={name}
                  onClick={() => handleEmotionSelect(name)}
                  className={`p-3 rounded-lg transition-all bg-gradient-to-b from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 ${
                    selectedEmotions.includes(name) 
                      ? 'shadow-xl shadow-blue-500/20 text-white' 
                      : 'text-gray-300'
                  }`}
                  style={{ 
                    borderLeft: `4px solid ${selectedEmotions.includes(name) ? color : 'transparent'}`,
                    opacity: selectedEmotions.includes(name) || selectedEmotions.length < 3 ? 1 : 0.5
                  }}
                >
                  <div className="font-mono tracking-wide">{plName}</div>
                  <div className="text-xs text-gray-500 font-mono">({code})</div>
                </button>
              ))}
            </div>
          </RetroPanel>

          <RetroControlPanel>
            {selectedEmotions.map(emotionName => {
              const emotion = emotions.find(e => e.name === emotionName);
              return (
                <RetroKnob
                  key={emotion.name}
                  value={emotionValues[emotion.name]}
                  onChange={(newValue) => 
                    setEmotionValues(prev => ({
                      ...prev,
                      [emotion.name]: newValue
                    }))
                  }
                  color={emotion.color}
                  label={emotion.plName}
                  size="large"
                  min={0}
                  max={10}
                  step={1}
                  sensitivity={0.5}
                  showValue={true}
                />
              );
            })}
          </RetroControlPanel>
        </>
      )}
    </RetroLayout>
  );
};

export default EmotionMixer;
