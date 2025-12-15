'use client';
import { Check, Send, Tag } from 'lucide-react';
import { useState } from 'react';
import type { AnalysisResult, Pin } from '@/types';

interface TagSelectionToolProps {
  analysisResult: AnalysisResult;
  pins: Pin[];
  onConfirm: (selectedTags: string[]) => void;
}

export function TagSelectionTool({
  analysisResult,
  pins,
  onConfirm,
}: TagSelectionToolProps) {
  // 全タグをフラットに取得（重複除去）
  const allTags = Array.from(
    new Set(analysisResult.frames.flatMap((f) => f.tags))
  );

  const [selectedTags, setSelectedTags] = useState<Set<string>>(
    new Set(allTags)
  );

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) {
        next.delete(tag);
      } else {
        next.add(tag);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedTags(new Set(allTags));
  };

  const deselectAll = () => {
    setSelectedTags(new Set());
  };

  const handleConfirm = () => {
    onConfirm(Array.from(selectedTags));
  };

  return (
    <div className="bg-slate-900 rounded-lg m-4 max-w-2xl overflow-hidden">
      {/* ヘッダー */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center gap-2 text-slate-200">
          <Tag className="w-5 h-5" />
          <span className="font-medium">タグを選択してください</span>
        </div>
        <p className="text-sm text-slate-400 mt-1">{analysisResult.summary}</p>
      </div>

      {/* フレームごとのタグ */}
      <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
        {analysisResult.frames.map((frame) => {
          const pin = pins[frame.frameIndex - 1];
          return (
            <div key={frame.frameIndex} className="flex gap-4">
              {/* サムネイル画像 */}
              {pin?.thumbnail && (
                <img
                  src={pin.thumbnail}
                  alt={`フレーム ${frame.frameIndex + 1}`}
                  className="w-24 h-24 object-cover rounded flex-shrink-0"
                />
              )}
              {/* タグエリア */}
              <div className="flex-1 space-y-2">
                <div className="text-sm text-slate-400">
                  フレーム {frame.frameIndex + 1} ({frame.timestamp})
                </div>
                <div className="flex flex-wrap gap-2">
                  {frame.tags.map((tag) => (
                    <button
                      type="button"
                      key={`${frame.frameIndex}-${tag}`}
                      onClick={() => toggleTag(tag)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-all ${
                        selectedTags.has(tag)
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      {selectedTags.has(tag) && <Check className="w-3 h-3" />}
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* フッター */}
      <div className="p-4 border-t border-slate-700">
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={selectAll}
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              すべて選択
            </button>
            <span className="text-slate-600">|</span>
            <button
              type="button"
              onClick={deselectAll}
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              すべて解除
            </button>
          </div>
          <span className="text-slate-400 text-sm">
            {selectedTags.size}件選択中
          </span>
        </div>

        <button
          type="button"
          onClick={handleConfirm}
          disabled={selectedTags.size === 0}
          className={`w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            selectedTags.size > 0
              ? 'bg-green-600 hover:bg-green-500 text-white'
              : 'bg-slate-700 text-slate-500 cursor-not-allowed'
          }`}
        >
          <Send className="w-4 h-4" />
          選択したタグを確定
        </button>
      </div>
    </div>
  );
}
