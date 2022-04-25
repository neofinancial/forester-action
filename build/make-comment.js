"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeComment = void 0;
const core_1 = require("@actions/core");
const github_1 = require("@actions/github");
const action_1 = require("@octokit/action");
const construct_comment_1 = require("./construct-comment");
const makeComment = async (commentData) => {
    try {
        if (!github_1.context.payload.pull_request) {
            (0, core_1.setFailed)('No pull requests found.');
            return;
        }
        const githubRepo = process.env.GITHUB_REPOSITORY;
        if (!githubRepo) {
            (0, core_1.setFailed)('No repo found');
            return;
        }
        const [owner, repo] = githubRepo.split('/');
        const pullRequestNumber = github_1.context.payload.pull_request.number;
        const octokit = new action_1.Octokit();
        const comments = await octokit.issues.listComments({
            owner,
            repo,
            issue_number: pullRequestNumber,
        });
        const botComment = comments.data.find((comment) => comment.body?.includes('<!-- dependanot-action-comment -->'));
        console.log(botComment);
        console.log(commentData);
        if (!botComment) {
            octokit.issues.createComment({
                owner: owner,
                repo: repo,
                issue_number: pullRequestNumber,
                body: await (0, construct_comment_1.constructComment)(commentData),
            });
        }
        else {
            octokit.issues.updateComment({
                owner: owner,
                repo: repo,
                comment_id: botComment.id,
                body: await (0, construct_comment_1.constructComment)(commentData),
            });
        }
    }
    catch {
        throw new Error('Could not generate comment.');
    }
};
exports.makeComment = makeComment;
