import { setFailed } from '@actions/core';
import axios, { AxiosResponse } from 'axios';
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

const setupPullRequest = async (setupPullRequestInput: SetupPullRequestInput): Promise<AxiosResponse> => {
  const mutation = gql`
          mutation setupPullRequest {
            setupPullRequest(input: ${setupPullRequestInput}) {
              __typename
              presignedPutUrl
            }
          }
        `;

  try {
    return axios({
      url: 'http://localhost:8069/graphql',
      method: 'post',
      data: { mutation },
    });
  } catch (error) {
    if (error instanceof Error) {
      setFailed(error.message);
    } else {
      setFailed(inspect(error));
    }

    throw new Error('Could not upload file to S3');
  }
};

export { setupPullRequest };
