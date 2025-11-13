import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { AspectRatio, Quality, Option, FilterOption } from './types';
import { ASPECT_RATIO_OPTIONS, QUALITY_OPTIONS, FILTERS } from './constants';
import { generateImage, fileToBase64 } from './services/geminiService';

// --- Helper Icon Components ---
const UploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const ImageIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

const RotateLeftIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7zM15 12H9m3 3V9" transform="rotate(-90 12 12)" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12a9 9 0 019-9v0a9 9 0 019 9v0a9 9 0 01-9 9v0a9 9 0 01-9-9v0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l-4-4 4-4" />
    </svg>
);

const RotateRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7zM15 12H9m3 3V9" transform="rotate(90 12 12)" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9v0a9 9 0 01-9-9v0a9 9 0 019-9v0a9 9 0 019 9v0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 12l4-4-4-4" />
    </svg>
);

const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

const CopyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);
const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
);

interface OptionSelectorProps<T extends string> {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: Option<T>[];
  disabled?: boolean;
}

const OptionSelector = <T extends string,>({ label, value, onChange, options, disabled = false }: OptionSelectorProps<T>) => (
  <div>
    <label className="block text-sm font-medium text-gray-400 mb-2">{label}</label>
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        disabled={disabled}
        className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
        </svg>
      </div>
    </div>
  </div>
);

