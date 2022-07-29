# Forester Upload Action

Uploads dependency data to a remote server

## Overview

This action will display the current dependency vulnerability report for a pull requests when provided a remote endpoint to receive the dependency data

If you don't send the data to a remote endpoint the difference column will not be shown.

## Usage

In your `.github/workflows` directory make a new workflow file that runs on pull requests and pushes to the default branch.

```yml
name: CI

on:
  pull_request:
    types: ['opened', 'reopened', 'synchronize']
  push:
    branches: ['master']

jobs:
  title:
    name: run tests
    runs-on: ubuntu-latest
    steps:
      - name: Test
        run: npm test --
      - name: Download ShiftLeft CLI
        run: |
          curl https://cdn.shiftleft.io/download/sl > ${GITHUB_WORKSPACE}/sl && chmod a+rx ${GITHUB_WORKSPACE}/sl
      # ShiftLeft requires Java 1.8. Post the package step override the version
      - name: Setup Java JDK
        uses: actions/setup-java@v1.4.3
        with:
          java-version: 1.8
      - name: Extract branch name
        shell: bash
        run: echo "##[set-output name=branch;]$(echo ${GITHUB_REF#refs/heads/})"
        id: extract_branch
      - name: NextGen Static Analysis
        run: ${GITHUB_WORKSPACE}/sl analyze --strict --wait --app shiftleft-ts-demo --tag branch=${{ github.head_ref || steps.extract_branch.outputs.branch }} --js --cpg . -- --ts
        env:
          SHIFTLEFT_ACCESS_TOKEN: ${{ secrets.SHIFTLEFT_ACCESS_TOKEN }}
      - name: Upload forester
        uses: neofinancial/forester-action
        with:
          cloudFrontAuth: ${{ secrets.CLOUD_FRONT_AUTH }}
          serviceUrl: ${{ secrets.FORESTER_SERVICE_URL }}
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

If you have an existing workflow that runs your tests you can just add the `Config forester` step at the end of that workflow.

## Settings

| Name                 | Description                  |
| -------------------- | ---------------------------- |
| cloudFrontAuth       | Cloud front authentication   |
| serviceUrl           | Forester service GraphQL URL |
| shiftleftAccessToken | Shiftleft Access Token       |
