import { setFailed } from '@actions/core';
import { inspect } from 'util';
import { request, gql } from 'graphql-request';

export type GenerateReportInput = {
  repositoryId: string;
  branchName: string;
  pullRequest: number;
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
    mutation generateReport($input: GenerateReportInput!) {
      generateReport(input: $input) {
        report
      }
    }
  `;

  try {
    const response = await request({
      url,
      document: mutation,
      variables: { input: generateReportInput },
      requestHeaders: { cloudfrontauthorization: cloudFrontAuth },
    });

    return response.generateReport;
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
