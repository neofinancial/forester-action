import { setFailed } from '@actions/core';
import axios from 'axios';
import { inspect } from 'util';
import { gql } from '@apollo/client';

export type GenerateReportInput = {
  packageFilename: string;
  packageLockFilename: string;
};

export type GenerateReportResponse = {
  report: unknown;
};

const generateReport = async (
  cloudFrontAuth: string,
  url: string,
  generateReportInput: GenerateReportInput
): Promise<GenerateReportResponse> => {
  const mutation = gql`
    mutation generateReport {
      generateReport(input: ${generateReportInput}) {
        __typename
        packageSignedUrl
        packageLockSignedUrl
      }
    }
  `;

  try {
    const response = await axios({
      headers: { cloudfrontauth: cloudFrontAuth },
      url,
      method: 'get',
      data: { mutation },
    });

    return response.data.generateReport;
  } catch (error) {
    if (error instanceof Error) {
      setFailed(error.message);
    } else {
      setFailed(inspect(error));
    }

    throw new Error('Could not generate a report from Forester-service');
  }
};

export { generateReport };
