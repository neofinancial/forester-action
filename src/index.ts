import { getInput, setFailed, warning } from '@actions/core';
import { context } from '@actions/github';
import { inspect } from 'util';

import { readFile } from './read-file';
import { getPullRequestData } from './get-pull-request-data';
import { makeComment } from './make-comment';
import { uploadPackage } from './upload-package';
import { setupPullRequest } from './setup-pull-request';

const run = async (): Promise<void> => {
  try {
    const cloudFrontAuth = getInput('cloudFrontAuth');
    const serviceUrl = getInput('serviceUrl');

    if (!serviceUrl) {
      warning(
        'Failed to retrieve `serviceUrl`. See configuration for instructions on how to add serviceUrl to action.'
      );
    }

    const pullRequestData = await getPullRequestData();

    try {
      const { presignedUrlPackage, presignedUrlPackageLock } = await setupPullRequest(
        cloudFrontAuth,
        serviceUrl,
        pullRequestData
      );

      const [packageJson, packageLockJson] = await Promise.all([
        readFile(`package.json`),
        readFile(`package-lock.json`),
      ]);

      const [uploadedPackageJson, uploadedPackageLockJson] = await Promise.all([
        uploadPackage(presignedUrlPackage, packageJson),
        uploadPackage(presignedUrlPackageLock, packageLockJson),
      ]);

      if (uploadedPackageJson && uploadedPackageLockJson) {
        console.log('Uploaded package and package-lock to S3');
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
