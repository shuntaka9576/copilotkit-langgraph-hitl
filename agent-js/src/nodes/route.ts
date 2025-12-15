import { HumanMessage } from '@langchain/core/messages';
import { z } from 'zod';
import { llm } from '../llm.js';
import type { SimpleStateType } from '../state.js';

const RouteSchema = z.object({
  intent: z.enum(['video_analysis', 'chat']),
});

const routeLlm = llm.withStructuredOutput(RouteSchema);

const PROMPT = `メッセージが動画解析の依頼なら"video_analysis"、それ以外なら"chat"。
メッセージ: {message}`;

export const route = async (state: SimpleStateType) => {
  const lastMessage = state.messages[state.messages.length - 1];
  const content =
    typeof lastMessage.content === 'string' ? lastMessage.content : '';

  const result = await routeLlm.invoke([
    new HumanMessage(PROMPT.replace('{message}', content)),
  ]);

  return { intent: result.intent };
};

export const routeCondition = (state: SimpleStateType) => {
  return state.intent === 'video_analysis' ? 'wait_for_pin_selection' : 'chat';
};
