import { getInput, setFailed, warning } from '@actions/core';
import { context } from '@actions/github';
import { inspect } from 'util';

import { readFile } from './read-file';
import { getPullRequestData } from './get-pull-request-data';
import { makeComment } from './make-comment';
import { uploadPackage } from './upload-package';
import { setupPullRequest, SetupPullRequestInput } from './setup-pull-request';
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
      const filePrefix = encodeURIComponent(`${pullRequestData.repositoryId}-#${pullRequestData.pullRequest}`);
      const fileNamePackage = `${filePrefix}-package.json`;
      const fileNamePackageLock = `${filePrefix}-package-lock.json`;
      const setupPullRequestInput: SetupPullRequestInput = { ...pullRequestData, fileNamePackage, fileNamePackageLock };

      const { presignedUrlPackage, presignedUrlPackageLock } = await setupPullRequest(
        cloudFrontAuth,
        serviceUrl,
        setupPullRequestInput
      );

      const [packageJson, packageLockJson] = await Promise.all([
        readFile(`package.json`),
        readFile(`package-lock.json`),
      ]);

      const [uploadedPackageJson, uploadedPackageLockJson] = await Promise.all([
        uploadPackage({ cloudFrontAuth, url: presignedUrlPackage, data: packageJson }),
        uploadPackage({ cloudFrontAuth, url: presignedUrlPackageLock, data: packageLockJson }),
      ]);

      if (uploadedPackageJson && uploadedPackageLockJson) {
        const generateReportInput: GenerateReportInput = {
          fileNamePackage,
          fileNamePackageLock,
        };

        const report = generateReport(cloudFrontAuth, serviceUrl, generateReportInput);

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
