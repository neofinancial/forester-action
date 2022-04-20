import { getInput } from '@actions/core';
import { context } from '@actions/github';

export type PRData = {
  repositoryId: number;
  ref: string;
  baseRef: string;
  sha: string;
  actor: string;
  timestamp: string;
  token: string;
  pullRequest?: number;
  message?: string;
};

const getData = async (): Promise<PRData> => {
  const authToken = getInput('dependanotToken');

  const prData: PRData = {
    repositoryId: context.payload.repository?.id,
    ref: '',
    baseRef: '',
    sha: '',
    actor: '',
    timestamp: Date.now().toString(),
    token: authToken,
  };

  const info = context.payload;

  if (info.pull_request) {
    prData.ref = info.pull_request.head.ref;
    prData.baseRef = info.pull_request.base.ref;
    prData.sha = info.pull_request.head.sha;
    prData.timestamp = info.pull_request.created_at;
    prData.pullRequest = info.number;
  } else {
    prData.ref = info.ref.replace('refs/heads/', '');
    prData.baseRef = info.base_ref;
    prData.sha = info.after;
    prData.timestamp = info.head_commit.timestamp;
  }

  if (info.repository && info.sender) {
    prData.actor = info.sender.login;
  } else if (!info.repository && !info.sender) {
    throw new Error('repository and sender are undefined');
  } else if (!info.repository) {
    throw new Error('repository is undefined');
  } else {
    throw new Error('sender is undefined');
  }

  return prData;
};

const getAllData = (): Record<string, unknown> => {
  return context.payload;
};

export { getAllData, getData };
