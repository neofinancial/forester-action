import { setFailed } from '@actions/core';
import { context } from '@actions/github';
import { Octokit } from '@octokit/action';
import { Arborist } from '@npmcli/arborist';

import { constructComment } from './construct-comment';

export type CommentData = {
  foo: string;
};

const makeComment = async (commentData?: string): Promise<void> => {
  try {
    if (!context.payload.pull_request) {
      setFailed('No pull requests found.');

      return;
    }

    const githubRepo = process.env.GITHUB_REPOSITORY;

    if (!githubRepo) {
      setFailed('No repo found');

      return;
    }

    const [owner, repo] = githubRepo.split('/');
    const pullRequestNumber = context.payload.pull_request.number;
    const octokit = new Octokit();

    const comments = await octokit.issues.listComments({
      owner,
      repo,
      issue_number: pullRequestNumber,
    });

    const botComment = comments.data.find((comment) => comment.body?.includes('<!-- dependanot-action-comment -->'));

    const arborist = new Arborist({
      prefix: process.cwd(),
      path: process.cwd(),
    });
    const tree = await arborist.loadVirtual({ path: process.cwd(), name: 'npm' });

    console.log(tree);
    console.log(botComment);
    console.log(commentData);

    if (!botComment) {
      octokit.issues.createComment({
        owner: owner,
        repo: repo,
        issue_number: pullRequestNumber,
        body: await constructComment(commentData),
      });
    } else {
      octokit.issues.updateComment({
        owner: owner,
        repo: repo,
        comment_id: botComment.id,
        body: await constructComment('update'),
      });
    }
  } catch {
    throw new Error('Could not generate comment.');
  }
};

export { makeComment };
