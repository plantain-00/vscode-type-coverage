# vscode-type-coverage

VSCode plugin for type-coverage<https://github.com/plantain-00/type-coverage>.

[![Dependency Status](https://david-dm.org/plantain-00/vscode-type-coverage.svg)](https://david-dm.org/plantain-00/vscode-type-coverage)
[![devDependency Status](https://david-dm.org/plantain-00/vscode-type-coverage/dev-status.svg)](https://david-dm.org/plantain-00/vscode-type-coverage#info=devDependencies)
[![Build Status: Linux](https://travis-ci.org/plantain-00/vscode-type-coverage.svg?branch=master)](https://travis-ci.org/plantain-00/vscode-type-coverage)
[![Build Status: Windows](https://ci.appveyor.com/api/projects/status/github/plantain-00/vscode-type-coverage?branch=master&svg=true)](https://ci.appveyor.com/project/plantain-00/vscode-type-coverage/branch/master)
[![type-coverage](https://img.shields.io/badge/dynamic/json.svg?label=type-coverage&prefix=%E2%89%A5&suffix=%&query=$.typeCoverage.atLeast&uri=https%3A%2F%2Fraw.githubusercontent.com%2Fplantain-00%2Fvscode-type-coverage%2Fmaster%2Fpackage.json)](https://github.com/plantain-00/vscode-type-coverage)

## features

![1.png](./resources/1.png)

![2.png](./resources/2.png)

## extension url

<https://marketplace.visualstudio.com/items?itemName=york-yao.vscode-type-coverage>

## config options in package.json

```json
{
  ...
  "typeCoverage": {
    "ignoreCatch": true // see LintOptions from https://github.com/plantain-00/type-coverage#api'
  }
  ...
}
```

## develop

1. `yarn`
1. `yarn watch`
1. Press `F5` to start

## known issues

1. Report more errors than the CLI(the CLI result is right): <https://github.com/plantain-00/vscode-type-coverage/issues/1>
