#!/usr/bin/env node
import fg from "fast-glob";
import child from "child_process";
import chalk from "chalk";
import path from "path";

import { cliArguments, cliUsage } from "./cli";
import { log, logDiffStartEnd } from "./logging";
import { validatingFile } from "./util";

const version = require("../package.json").version;

if (cliArguments.help) {
  console.log(cliUsage);
  process.exit();
}

if (cliArguments.version) {
  console.log(version);
  process.exit();
}

const { spawnSync } = child;

const tscBin = `node_modules/.bin/tsc`;
const tscArgs = cliArguments.options;

(async function start() {
  const projects = await getProjects();

  if (projects.length === 0) {
    log(`\n🧐 Found 0 projects. Exiting early`);
    return;
  }

  const compileErrors: number = await runCompilationChecks(projects);
  log(
    `\n${
      compileErrors ? "😕" : "👏"
    } Finished with ${compileErrors} compilation error!`
  );
})();

async function getProjects(): Promise<string[]> {
  if (cliArguments.include.length) {
    log(chalk.bold("\n📝 Using projects paths. Skipping search"));
    console.table(cliArguments.include.map((project) => ({ path: project })));
    return Promise.resolve(cliArguments.include);
  }

  log(chalk.bold("\n🔍 Searching for projects with a tsconfig.json file"));
  const tSearchStart = process.hrtime.bigint();

  try {
    const files = await fg(`**/tsconfig.json`, {
      ignore: ["**/node_modules/**", "**/build/**", "**/dist/**"],
      cwd: cliArguments.cwd,
    });
    const tSearchEnd = process.hrtime.bigint();

    const projects = files
      .map((p) =>
        p === "tsconfig.json" ? "." : p.replace("/tsconfig.json", "")
      )
      .map((p) => path.join(cliArguments.cwd, p))
      .filter((p) => {
        if (cliArguments.exclude.includes(p)) {
          log(chalk.italic(`   project path [${p}] excluded`));
          return false;
        }
        return true;
      });

    log(chalk.bold("\n📝 Projects found"));
    console.table(projects.map((p) => ({ path: p })));

    logDiffStartEnd(chalk.bold("\n⏰ Search took"), tSearchStart, tSearchEnd);

    return projects;
  } catch (err) {
    log(err);
    throw new Error("Failed search for tsconfig.json files");
  }
}

async function runCompilationChecks(projectPaths: string[]) {
  let compileErrors = 0;
  try {
    log(chalk.bold("\n🛠️  Checking for typescript compilation errors"));

    for await (const projectPath of projectPaths) {
      const options = {
        cwd: projectPath,
      };

      log(chalk.bold(`\n👉 Project [${projectPath}]`));

      /** INSTALLATION */
      if (!cliArguments.skip) {
        const [yarn, npm] = await Promise.all([
          validatingFile(`${projectPath}/yarn.lock`),
          validatingFile(`${projectPath}/package-lock.json`),
        ]);

        if (yarn === false && npm === false) {
          log(
            `❗  Can't find a yarn.lock or package-lock.json file in path. Skipping!`,
            { level: "WARN" }
          );
          continue;
        }

        const yarnOrNpm = yarn ? "yarn" : "npm";

        log(`•  ${yarnOrNpm} install`);
        spawnSync(yarnOrNpm, ["install"], options);
      }

      /** TS COMPILATION */
      const isValid = validatingFile(`${projectPath}/${tscBin}`);
      if (!isValid) {
        log(`❗  Can't find 'tsc' in ${tscBin}. Skipping!`, { level: "WARN" });
        continue;
      }

      log("•  tsc compilling");
      const output = spawnSync(tscBin, tscArgs, options);

      /** LOGGING */
      if (output.status === 0) {
        log("✔️  Compiled successfully ");
      } else {
        compileErrors += 1;
        const stdout = output.stdout.toString();
        const stderr = output.stdout.toString();
        log(`❌  Compilation failed`, { level: "ERROR" });
        Boolean(stdout) && log(stdout, { level: "ERROR" });
        Boolean(stderr) && log(stderr, { level: "ERROR" });
      }
    }

    return compileErrors;
  } catch (err) {
    log("ERROR: Failed to run childProcess", { level: "ERROR" });
    throw new Error(err);
  }
}
