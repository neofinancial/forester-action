import { getInput, setFailed, warning } from '@actions/core';
import { context } from '@actions/github';
import { inspect } from 'util';

import { getPackageJSON } from './get-package-json';
import { getPullRequestData } from './get-pull-request-data';
import { makeComment } from './make-comment';
import { sendData } from './send-data';

const run = async (): Promise<void> => {
  try {
    const pullRequestData = await getPullRequestData();
    const accessKeyId = getInput('accessKeyId');
    const secretAccessKey = getInput('secretAccessKey');
    const region = getInput('region');
    const bucket = getInput('bucket');

    if (!accessKeyId || !secretAccessKey || !region || !bucket) {
      warning(
        'Failed to retrieve required secrets. See configuration for instructions on how to add secrets to action.'
      );

      return;
    }

    try {
      const packageJson = await getPackageJSON();

      packageJson && (await sendData({ pullRequestData, packageJson }));
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
