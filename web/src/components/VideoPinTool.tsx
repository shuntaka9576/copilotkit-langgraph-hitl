'use client';
import { Clock, Pause, Play, Plus, Send, Trash2 } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import type { Pin } from '@/types';

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

interface VideoPinToolProps {
  videoUrl: string;
  onConfirm: (pins: Pin[]) => void;
}

export function VideoPinTool({ videoUrl, onConfirm }: VideoPinToolProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [pins, setPins] = useState<Pin[]>([]);

  const onLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const onTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number.parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const addPin = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);

      const newPin: Pin = {
        id: crypto.randomUUID(),
        timestamp: video.currentTime,
        thumbnail: dataUrl,
        note: '',
      };

      setPins((prev) =>
        [...prev, newPin].sort((a, b) => a.timestamp - b.timestamp)
      );
    }
  }, []);

  const deletePin = (id: string) => {
    setPins((prev) => prev.filter((pin) => pin.id !== id));
  };

  const jumpToPin = (timestamp: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = timestamp;
      setCurrentTime(timestamp);
    }
  };

  const handleConfirm = () => {
    onConfirm(pins);
  };

  return (
    <div className="bg-slate-900 rounded-lg m-4 max-w-4xl overflow-hidden">
      {/* 動画プレビュー */}
      <div className="relative bg-black aspect-video">
        {/* biome-ignore lint/a11y/useMediaCaption: デモ用動画のためキャプション不要 */}
        <video
          ref={videoRef}
          src={videoUrl}
          crossOrigin="anonymous"
          className="w-full h-full object-contain"
          onTimeUpdate={onTimeUpdate}
          onLoadedMetadata={onLoadedMetadata}
          onClick={togglePlay}
        />
        {!isPlaying && (
          <button
            type="button"
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors"
          >
            <div className="bg-white/20 backdrop-blur-sm p-4 rounded-full">
              <Play className="w-10 h-10 text-white fill-current" />
            </div>
          </button>
        )}
      </div>

      {/* コントロール */}
      <div className="p-4 space-y-4">
        {/* タイムライン */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-slate-400 w-12 text-right">
            {formatTime(currentTime)}
          </span>
          <div className="relative flex-1 h-6 flex items-center">
            {/* ピンマーカー */}
            {pins.map((pin) => (
              <div
                key={pin.id}
                className="absolute w-1 h-4 bg-yellow-400 rounded-full top-1/2 -translate-y-1/2 z-10 -translate-x-1/2 shadow-[0_0_6px_rgba(250,204,21,0.8)]"
                style={{ left: `${(pin.timestamp / duration) * 100}%` }}
              />
            ))}
            <input
              type="range"
              min="0"
              max={duration || 100}
              step="0.1"
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>
          <span className="text-xs font-mono text-slate-400 w-12">
            {formatTime(duration)}
          </span>
        </div>

        {/* ボタン */}
        <div className="flex justify-center gap-4">
          <button
            type="button"
            onClick={togglePlay}
            className="p-2 rounded-full hover:bg-slate-700 text-slate-200 transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 fill-current" />
            ) : (
              <Play className="w-6 h-6 fill-current" />
            )}
          </button>
          <button
            type="button"
            onClick={addPin}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-full font-medium transition-all"
          >
            <Plus className="w-4 h-4" />
            キャプチャ
          </button>
        </div>

        {/* キャプチャ一覧 */}
        {pins.length > 0 && (
          <div className="border-t border-slate-700 pt-4">
            <div className="text-sm text-slate-400 mb-2">
              キャプチャ ({pins.length}件)
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {pins.map((pin) => (
                <div
                  key={pin.id}
                  className="relative flex-shrink-0 w-32 rounded overflow-hidden border border-slate-600 group"
                >
                  <button
                    type="button"
                    onClick={() => jumpToPin(pin.timestamp)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        jumpToPin(pin.timestamp);
                      }
                    }}
                    className="w-full p-0 border-0 bg-transparent"
                  >
                    {/* biome-ignore lint/performance/noImgElement: Base64サムネイルのためimg使用 */}
                    <img
                      src={pin.thumbnail}
                      alt={formatTime(pin.timestamp)}
                      className="w-full aspect-video object-cover cursor-pointer"
                    />
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-1 py-0.5 text-xs text-white font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTime(pin.timestamp)}
                  </div>
                  <button
                    type="button"
                    onClick={() => deletePin(pin.id)}
                    className="absolute top-1 right-1 bg-red-500/80 hover:bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 確定ボタン */}
        <div className="flex justify-between items-center pt-2 border-t border-slate-700">
          <span className="text-slate-400 text-sm">
            {pins.length}件のフレームを選択中
          </span>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={pins.length === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              pins.length > 0
                ? 'bg-green-600 hover:bg-green-500 text-white'
                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
            確定して解析
          </button>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
