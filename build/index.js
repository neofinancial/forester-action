"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@actions/core");
const github_1 = require("@actions/github");
const get_context_payload_1 = require("./get-context-payload");
const get_pull_request_data_1 = require("./get-pull-request-data");
const get_tree_1 = require("./get-tree");
const make_comment_1 = require("./make-comment");
// import { sendDataComment } from './send-data';
const run = async () => {
    try {
        const url = (0, core_1.getInput)('dependanotEndpoint');
        const pullRequestData = await (0, get_pull_request_data_1.getPullRequestData)();
        const authToken = (0, core_1.getInput)('dependanotToken');
        if (!authToken && url) {
            (0, core_1.warning)('Failed to retrieve `dependanotToken`. See configuration for instructions on how to add dependanotToken to action.');
        }
        else if (!url && authToken) {
            (0, core_1.warning)('Failed to retrieve `dependanotEndpoint` from action. See configuration for instructions on how to add dependanotEndpoint to action.');
        }
        const contextPayload = (0, get_context_payload_1.getContextPayload)();
        const tree = await (0, get_tree_1.getTree)();
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
        if (github_1.context.payload.pull_request) {
            (0, make_comment_1.makeComment)(pullRequestData.message);
        }
    }
    catch (error) {
        (0, core_1.setFailed)(`Dependanot action failed to run: ${error.message}`);
    }
};
run();
