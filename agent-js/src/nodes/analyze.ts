import { HumanMessage } from '@langchain/core/messages';
import { z } from 'zod';
import { llm } from '../llm.js';
import type { SimpleStateType } from '../state.js';
import { formatTime } from '../utils/formatTime.js';

const AnalysisResultSchema = z.object({
  frames: z.array(
    z.object({
      frameIndex: z.number(),
      timestamp: z.string(),
      tags: z.array(z.string()),
    })
  ),
  summary: z.string(),
});

export const analyze = async (state: SimpleStateType) => {
  const { selectedPins } = state;

  if (selectedPins.length === 0) {
    return {
      analysisResult: JSON.stringify({
        frames: [],
        summary: 'フレームが選択されていません',
      }),
    };
  }

  const contentParts: Array<
    | { type: 'text'; text: string }
    | { type: 'image_url'; image_url: { url: string } }
  > = [
    {
      type: 'text',
      text: `画像から物体を検出し、日本語タグを抽出してください。

注意事項:
- 差別的な表現、身体的特徴を侮蔑する言葉は使用しないでください
- 客観的で中立的な表現を使用してください

${selectedPins
  .map(
    (pin, i) =>
      `フレーム${i + 1}: ${formatTime(pin.timestamp)}${pin.note ? ` (メモ: ${pin.note})` : ''}`
  )
  .join('\n')}`,
    },
    ...selectedPins.map((pin) => ({
      type: 'image_url' as const,
      image_url: { url: pin.thumbnail },
    })),
  ];

  const result = await llm
    .withStructuredOutput(AnalysisResultSchema)
    .invoke([new HumanMessage({ content: contentParts })]);

  return {
    analysisResult: JSON.stringify(result),
  };
};
