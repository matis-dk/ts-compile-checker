import commandLineUsage from "command-line-usage";
import commandLineArgs from "command-line-args";
import docs from "command-line-docs";

const projectName = "TS compile checker";
const projectDescription = "Validating compilation of multiple TS projects";

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
    multiple: true,
    defaultValue: [],
    type: String,
  },
  {
    name: "exclude",
    description: "Excluding a set of project paths.",
    alias: "e",
    multiple: true,
    defaultValue: [],
    type: String,
  },
  {
    name: "options",
    description:
      'Override the default options `["--noEmit", "--pretty"]` passed to the tsc compiler for each sub-project',
    alias: "o",
    multiple: true,
    defaultValue: ["--noEmit", "--pretty"],
    type: String,
  },
  {
    name: "cwd",
    description:
      "Current working directory that the search process should be based on. Default directory is `.`.",
    alias: "c",
    defaultValue: ".",
    type: String,
  },
  {
    name: "version",
    description: "Current version of the project.",
    alias: "v",
    defaultValue: false,
    type: Boolean,
  },
];

if (process.argv.includes("docs")) {
  const cliMarkdownDocs = docs({
    name: projectName,
    description: projectDescription,
    options: optionDefinitions,
  });
  console.log(cliMarkdownDocs);
  process.exit();
}

export const cliUsage = commandLineUsage([
  {
    header: projectName,
    content: projectDescription,
  },
  {
    header: "Options",
    optionList: optionDefinitions,
  },
  {
    content:
      "Project home: {underline https://github.com/matis-dk/ts-compile-checker}",
  },
]);

type Args = {
  help: boolean;
  skip: boolean;
  include: Array<string>;
  exclude: Array<string>;
  options: Array<string>;
  cwd: string;
  version: boolean;
};

export const cliArguments = commandLineArgs(optionDefinitions) as Args;
