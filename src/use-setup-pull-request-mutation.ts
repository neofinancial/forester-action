import { gql, useMutation } from '@apollo/client';

export type SetupPullRequestInput = {
  repositoryId: number;
  ref: string;
  baseRef: string;
  sha: string;
  actor: string;
  timestamp: string;
  token: string;
  pullRequest?: number;
};

export type SetupPullRequestResponse = {
  presignedPutUrl: string;
};

const SETUP_PULL_REQUEST = gql`
  mutation ($setupPullRequestInput: setupPullRequestInput!) {
    setupPullRequest(input: $setupPullRequestInput) {
      presignedPutUrl
    }
  }
`;

const getPresignedUrl = (
  setupPullRequestInput: SetupPullRequestInput
): SetupPullRequestResponse | string | undefined => {
  const [setupPullRequest, { error, data }] = useMutation<
    { setupPullRequest: SetupPullRequestResponse },
    { setupPullRequestInput: SetupPullRequestInput }
  >(SETUP_PULL_REQUEST, {
    variables: { setupPullRequestInput },
  });

  setupPullRequest();

  if (error) {
    return error.message;
  }

  if (data) {
    return data.setupPullRequest;
  }

  return;
};

export { getPresignedUrl };
