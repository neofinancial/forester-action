import { context } from '@actions/github';

import { SetupPullRequestInput } from './setup-pull-request';

const getPullRequestData = async (): Promise<SetupPullRequestInput> => {
  const { after, base_ref, number, pull_request, sender, ref, repository, head_commit } = context.payload;

  const setupPullRequestInput: SetupPullRequestInput = {
    repositoryId: repository?.id.toString(),
    ref: pull_request?.head.ref || ref.replace('refs/heads/', ''),
    baseRef: pull_request?.base.ref || base_ref || '',
    sha: pull_request?.head.sha || after,
    actor: sender?.login || 'github',
    timestamp: pull_request?.created_at || head_commit.timestamp,
    pullRequest: number || 0,
  };

  console.log('setupPullRequestInput:', setupPullRequestInput);

  return setupPullRequestInput;
};

export { getPullRequestData };
