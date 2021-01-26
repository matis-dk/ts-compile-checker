import * as commandLineUsage from "command-line-usage";
import * as commandLineArgs from "command-line-args";

const optionDefinitions = [
  {
    name: "help",
    description: "Display this usage guide.",
    alias: "h",
    defaultValue: false,
    type: Boolean,
  },
  {
    name: "skip",
    description: "Skipping the installation process.",
    alias: "s",
    defaultValue: false,
    type: Boolean,
  },
  {
    name: "include",
    description:
      "Pass your own set of project paths. This will skip the search process.",
    alias: "i",
    defaultValue: [],
    type: Array,
  },
  {
    name: "exclude",
    description: "Excluding a passed set of project paths.",
    alias: "e",
    defaultValue: [],
    type: Array,
  },
  {
    name: "options",
    description:
      "Override the default options passed to the tsc compiler for each sub-project",
    alias: "o",
    defaultValue: ["--noEmit", "--pretty"],
    type: Array,
  },
  {
    name: "cwd",
    description:
      "Current working directory the search should be based on. Default is `.`. You can ",
    alias: "c",
    defaultValue: ".",
    type: String,
  },
];

export const cliUsage = commandLineUsage([
  {
    header: "TS compile checker",
    content: "Validating compilation of multiple TS projects",
  },
  {
    header: "Options",
    optionList: optionDefinitions,
  },
  {
    content: "Project home: {underline https://github.com/me/example}",
  },
]);

type Args = {
  help: boolean;
  skip: boolean;
  include: Array<string>;
  exclude: Array<string>;
  options: Array<string>;
  cwd: string;
};

export const cliArguments = commandLineArgs(optionDefinitions) as Args;
