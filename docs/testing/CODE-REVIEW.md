# Code reviews

I want changes to go through a pull request with tests and another review. GitHub runs the tests, and CodeRabbit gives us a second check on the code.

## Set up CodeRabbit

1. Sign in through [CodeRabbit's GitHub setup](https://docs.coderabbit.ai/platforms/github-com).
2. Choose `KalvinHarrisCS`, then **Only select repositories**.
3. Select **Jev-Hospital-Bed-Prototype** and finish the GitHub App installation.

[The review settings](../../.coderabbit.yaml) live with the code. They allow draft reviews, keep comments short and leave the pull request wording alone. Adding this file sets the rules; the GitHub App still needs access to the repository before it can review anything. CodeRabbit reads the settings from the branch being reviewed. [Configuration guide](https://docs.coderabbit.ai/getting-started/yaml-configuration)

## Ask for a review

CodeRabbit currently requires a manual trigger for public repositories with fewer than ten stars. After installation, add this comment to the pull request:

```text
@coderabbitai full review
```

Look for a completed review from `coderabbitai[bot]` and the CodeRabbit check. A configuration file or a skipped-review message does not mean the review ran. [Review commands](https://docs.coderabbit.ai/reference/review-commands) · [Current review limits](https://docs.coderabbit.ai/management/plans)

For the pipeline's tests-first step, failures at `NOT_IMPLEMENTED` are expected. CodeRabbit should still check the sample answers, data rules and tests for mistakes. Keep the pull request in draft until the function is written and GitHub's required `Tests` check passes.
