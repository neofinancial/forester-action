import { getInput, setFailed, warning } from '@actions/core';
import { context } from '@actions/github';
import { inspect } from 'util';

// import { readFile } from './read-file';
import { getPullRequestData } from './get-pull-request-data';
import { makeComment } from './make-comment';
import { uploadPackage } from './upload-package';
import { setupPullRequest, SetupPullRequestInput } from './setup-pull-request';
import { generateReport, GenerateReportInput } from './generate-report';

const run = async (): Promise<void> => {
  try {
    const cloudFrontAuth = getInput('cloudFrontAuth');
    const serviceUrl = getInput('serviceUrl');
    let report;
    
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
      const packageFilename = `${filePrefix}-package.json`;
      const packageLockFilename = `${filePrefix}-package-lock.json`;
      const setupPullRequestInput: SetupPullRequestInput = { ...pullRequestData, packageFilename, packageLockFilename };

      const { packageSignedUrl, packageLockSignedUrl } = await setupPullRequest(
        cloudFrontAuth,
        serviceUrl,
        setupPullRequestInput
      );

      // const [packageJson, packageLockJson] = await Promise.all([
      //   readFile(`package.json`),
      //   readFile(`package-lock.json`),
      // ]);

      const [uploadedPackageJson, uploadedPackageLockJson] = await Promise.all([
        uploadPackage({ url: packageSignedUrl, fileName: packageFilename }),
        uploadPackage({ url: packageLockSignedUrl, fileName: packageLockFilename }),
      ]);

      if (uploadedPackageJson && uploadedPackageLockJson) {
        const generateReportInput: GenerateReportInput = {
          packageFilename,
          packageLockFilename,
        };

         report = generateReport(cloudFrontAuth, serviceUrl, generateReportInput);

        console.log(report);
      }
    } catch (error) {
      console.log(`${error}, Could not send data, printing comment`);
    }

    if (context.payload.pull_request) {
      makeComment(report);
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
