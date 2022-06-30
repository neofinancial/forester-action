import { getInput, setFailed, warning } from '@actions/core';
import { context } from '@actions/github';
import { inspect } from 'util';

import { getPullRequestData } from './get-pull-request-data';
import { makeComment } from './make-comment';
import { uploadPackage } from './upload-package';
import { setupPullRequest } from './setup-pull-request';
import { generateReport, GenerateReportInput } from './generate-report';

const run = async (): Promise<void> => {
  try {
    const cloudFrontAuth = getInput('cloudFrontAuth');
    const serviceUrl = getInput('serviceUrl');

    if (!serviceUrl) {
      warning(
        'Failed to retrieve `serviceUrl`. See configuration for instructions on how to add serviceUrl to action.'
      );
    }

    if (!cloudFrontAuth) {
      warning(
        'Failed to retrieve `cloudFrontAuth`. See configuration for instructions on how to add cloudFrontAuth to action.'
      );
    }

    const pullRequestData = await getPullRequestData();

    try {
      const { packageSignedUrl, packageLockSignedUrl } = await setupPullRequest(
        cloudFrontAuth,
        serviceUrl,
        pullRequestData
      );

      const [uploadedPackageJson, uploadedPackageLockJson] = await Promise.all([
        uploadPackage({ url: packageSignedUrl, fileName: 'package.json' }),
        uploadPackage({ url: packageLockSignedUrl, fileName: 'package-lock.json' }),
      ]);

      if (uploadedPackageJson && uploadedPackageLockJson) {
        const generateReportInput: GenerateReportInput = {
          repositoryId: pullRequestData.repositoryId,
          pullRequest: pullRequestData.pullRequest,
          sha: pullRequestData.sha,
        };

        const report = await generateReport(cloudFrontAuth, serviceUrl, generateReportInput);

        console.log(report);
      }
    } catch (error) {
      console.log(`${error}, Could not send data, printing comment`);
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
