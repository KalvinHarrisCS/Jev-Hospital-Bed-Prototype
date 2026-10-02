# Code reviews

I want changes to go through a pull request with tests and another review. GitHub runs the tests, and CodeRabbit gives us a second check on the code.

## Set up CodeRabbit

1. Sign in through [CodeRabbit's GitHub setup](https://docs.coderabbit.ai/platforms/github-com).
2. Choose `KalvinHarrisCS`, then **Only select repositories**.
3. Select **Jev-Hospital-Bed-Prototype** and finish the GitHub App installation.

[The review settings](../../.coderabbit.yaml) live with the code. They request a review for every pull request, including drafts and every target branch. New commits request another review, with no pause after five reviewed commits and no author, title or label filters. Comments stay short and the pull request wording stays yours. Adding this file sets the rules; the GitHub App still needs access to the repository. CodeRabbit reads the settings from the branch being reviewed, or the target branch for a fork. Keep this file when creating a branch. [Configuration guide](https://docs.coderabbit.ai/getting-started/yaml-configuration) · [Automatic review settings](https://docs.coderabbit.ai/configuration/auto-review)

## Ask for a review

The automatic settings cannot override CodeRabbit's service limits. CodeRabbit currently requires a manual trigger for public repositories with fewer than ten stars. If a review is skipped, use **Trigger review** in its status comment or add this comment to the pull request:

```text
@coderabbitai full review
```

Before merging, check that `coderabbitai[bot]` completed a review of the latest commit. A configuration file or a skipped-review message does not mean the review ran. CodeRabbit can also give a passing check when a review is rate limited, so the green check alone is not proof. [Review commands](https://docs.coderabbit.ai/reference/review-commands) · [Current review limits](https://docs.coderabbit.ai/management/plans) · [Rate-limit behavior](https://docs.coderabbit.ai/management/rate-limits)

For the pipeline's tests-first step, failures at `NOT_IMPLEMENTED` are expected. CodeRabbit should still check the sample answers, data rules and tests for mistakes. Keep the pull request in draft until the function is written and GitHub's required `Tests` check passes.
