# Reviewing a pull request

Keep changes on a branch and open a pull request. GitHub runs the app and pipeline tests. The `Tests` check must pass before merging into `main`.

Before merging, read the changes and check:

- The change does what the pull request says.
- The tests cover the behavior being changed, including likely mistakes.
- No keys, real patient notes or private settings were added.
- The instructions still match how the project runs.

Keep unfinished work in draft, and do not skip tests to make the check green. [The test guide](TESTS.md) explains how to run the same checks locally or in Docker.
