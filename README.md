<h1 align="center">
 Typescript compile checker
</h1>

[![PRs welcome!](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/matis-dk/ts-compile-checker/pulls)
[![Downloads](https://img.shields.io/npm/dm/ts-compile-checker)](https://www.npmjs.com/package/ts-compile-checker)
[![License](https://img.shields.io/badge/license-MIT-green.svg?style=flat)](https://github.com/matis-dk/ts-compile-checker/blob/master/LICENSE)

## Description

Managing a microservice architecture with multiple shared Typescript types quickly become cumbersome, if the compiler isn't watching the involed sub-projects.

This package solves those issues by:

1. Recursively searching for `tsconfig.json` files in a specified directory
2. Installing `package.json` dependencies
3. Running the `tsc` compiler located in `node_modules/.bin/tsc` for each sub-project.

## Usage

#### CLI

```
npx ts-compile-checker
```

#### Package.json script

```
{
  "dependencies": {
    "ts-compile-check": "^1.0.3",
  },
  "scripts": {
    "ts-compile-check": "node ts-compile-checker",
  }
}
```

Installation

```
yarn add ts-compile-checker
```

Run

```
yarn run ts-compile-checker
```

## License

This project is licensed under the terms of the MIT license. See the [LICENSE](LICENSE) file.
