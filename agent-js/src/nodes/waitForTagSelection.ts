import { interrupt } from '@langchain/langgraph';
import type { Pin, SimpleStateType } from '../state.js';

type TagSelectionPayload = {
  type: 'tag_selection';
  analysisResult: string;
  selectedPins: Pin[];
};

export const waitForTagSelection = async (state: SimpleStateType) => {
  const payload: TagSelectionPayload = {
    type: 'tag_selection',
    analysisResult: state.analysisResult,
    selectedPins: state.selectedPins,
  };

  const response = interrupt(payload);

  const parsed = JSON.parse(response as string) as { selectedTags: string[] };

  return {
    selectedTags: parsed.selectedTags,
  };
};
