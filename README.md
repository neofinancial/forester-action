# Dependanot Upload Action

Uploads dependency data to a remote server - test

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
        run: npm test -- --dependanot
      - name: Upload dependanot
        uses: neofinancial/dependanot-action
        with:
          dependanotEndpoint: https://your.endpoint.here
          dependanotToken: ${{ secrets.DEPENDANOT_TOKEN }}
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

If you have an existing workflow that runs your tests you can just add the `Config dependanot` step at the end of that workflow.

## Settings

| Name               | Description                                                            | Default | Required |
| ------------------ | ---------------------------------------------------------------------- | ------- | -------- |
| dependanotEndpoint | The remote endpoint to upload dependanot data to                       |         | No       |
| dependanotToken    | A token to authenticate with the remote endpoint and identify the repo |         | No       |

## REST API Message Format

This action will send a POST request to the specified endpoint with a message that looks like this:

```json
{
  "id": 218177808,
  "actor": "a-github-user",
  "hash": "3ba1efac955942305a038ba37d25e20b4d2092e6",
  "baseRef": "master",
  "ref": "my-branch",
  "token": "secret"
}
```

The `id` field is the GitHub repository ID and is added automatically. The `token` field is the token generated by your API service to authenticate and identify the repository.
