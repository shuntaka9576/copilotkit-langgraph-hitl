import { interrupt } from '@langchain/langgraph';
import type { Pin, SimpleStateType } from '../state.js';

type PinSelectionPayload = {
  type: 'pin_selection';
  message: string;
  videoUrl: string;
};

// TODO: 実際の実装では動画検索や外部APIから取得
const MOCK_VIDEO_URL =
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

export const waitForPinSelection = async (_state: SimpleStateType) => {
  const payload: PinSelectionPayload = {
    type: 'pin_selection',
    message: '動画からキャプチャするフレームを選んでください',
    videoUrl: MOCK_VIDEO_URL,
  };

  const response = interrupt(payload);

  const parsed = JSON.parse(response as string) as { selectedPins: Pin[] };

  return {
    selectedPins: parsed.selectedPins,
  };
};
