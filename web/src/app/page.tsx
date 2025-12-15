'use client';
import '@copilotkit/react-ui/styles.css';
import { useLangGraphInterrupt } from '@copilotkit/react-core';
import { CopilotChat } from '@copilotkit/react-ui';
import { TagSelectionTool } from '@/components/TagSelectionTool';
import { VideoPinTool } from '@/components/VideoPinTool';
import type { AnalysisResult, Pin } from '@/types';

type InterruptValue =
  | { type: 'pin_selection'; message: string; videoUrl: string }
  | { type: 'tag_selection'; analysisResult: string; selectedPins: Pin[] };

function InterruptHandler() {
  useLangGraphInterrupt({
    render: ({ event, resolve }) => {
      const value = event.value as InterruptValue;

      if (value.type === 'pin_selection') {
        const handleConfirm = (pins: Pin[]) => {
          resolve(JSON.stringify({ selectedPins: pins }));
        };
        return (
          <VideoPinTool videoUrl={value.videoUrl} onConfirm={handleConfirm} />
        );
      }

      if (value.type === 'tag_selection') {
        const analysisResult = JSON.parse(
          value.analysisResult
        ) as AnalysisResult;
        const handleConfirm = (selectedTags: string[]) => {
          resolve(JSON.stringify({ selectedTags }));
        };
        return (
          <TagSelectionTool
            analysisResult={analysisResult}
            pins={value.selectedPins}
            onConfirm={handleConfirm}
          />
        );
      }

      return <></>;
    },
  });

  return null;
}

export default function Page() {
  return (
    <div className="h-screen flex flex-col">
      <InterruptHandler />
      <div className="flex-1">
        <CopilotChat
          labels={{
            initial: '動画の解析を依頼してください（例：「動画を解析して」）',
          }}
        />
      </div>
    </div>
  );
}
