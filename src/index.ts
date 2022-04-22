import { getInput, setFailed, warning } from '@actions/core';
import { context } from '@actions/github';

import { getContextPayload } from './get-context-payload';
import { getPullRequestData } from './get-pull-request-data';
import { getTree } from './get-tree';
import { makeComment } from './make-comment';
// import { sendDataComment } from './send-data';

const run = async (): Promise<void> => {
  try {
    const url = getInput('dependanotEndpoint');

    const pullRequestData = await getPullRequestData();
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

    const contextPayload = getContextPayload();
    const tree = await getTree();

    // if (url) {
    //   try {
    //     pullRequestData.message = await sendDataComment(url, pullRequestData);
    //   } catch (error) {
    //     console.log(`${error}, Could not send data, printing comment`);
    //   }
    // }

    console.log(`Repo ID: ${pullRequestData.repositoryId}`);
    console.log(`Ref of branch being merged: ${pullRequestData.ref}`);
    console.log(`Ref of branch being merged into: ${pullRequestData.baseRef}`);
    console.log(`SHA of merge commit: ${pullRequestData.sha}`);
    console.log(`PR creator: ${pullRequestData.actor}`);
    console.log(`Time PR created: ${pullRequestData.timestamp}`);

    console.log(`Context Payload: ${contextPayload}`);
    console.log(`Arborist Tree: ${JSON.stringify(tree)}`);

    if (pullRequestData.pullRequest) {
      console.log(pullRequestData.pullRequest);
    }

    if (context.payload.pull_request) {
      makeComment(pullRequestData.message as string);
    }
  } catch (error) {
    setFailed(`Dependanot action failed to run: ${error.message}`);
  }
};

run();
