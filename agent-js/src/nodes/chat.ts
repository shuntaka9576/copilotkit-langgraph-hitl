import { AIMessage } from '@langchain/core/messages';
import { llm } from '../llm.js';
import type { SimpleStateType } from '../state.js';

export const chat = async (state: SimpleStateType) => {
  const response = await llm.invoke(state.messages);
  return {
    messages: [new AIMessage(response.content as string)],
  };
};
