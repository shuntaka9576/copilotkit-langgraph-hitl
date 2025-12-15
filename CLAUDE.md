# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

CopilotKitとLangGraphを使った Human-in-the-Loop (HITL) の実装サンプル。
`useLangGraphInterrupt` を使って、エージェントの処理中にユーザー入力を待つフローを実装。

## アーキテクチャ

```
monorepo (pnpm workspace)
├── web/       Next.js 16 + React 19 フロントエンド
└── agent-js/  LangGraphエージェント (AWS Bedrock Claude)
```

### エージェントワークフロー

```
[Start] → [route] → (意図判定)
              ↓
        ┌─────────────────────────────────────┐
        ↓                                     ↓
   "video_analysis"                        "chat"
        ↓                                     ↓
[wait_for_selection] ← interrupt          [chat] → 通常応答
        ↓                                     ↓
   [analyze] → LLM画像解析                  [End]
        ↓
[wait_for_tag_selection] ← interrupt
        ↓
   [finalize]
        ↓
     [End]
```

**ノード説明:**
- `route` - LLMで意図判定（動画解析 or 通常チャット）
- `chat` - 通常のチャット応答
- `wait_for_selection` - ピン選択を待つ (`interrupt()`)
- `analyze` - Bedrock Claude で画像解析（`withStructuredOutput`）
- `wait_for_tag_selection` - タグ選択を待つ (`interrupt()`)
- `finalize` - 選択されたタグを返す

### ストーリー

1. ユーザー：「動画を解析して」とチャットで依頼
2. `route` ノードが意図を判定 → `video_analysis`
3. `interrupt()` → UI側が動画キャプチャツール (VideoPinTool) を表示
4. ユーザー：動画を再生しながらフレームをキャプチャ
5. 「確定して解析」→ 選択したピンがエージェントに送信
6. `analyze` ノードが Bedrock Claude で画像解析
7. `interrupt()` → UI側がタグ選択ツール (TagSelectionTool) を表示
8. ユーザー：採用するタグを選択
9. エージェント：選択されたタグを返す

## useLangGraphInterrupt のポイント

```typescript
useLangGraphInterrupt({
  render: ({ event, resolve }) => {
    const value = event.value; // interrupt() の引数

    if (value.type === "pin_selection") {
      return <VideoPinTool onConfirm={(pins) => resolve(JSON.stringify({ selectedPins: pins }))} />;
    }
    if (value.type === "tag_selection") {
      return <TagSelectionTool ... />;
    }
  },
});
```

**データの流れ:**
```
[Agent] interrupt({ type: "pin_selection", ... })
    ↓
[UI] render() が呼ばれ、event.value.type で分岐
    ↓
[UI] resolve(JSON.stringify(...)) でエージェントに返す
    ↓
[Agent] interrupt() の戻り値として受け取る（JSON.parseが必要）
```

## 開発コマンド

```bash
# ルート
pnpm dev        # 全パッケージの開発サーバー起動
pnpm lint       # Biome lint
pnpm lint:fix   # lint自動修正
pnpm format     # コード整形
pnpm check      # Biome チェック

# web (Next.js)
pnpm --filter web dev         # http://localhost:3000
pnpm --filter web type-check  # TypeScript 型チェック

# agent-js (LangGraph)
cd agent-js && npx @langchain/langgraph-cli dev  # http://localhost:8123
```

## 技術スタック

- **LLM**: Claude Haiku 4.5 (AWS Bedrock, ap-northeast-1)
- **エージェント**: LangGraph + @langchain/aws
- **構造化出力**: zod + `withStructuredOutput`
- **フロントエンド**: Next.js 16, React 19, CopilotKit 1.50, Tailwind CSS 4
- **品質管理**: Biome (lint/format), TypeScript 5.9

## 重要なコードパス

**エージェント:**
- `agent-js/src/graph.ts` - ワークフロー定義（route, analyze, finalize等）
- `agent-js/src/state.ts` - ステート定義 (Pin, intent, analysisResult, selectedTags)
- `agent-js/src/llm.ts` - LLM設定（AWS Bedrock Claude Haiku）
- `agent-js/src/nodes/route.ts` - 意図判定ノード
- `agent-js/src/nodes/analyze.ts` - 画像解析ノード
- `agent-js/src/nodes/waitForPinSelection.ts` - ピン選択待機ノード
- `agent-js/src/nodes/waitForTagSelection.ts` - タグ選択待機ノード

**フロントエンド:**
- `web/src/app/page.tsx` - useLangGraphInterrupt の実装（複数interrupt対応）
- `web/src/app/api/copilotkit/route.ts` - CopilotKit ランタイムAPI
- `web/src/components/VideoPinTool.tsx` - 動画キャプチャUI
- `web/src/components/TagSelectionTool.tsx` - タグ選択UI
- `web/src/types/index.ts` - Pin, FrameAnalysis 型定義

## 注意事項

- UIおよびプロンプトは日本語
- `interrupt()` の戻り値はJSON文字列なので `JSON.parse()` が必要
- フレームデータ（Base64画像）はUI側で保持し、エージェントに送信
- AWS認証情報は環境変数（AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY）で設定
