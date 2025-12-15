import { MemorySaver, StateGraph } from '@langchain/langgraph';
import {
  analyze,
  chat,
  finalize,
  route,
  routeCondition,
  waitForPinSelection,
  waitForTagSelection,
} from './nodes/index.js';
import { SimpleState } from './state.js';

const workflow = new StateGraph(SimpleState)
  .addNode('route', route)
  .addNode('chat', chat)
  .addNode('wait_for_pin_selection', waitForPinSelection)
  .addNode('analyze', analyze)
  .addNode('wait_for_tag_selection', waitForTagSelection)
  .addNode('finalize', finalize)
  // === エッジ定義（フロー順） ===
  .addEdge('__start__', 'route')
  .addConditionalEdges('route', routeCondition, [
    'wait_for_pin_selection',
    'chat',
  ])
  // --- chat フロー ---
  .addEdge('chat', '__end__')
  // --- video_analysis フロー ---
  .addEdge('wait_for_pin_selection', 'analyze')
  .addEdge('analyze', 'wait_for_tag_selection')
  .addEdge('wait_for_tag_selection', 'finalize')
  .addEdge('finalize', '__end__');

const checkpointer = new MemorySaver();

export const graph = workflow.compile({ checkpointer });
graph.name = 'simple_agent';
