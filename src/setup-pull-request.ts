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
  pullRequest: number;
  fileNamePackage: string;
  fileNamePackageLock: string;
};

export type SetupPullRequestResponse = {
  presignedUrlPackage: string;
  presignedUrlPackageLock: string;
};

const setupPullRequest = async (
  cloudFrontAuth: string,
  url: string,
  setupPullRequestInput: SetupPullRequestInput
): Promise<SetupPullRequestResponse> => {
  const mutation = gql`
    mutation setupPullRequest {
      setupPullRequest(input: ${setupPullRequestInput}) {
        __typename
        presignedUrlPackage
        presignedUrlPackageLock
      }
    }
  `;

  try {
    const response = await axios({
      headers: { cloudfrontauth: cloudFrontAuth },
      url,
      method: 'post',
      data: { mutation },
    });

    return response.data.setupPullRequest;
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
