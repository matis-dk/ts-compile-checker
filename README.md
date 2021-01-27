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

Npx

```
npx ts-compile-checker
```

Docker

```
docker run --rm -it -v $(pwd):/src:rw mkenney/npm:latest npx ts-compile-checker
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

Install and run

```
yarn add ts-compile-checker && yarn ts-compile-checker
```

#### Github Action

```
on: push
name: TS compilation check
jobs:
  checker:
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npx ts-compile-checker
        working-directory: ./
```

## Options

| Flag              | Type    | Description                                                                                             |
| ----------------- | ------- | ------------------------------------------------------------------------------------------------------- |
| `--help`, `-h`    | Boolean | Display this usage guide.                                                                               |
| `--skip`, `-s`    | Boolean | Skipping the installation process.                                                                      |
| `--include`, `-i` | Array   | Pass your own set of project paths. This will skip the search process.                                  |
| `--exclude`, `-e` | Array   | Excluding a set of project paths.                                                                       |
| `--options`, `-o` | Array   | Override the default options `["--noEmit", "--pretty"]` passed to the tsc compiler for each sub-project |
| `--cwd`, `-c`     | String  | Current working directory that the search process should be based on. Default directory is `.`.         |

## License

This project is licensed under the terms of the MIT license. See the [LICENSE](LICENSE) file.
