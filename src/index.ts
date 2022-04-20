import { getInput, setFailed, warning } from '@actions/core';
import { context } from '@actions/github';

import { getAllData, getData } from './get-data';
import { makeComment } from './make-comment';
import { sendDataComment } from './send-data';
import { testMonoRepo } from './test-mono-repo';

const run = async (): Promise<void> => {
  try {
    const monoRepo = getInput('monoRepo');
    const url = getInput('dependanotEndpoint');

    if (monoRepo === 'true') {
      await testMonoRepo(url, getAllData());

      return;
    }

    const prData = await getData();
    const authToken = getInput('dependanotToken');

    if (!authToken && url) {
      warning(
        'Failed to retrieve `dependanotToken`. See configuration for instructions on how to add dependanotToken to action.'
      );
    } else if (!url && authToken) {
      warning(
        'Failed to retrieve `dependanotEndpoint` from action. See configuration for instructions on how to add dependanotEndpoint to action.'
      );
    }

    const reportMessage = getInput('reportMessage');

    if (url) {
      try {
        if (reportMessage === 'report') {
          prData.message = await sendDataComment(url, prData);
        }
      } catch (error) {
        console.log(`${error}, Could not send data, printing comment`);
      }
    }

    console.log(`Repo ID: ${prData.repositoryId}`);
    console.log(`Ref of branch being merged: ${prData.ref}`);
    console.log(`Ref of branch being merged into: ${prData.baseRef}`);
    console.log(`SHA of merge commit: ${prData.sha}`);
    console.log(`PR creator: ${prData.actor}`);
    console.log(`Time PR created: ${prData.timestamp}`);

    if (prData.pullRequest) {
      console.log(prData.pullRequest);
    }

    if (context.payload.pull_request) {
      makeComment(prData.message as string);
    }
  } catch (error) {
    setFailed(`Dependanot action failed to run: ${error.message}`);
  }
};

run();