const App: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('Фотореалистичное изображение величественного льва в короне, детализированная шерсть, драматическое освещение');
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imageBase64, setImageBase64] = useState<{ mimeType: string, data: string } | null>(null);
  
  // Load initial state from localStorage, with fallbacks
  const [quality, setQuality] = useState<Quality>(
    () => (localStorage.getItem('glad-dron-quality') as Quality) || 'hd'
  );
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(
    () => (localStorage.getItem('glad-dron-aspectRatio') as AspectRatio) || '16:9'
  );
  
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [rotation, setRotation] = useState<number>(0);
  const [filterClass, setFilterClass] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Save settings to localStorage on change
  useEffect(() => {
    localStorage.setItem('glad-dron-quality', quality);
  }, [quality]);

  useEffect(() => {
    localStorage.setItem('glad-dron-aspectRatio', aspectRatio);
  }, [aspectRatio]);

  const isImageUploadDisabled = useMemo(() => quality === 'hd', [quality]);
  const isAspectRatioDisabled = useMemo(() => quality === 'standard', [quality]);
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedImage(file);
      try {
        const base64Data = await fileToBase64(file);
        setImageBase64(base64Data);
      } catch (err) {
        setError('Не удалось прочитать файл изображения.');
        setUploadedImage(null);
        setImageBase64(null);
      }
    }
  };

  const removeImage = () => {
    setUploadedImage(null);
    setImageBase64(null);
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };
  
  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) {
      setError("Пожалуйста, введите промпт (запрос).");
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const result = await generateImage({
        prompt,
        quality,
        aspectRatio,
        imageBase64: isImageUploadDisabled ? undefined : imageBase64,
      });
      setGeneratedImage(result);
      setRotation(0);
      setFilterClass('');
    } catch (err) {
      setError(err instanceof Error ? err.message : "Произошла неизвестная ошибка.");
    } finally {
      setIsLoading(false);
    }
  }, [prompt, quality, aspectRatio, imageBase64, isImageUploadDisabled]);

  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    const mimeType = generatedImage.split(';')[0].split(':')[1];
    const extension = mimeType.split('/')[1] || 'png';
    link.download = `glad-dron-generated.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyPrompt = () => {
    if (!prompt) return;
    navigator.clipboard.writeText(prompt).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col p-4 sm:p-6 lg:p-8">
      <header className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          GLAD DRON
        </h1>
        <p className="text-gray-400 mt-2">Студия генерации изображений с помощью ИИ</p>
      </header>

      <main className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Controls Panel */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col space-y-6">
          <h2 className="text-2xl font-semibold border-b border-gray-700 pb-3">Управление</h2>
          
          <div>
            <div className="flex justify-between items-center mb-2">
                <label htmlFor="prompt" className="block text-sm font-medium text-gray-400">
                Промпт (запрос)
                </label>
                <button
                    onClick={handleCopyPrompt}
                    className={`flex items-center text-xs px-2 py-1 rounded-md transition-all ${isCopied ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                    disabled={!prompt}
                >
                    {isCopied ? (
                        <>
                            <CheckIcon />
                            Скопировано!
                        </>
                    ) : (
                        <>
                            <CopyIcon />
                            Копировать
                        </>
                    )}
                </button>
            </div>
            <textarea
              id="prompt"
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Опишите изображение, которое вы хотите создать..."
              className="w-full bg-gray-700 border border-gray-600 rounded-md p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Загрузить изображение (для редактирования)</label>
            {isImageUploadDisabled && (
              <div className="text-xs text-yellow-400 bg-yellow-900/50 p-2 rounded-md">
                Загрузка изображений отключена для генерации в высоком качестве (HD).
              </div>
            )}
            {!uploadedImage ? (
                <label htmlFor="file-upload" className={`flex items-center justify-center w-full p-4 border-2 border-dashed rounded-md cursor-pointer transition-colors ${isImageUploadDisabled ? 'border-gray-700 text-gray-600 bg-gray-800 cursor-not-allowed' : 'border-gray-600 text-gray-400 hover:border-blue-500 hover:bg-gray-700'}`}>
                    <UploadIcon />
                    <span>Нажмите, чтобы загрузить</span>
                    <input id="file-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={isImageUploadDisabled} />
                </label>
            ) : (
                <div className="relative group">
                    <img src={URL.createObjectURL(uploadedImage)} alt="Предпросмотр" className="w-full h-32 object-cover rounded-md" />
                    <button onClick={removeImage} className="absolute top-2 right-2 p-1.5 bg-red-600/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500">
                        <TrashIcon />
                    </button>
                </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <OptionSelector label="Качество" value={quality} onChange={(v) => setQuality(v)} options={QUALITY_OPTIONS} />
            <OptionSelector label="Соотношение сторон" value={aspectRatio} onChange={(v) => setAspectRatio(v)} options={ASPECT_RATIO_OPTIONS} disabled={isAspectRatioDisabled} />
          </div>
          
          <div className="pt-4 mt-auto">
            <button
              onClick={handleGenerate}
              disabled={isLoading || !prompt}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 px-4 rounded-md hover:from-blue-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-600 disabled:to-gray-700 flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Генерация...
                </>
              ) : (
                'Сгенерировать изображение'
              )}
            </button>
          </div>
        </div>

        {/* Output Panel */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col items-center justify-center">
          <h2 className="text-2xl font-semibold border-b border-gray-700 pb-3 w-full text-center mb-4">Результат</h2>
          <div className="w-full min-h-[300px] flex items-center justify-center">
            {isLoading && (
              <div className="flex flex-col items-center text-gray-400">
                <svg className="animate-spin h-10 w-10 text-blue-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p>Создаем ваш шедевр...</p>
                <p className="text-sm text-gray-500 mt-1">Это может занять некоторое время.</p>
              </div>
            )}
            {error && !isLoading && (
              <div className="text-center text-red-400 p-4">
                <h3 className="font-bold text-lg mb-2">Ошибка генерации</h3>
                <p className="text-sm bg-red-900/50 p-3 rounded-md">{error}</p>
              </div>
            )}
            {generatedImage && !isLoading && (
              <div className="w-full flex flex-col items-center gap-4">
                <div className="w-full aspect-video bg-gray-900/50 rounded-lg flex items-center justify-center overflow-hidden">
                    <img 
                        src={generatedImage} 
                        alt="Сгенерировано" 
                        className={`max-w-full max-h-full object-contain transition-all duration-300 ${filterClass}`}
                        style={{ transform: `rotate(${rotation}deg)` }}
                    />
                </div>
                {/* --- Editing Toolbar --- */}
                <div className="w-full flex flex-wrap items-center justify-center gap-x-6 gap-y-4 p-3 bg-gray-900/50 rounded-md">
                    <div className="flex items-center gap-2">
                        <button onClick={() => setRotation(r => r - 90)} className="flex items-center bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md transition-colors">
                            <RotateLeftIcon />
                        </button>
                        <span className="text-sm font-medium text-gray-300">Вращение</span>
                         <button onClick={() => setRotation(r => r + 90)} className="flex items-center bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md transition-colors">
                            <RotateRightIcon />
                        </button>
                    </div>
                    <div className="flex items-center gap-2">
                        <label htmlFor="filter-select" className="text-sm font-medium text-gray-300">Фильтр:</label>
                        <select 
                          id="filter-select" 
                          value={filterClass} 
                          onChange={e => setFilterClass(e.target.value)} 
                          className="bg-gray-700 border border-gray-600 rounded-md py-1.5 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                        >
                            {FILTERS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                        </select>
                    </div>
                    <button
                        onClick={handleDownload}
                        className="flex items-center bg-green-600 hover:bg-green-500 text-white font-semibold py-2 px-4 rounded-md transition-colors"
                    >
                        <DownloadIcon />
                        Скачать
                    </button>
                </div>
              </div>
            )}
            {!isLoading && !error && !generatedImage && (
              <div className="text-center text-gray-500">
                  <ImageIcon />
                  <p>Ваше сгенерированное изображение появится здесь</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
