'use strict';

var core = require('@actions/core');
var github = require('@actions/github');
var util = require('util');
var action = require('@octokit/action');
var axios = require('axios');
var fs = require('fs');
var graphqlRequest = require('graphql-request');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var axios__default = /*#__PURE__*/_interopDefaultLegacy(axios);
var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs);

const getPullRequestData = async () => {
    const { after, base_ref, number, pull_request, sender, ref, repository, head_commit } = github.context.payload;
    const setupPullRequestInput = {
        repositoryId: repository?.id.toString(),
        ref: pull_request?.head.ref || ref.replace('refs/heads/', ''),
        baseRef: pull_request?.base.ref || base_ref || '',
        sha: pull_request?.head.sha || after,
        actor: sender?.login || 'github',
        timestamp: pull_request?.created_at || head_commit.timestamp,
        pullRequest: number || 0,
        repositoryName: repository?.name
    };
    console.log('setupPullRequestInput:', setupPullRequestInput);
    return setupPullRequestInput;
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
        const botComment = comments.data.find((comment) => comment.body?.includes('<!-- forester-action-comment -->'));
        console.log('botComment', botComment);
        console.log('commentData', commentData);
        const body = commentData;
        if (!botComment) {
            octokit.issues.createComment({
                owner: owner,
                repo: repo,
                issue_number: pullRequestNumber,
                body,
            });
        }
        else {
            octokit.issues.updateComment({
                owner: owner,
                repo: repo,
                comment_id: botComment.id,
                body,
            });
        }
    }
    catch {
        core.setFailed('Could not generate comment.');
    }
};

const uploadPackage = async ({ url, fileName }) => {
    try {
        const path = `${process.cwd()}/${fileName}`;
        const file = fs__default["default"].readFileSync(path);
        const response = await axios__default["default"].put(url, file);
        return response.status === 200;
    }
    catch (error) {
        if (error instanceof Error) {
            core.setFailed(error.message);
        }
        else {
            core.setFailed(util.inspect(error));
        }
        throw new Error('Could not upload file to S3');
    }
};

const setupPullRequest = async (cloudFrontAuth, url, setupPullRequestInput) => {
    const mutation = graphqlRequest.gql `
    mutation setupPullRequest($input: SetupPullRequestInput!) {
      setupPullRequest(input: $input) {
        packageSignedUrl
        packageLockSignedUrl
      }
    }
  `;
    try {
        const response = await graphqlRequest.request({
            url,
            document: mutation,
            variables: { input: setupPullRequestInput },
            requestHeaders: { cloudfrontauthorization: cloudFrontAuth },
        });
        return response.setupPullRequest;
    }
    catch (error) {
        if (error instanceof Error) {
            core.setFailed(error.message);
        }
        else {
            core.setFailed(util.inspect(error));
        }
        throw new Error('Could not retrieve presignedUrls from Forester-service');
    }
};

const generateReport = async (cloudFrontAuth, url, generateReportInput) => {
    const mutation = graphqlRequest.gql `
    mutation generateReport($input: GenerateReportInput!) {
      generateReport(input: $input) {
        report
      }
    }
  `;
    try {
        const response = await graphqlRequest.request({
            url,
            document: mutation,
            variables: { input: generateReportInput },
            requestHeaders: { cloudfrontauthorization: cloudFrontAuth },
        });
        return response.generateReport;
    }
    catch (error) {
        if (error instanceof Error) {
            core.setFailed(error.message);
        }
        else {
            core.setFailed(util.inspect(error));
        }
        throw new Error('Could not generate a report from Forester-service');
    }
};

const run = async () => {
    try {
        const cloudFrontAuth = core.getInput('cloudFrontAuth');
        const serviceUrl = core.getInput('serviceUrl');
        let generateReportResponse;
        if (!serviceUrl) {
            core.warning('Failed to retrieve `serviceUrl`. See configuration for instructions on how to add serviceUrl to action.');
        }
        if (!cloudFrontAuth) {
            core.warning('Failed to retrieve `cloudFrontAuth`. See configuration for instructions on how to add cloudFrontAuth to action.');
        }
        const pullRequestData = await getPullRequestData();
        const setupPullRequestInput = {
            repositoryId: pullRequestData.repositoryId,
            ref: pullRequestData.ref,
            baseRef: pullRequestData.baseRef,
            sha: pullRequestData.sha,
            actor: pullRequestData.actor,
            timestamp: pullRequestData.timestamp,
            pullRequest: pullRequestData.pullRequest,
        };
        try {
            const { packageSignedUrl, packageLockSignedUrl } = await setupPullRequest(cloudFrontAuth, serviceUrl, setupPullRequestInput);
            const [uploadedPackageJson, uploadedPackageLockJson] = await Promise.all([
                uploadPackage({ url: packageSignedUrl, fileName: 'package.json' }),
                uploadPackage({ url: packageLockSignedUrl, fileName: 'package-lock.json' }),
            ]);
            if (uploadedPackageJson && uploadedPackageLockJson) {
                const generateReportInput = {
                    repositoryId: pullRequestData.repositoryId,
                    ref: pullRequestData.ref,
                    pullRequest: pullRequestData.pullRequest,
                    sha: pullRequestData.sha,
                    repositoryName: pullRequestData.repositoryName,
                };
                generateReportResponse = await generateReport(cloudFrontAuth, serviceUrl, generateReportInput);
                console.log(generateReportResponse);
            }
        }
        catch (error) {
            console.log(`${error}, Could not send data`);
        }
        if (github.context.payload.pull_request && generateReportResponse) {
            makeComment(generateReportResponse.report);
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
