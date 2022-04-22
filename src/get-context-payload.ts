import { context } from '@actions/github';

const getContextPayload = (): Record<string, unknown> => {
  return context.payload;
};

export { getContextPayload };
