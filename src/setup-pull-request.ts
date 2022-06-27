import { setFailed } from '@actions/core';
import { inspect } from 'util';
import { request, gql } from 'graphql-request';

export type SetupPullRequestInput = {
  repositoryId: string;
  ref: string;
  baseRef: string;
  sha: string;
  actor: string;
  timestamp: string;
  pullRequest: number;
};

export type SetupPullRequestResponse = {
  packageSignedUrl: string;
  packageLockSignedUrl: string;
};

const setupPullRequest = async (
  cloudFrontAuth: string,
  url: string,
  setupPullRequestInput: SetupPullRequestInput
): Promise<SetupPullRequestResponse> => {
  const mutation = gql`
    mutation setupPullRequest($input: SetupPullRequestInput!) {
      setupPullRequest(input: $input) {
        packageSignedUrl
        packageLockSignedUrl
      }
    }
  `;
//
  try {
    const response = await request({
      url,
      document: mutation,
      variables: { input: setupPullRequestInput },
      requestHeaders: { cloudfrontauthorization: cloudFrontAuth },
    });

    return response.setupPullRequest;
  } catch (error) {
    if (error instanceof Error) {
      setFailed(error.message);
    } else {
      setFailed(inspect(error));
    }

    throw new Error('Could not retrieve presignedUrls from Forester-service');
  }
};

export { setupPullRequest };
