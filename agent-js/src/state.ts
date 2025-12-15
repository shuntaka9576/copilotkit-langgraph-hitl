import type { BaseMessage } from '@langchain/core/messages';
import { Annotation, messagesStateReducer } from '@langchain/langgraph';

export interface Pin {
  id: string;
  timestamp: number;
  thumbnail: string;
  note: string;
}

export const SimpleState = Annotation.Root({
  // 1. CopilotKit からの入力メッセージ
  messages: Annotation<BaseMessage[]>({
    default: () => [],
    reducer: messagesStateReducer,
  }),

  // 2. 意図判定結果 (route)
  intent: Annotation<string>({
    default: () => '',
    reducer: (_, next) => next,
  }),

  // 3. ユーザーがUI上で選んだピン (waitForSelection)
  selectedPins: Annotation<Pin[]>({
    default: () => [],
    reducer: (_, next) => next,
  }),

  // 4. LLM解析結果 (analyze)
  analysisResult: Annotation<string>({
    default: () => '',
    reducer: (_, next) => next,
  }),

  // 5. ユーザーが選択したタグ (waitForTagSelection)
  selectedTags: Annotation<string[]>({
    default: () => [],
    reducer: (_, next) => next,
  }),
});

export type SimpleStateType = typeof SimpleState.State;
