import { setFailed } from '@actions/core';
import axios from 'axios';
import { inspect } from 'util';
import { gql } from '@apollo/client';

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

const setupPullRequest = async (
  apiKey: string,
  url: string,
  setupPullRequestInput: SetupPullRequestInput
): Promise<string> => {
  const mutation = gql`
    mutation setupPullRequest {
      setupPullRequest(input: ${setupPullRequestInput}) {
        __typename
        presignedPutUrl
      }
    }
  `;

  try {
    const response = await axios({
      headers: { FORESTER_API_KEY: apiKey },
      url,
      method: 'post',
      data: { mutation },
    });

    return response.data.setupPullRequest.presignedPutUrl;
  } catch (error) {
    if (error instanceof Error) {
      setFailed(error.message);
    } else {
      setFailed(inspect(error));
    }

    throw new Error('Could not retrieve presignedPutUrl from Forester-service');
  }
};

export { setupPullRequest };
