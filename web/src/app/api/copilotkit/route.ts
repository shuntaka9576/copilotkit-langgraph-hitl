import {
  CopilotRuntime,
  copilotRuntimeNextJSAppRouterEndpoint,
  ExperimentalEmptyAdapter,
} from '@copilotkit/runtime';
import { LangGraphAgent } from '@copilotkit/runtime/langgraph';
import type { NextRequest } from 'next/server';

const serviceAdapter = new ExperimentalEmptyAdapter();

const runtime = new CopilotRuntime({
  agents: {
    simple_agent: new LangGraphAgent({
      deploymentUrl: process.env.LANGGRAPH_URL || 'http://localhost:8123',
      graphId: 'simple_agent',
    }),
  },
});

export const POST = async (req: NextRequest) => {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter,
    endpoint: '/api/copilotkit',
  });

  return handleRequest(req);
};
