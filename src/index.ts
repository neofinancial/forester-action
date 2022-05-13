import { getInput, setFailed, warning } from '@actions/core';
import { context } from '@actions/github';
import { inspect } from 'util';

import { getPackageJSON } from './get-package-json';
import { getPullRequestData } from './get-pull-request-data';
import { makeComment } from './make-comment';
import { sendData } from './send-data';
import { setupPullRequest } from './setup-pull-request';

const run = async (): Promise<void> => {
  try {
    const serviceUrl = getInput('serviceUrl');

    if (!serviceUrl) {
      warning(
        'Failed to retrieve `serviceUrl`. See configuration for instructions on how to add coverageToken to action.'
      );
    }

    const pullRequestData = await getPullRequestData();

    try {
      const presignedPutUrl = await setupPullRequest(serviceUrl, pullRequestData);

      console.log('presignedPutUrl:', presignedPutUrl);

      const packageJson = await getPackageJSON();

      await sendData('presignedPutUrl', packageJson);
    } catch (error) {
      console.log(`${error}, Could not send data, printing comment`);
    }

    if (pullRequestData.pullRequest) {
      console.log(pullRequestData.pullRequest);
    }

    if (context.payload.pull_request) {
      makeComment('');
    }
  } catch (error) {
    if (error instanceof Error) {
      setFailed(error.message);
    } else {
      setFailed(inspect(error));
    }
  }
};

run();
