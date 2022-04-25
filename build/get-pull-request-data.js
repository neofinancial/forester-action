"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPullRequestData = void 0;
const core_1 = require("@actions/core");
const github_1 = require("@actions/github");
const getPullRequestData = async () => {
    const authToken = (0, core_1.getInput)('dependanotToken');
    const pullRequestData = {
        repositoryId: github_1.context.payload.repository?.id,
        ref: '',
        baseRef: '',
        sha: '',
        actor: '',
        timestamp: Date.now().toString(),
        token: authToken,
    };
    const info = github_1.context.payload;
    if (info.pull_request) {
        pullRequestData.ref = info.pull_request.head.ref;
        pullRequestData.baseRef = info.pull_request.base.ref;
        pullRequestData.sha = info.pull_request.head.sha;
        pullRequestData.timestamp = info.pull_request.created_at;
        pullRequestData.pullRequest = info.number;
    }
    else {
        pullRequestData.ref = info.ref.replace('refs/heads/', '');
        pullRequestData.baseRef = info.base_ref;
        pullRequestData.sha = info.after;
        pullRequestData.timestamp = info.head_commit.timestamp;
    }
    if (info.repository && info.sender) {
        pullRequestData.actor = info.sender.login;
    }
    else if (!info.repository && !info.sender) {
        throw new Error('repository and sender are undefined');
    }
    else if (!info.repository) {
        throw new Error('repository is undefined');
    }
    else {
        throw new Error('sender is undefined');
    }
    return pullRequestData;
};
exports.getPullRequestData = getPullRequestData;
