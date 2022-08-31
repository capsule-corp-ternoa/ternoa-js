# Contributing to ternoa-js

Do you want to contribute to the Ternoa SDK ? First of all, thank you for your interest and welcome. We want to build the best and friendly tool to build on top of Ternoa Chain and we appreciate your willingness to help us.

## Communication

The development process aims to be as transparent as possible. All our ideas, design choices and tasks tracking are accessible publicly in our Github sections:

- [Github Issues](https://github.com/capsule-corp-ternoa/ternoa-js/issues): The place to filing and track pending issues.
- [Github Discussions](https://github.com/capsule-corp-ternoa/ternoa-js/discussions): The place to discover and build ternoa-js together.
- [Github Projects](https://github.com/orgs/capsule-corp-ternoa/projects/8/views/5): The place to track the current tasks handled for the next incoming release.

## Filing Issues

Did you discover a bug? Filing issues is an easy way anyone can contribute and helps us improve ternoa-js. We use [Github Issues](https://github.com/capsule-corp-ternoa/ternoa-js/issues) to track all known bugs and feature requests.

Before logging an issue be sure to check current issues, also verify that your package version is [the latest one](https://www.npmjs.com/package/ternoa-js). Make sure to specify whether you are describing a bug or a new enhancement using the **Bug** or **Enhancement** label.

If you have a new feature request, feel free to describe it in our [Github Discussions](https://github.com/capsule-corp-ternoa/ternoa-js/discussions) space opening a new discussion of type `Ideas`.

See the GitHub help guide for more information on [filing an issue](https://help.github.com/en/articles/creating-an-issue).

## Rules

There are a few basic ground-rules for contributors (including the maintainer(s) of the project):

1. **No `--force` pushes** or modifying the Git history in any way. If you need to rebase, ensure you do it in your own repo.
2. **All modifications** must be made in a **pull-request** to solicit feedback from other contributors.
3. A pull-request _must not be merged until CI_ has finished successfully.

## Contribution Model

The `main` branch refers to the last stable release, the incoming work is handled on the `dev` branch. Each pull request should be initiated against the `dev` branch and must satisfy the CI rules which include unit tests.

## Code Guidelines

This project uses recommended ESLint and Typescript rules to ensure coding good practices.

We've setup linters and formatters to help catch errors and improve the development experience:

- [Prettier](https://prettier.io/) – ensures that code is formatted in a readable way.
- [ESLint](https://eslint.org/) — checks code for antipatterns as well as formatting.

[Husky](https://typicode.github.io/husky) proceeds some checks before pushing a new commit. It ensures that: the project is building, there are no linter/formatting issues and the test suites are not broken.

> If you use Visual Studio Code editor we suggest you to install [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) and [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) extensions.
