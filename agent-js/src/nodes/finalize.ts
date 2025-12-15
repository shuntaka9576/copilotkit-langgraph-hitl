import { AIMessage } from '@langchain/core/messages';
import type { SimpleStateType } from '../state.js';

export const finalize = async (state: SimpleStateType) => {
  const { selectedTags } = state;

  return {
    messages: [new AIMessage(`選択されたタグ: ${selectedTags.join(', ')}`)],
  };
};
