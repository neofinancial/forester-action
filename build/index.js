'use strict';

var core = require('@actions/core');
var github = require('@actions/github');
var util = require('util');
var fs = require('fs');
var action = require('@octokit/action');
var axios = require('axios');
var aws = require('aws-sdk');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs);
var axios__default = /*#__PURE__*/_interopDefaultLegacy(axios);
var aws__default = /*#__PURE__*/_interopDefaultLegacy(aws);

const getPackageJSON = async () => {
    try {
        // console.log('path', path.join(process.cwd(), 'package.json'));
        const manualPath = `${process.cwd()}/package.json`;
        const packageJSON = fs__default["default"].readFileSync(manualPath);
        console.log('packageJSON', packageJSON);
        return packageJSON;
    }
    catch (error) {
        if (error instanceof Error) {
            core.setFailed(`Dependanot action unable to read package.json ${error.message}`);
        }
        throw new Error(`Could not read package.json: ${JSON.stringify(error)}`);
    }
};

const getPullRequestData = async () => {
    const authToken = core.getInput('dependanotToken');
    const pullRequestData = {
        repositoryId: github.context.payload.repository?.id,
        ref: '',
        baseRef: '',
        sha: '',
        actor: '',
        timestamp: Date.now().toString(),
        token: authToken,
    };
    const info = github.context.payload;
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

const constructComment = async (commentData) => {
    return `
## Dependanot Report
Data: ${commentData || 'N/A'}
<!-- dependanot-action-comment -->
`;
};

const makeComment = async (commentData) => {
    try {
        if (!github.context.payload.pull_request) {
            core.setFailed('No pull requests found.');
            return;
        }
        const githubRepo = process.env.GITHUB_REPOSITORY;
        if (!githubRepo) {
            core.setFailed('No repo found');
            return;
        }
        const [owner, repo] = githubRepo.split('/');
        const pullRequestNumber = github.context.payload.pull_request.number;
        const octokit = new action.Octokit();
        const comments = await octokit.issues.listComments({
            owner,
            repo,
            issue_number: pullRequestNumber,
        });
        const botComment = comments.data.find((comment) => comment.body?.includes('<!-- dependanot-action-comment -->'));
        console.log('botComment', botComment);
        console.log('commentData', commentData);
        if (!botComment) {
            octokit.issues.createComment({
                owner: owner,
                repo: repo,
                issue_number: pullRequestNumber,
                body: await constructComment(commentData),
            });
        }
        else {
            octokit.issues.updateComment({
                owner: owner,
                repo: repo,
                comment_id: botComment.id,
                body: await constructComment(commentData),
            });
        }
    }
    catch {
        core.setFailed('Could not generate comment.');
    }
};

const getPresignedPost = async (fileName) => {
    const { ACCESS_KEY, SECRET_KEY, BUCKET_NAME, REGION } = process.env;
    if (ACCESS_KEY && SECRET_KEY && BUCKET_NAME && REGION) {
        console.log('received secrets');
    }
    aws__default["default"].config.update({
        accessKeyId: process.env.ACCESS_KEY,
        secretAccessKey: process.env.SECRET_KEY,
        region: process.env.REGION,
        signatureVersion: 'v4',
    });
    try {
        const s3 = new aws__default["default"].S3();
        const presignedPost = await s3.createPresignedPost({
            Bucket: process.env.BUCKET_NAME,
            Fields: {
                key: fileName,
            },
            Expires: 120,
        });
        return presignedPost;
    }
    catch (error) {
        throw new Error(`Could not retrieve file from S3: ${JSON.stringify(error)}`);
    }
};

const sendData = async (input) => {
    const { repositoryId, sha, timestamp } = input.pullRequestData;
    const filename = encodeURIComponent(`${repositoryId}-${sha}-${timestamp}`);
    try {
        const { url } = await getPresignedPost(filename);
        // const formData = new FormData();
        // Object.entries({ ...fields, file }).forEach(([key, value]) => {
        //   formData.append(key, value as string);
        // });
        // await fetch(url, {
        //   method: 'POST',
        //   // mode: 'no-cors',
        //   body: JSON.stringify(postJson),
        // });
        return axios__default["default"].put(url, input);
    }
    catch (error) {
        core.setFailed(`Dependanot action failed to run: ${JSON.stringify(error)}`);
    }
};

const run = async () => {
    try {
        const pullRequestData = await getPullRequestData();
        const accessKeyId = core.getInput('accessKeyId');
        const secretKey = core.getInput('secretKey');
        const region = core.getInput('region');
        const bucket = core.getInput('bucket');
        // console.log(`Repo ID: ${pullRequestData.repositoryId}`);
        // console.log(`Ref of branch being merged: ${pullRequestData.ref}`);
        // console.log(`Ref of branch being merged into: ${pullRequestData.baseRef}`);
        // console.log(`SHA of merge commit: ${pullRequestData.sha}`);
        // console.log(`PR creator: ${pullRequestData.actor}`);
        // console.log(`Time PR created: ${pullRequestData.timestamp}`);
        if (!accessKeyId || !secretKey || !region || !bucket) {
            core.warning('Failed to retrieve required secrets. See configuration for instructions on how to add secrets to action.');
            return;
        }
        try {
            const packageJson = await getPackageJSON();
            packageJson && (await sendData({ pullRequestData, packageJson }));
        }
        catch (error) {
            console.log(`${error}, Could not send data, printing comment`);
        }
        if (pullRequestData.pullRequest) {
            console.log(pullRequestData.pullRequest);
        }
        if (github.context.payload.pull_request) {
            makeComment('');
        }
    }
    catch (error) {
        if (error instanceof Error) {
            core.setFailed(error.message);
        }
        else {
            core.setFailed(util.inspect(error));
        }
    }
};
run();
