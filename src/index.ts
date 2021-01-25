#!/usr/bin/env node
import * as core from "@actions/core";
import * as child from "child_process";
import * as fg from "fast-glob";
import * as fs from "fs";
import * as chalk from "chalk";

import { promisify } from "util";

const readFile = promisify(fs.readFile);
const { spawnSync } = child;

const isCI = Boolean(process.env.CI);
const argInstall = true;
const tscBin = `node_modules/.bin/tsc`;

(async function start() {
  const projects = await getProjects();
  const compileErrors: number = await runCompilationChecks(projects);
  log(
    `\n${
      compileErrors ? "😕" : "👏"
    } Finished with ${compileErrors} compilation errors!`
  );
})();

async function getProjects(): Promise<string[]> {
  log(chalk.bold("🔍 Searching for projects with a tsconfig.json file"));
  const tSearchStart = process.hrtime.bigint();

  try {
    const files = await fg("**/tsconfig.json", {
      ignore: ["**/node_modules/**", "**/build/**", "**/dist/**"],
    });
    const tSearchEnd = process.hrtime.bigint();

    const projects = files.map((path) => {
      if (path === "tsconfig.json") {
        return ".";
      } else {
        return path.replace("/tsconfig.json", "");
      }
    });

    log(chalk.bold("\n📝 Projects found"));
    console.table(projects.map((project) => ({ path: project })));

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
      const tscArgs = ["--noEmit", "--pretty"];
      const options = {
        cwd: projectPath,
      };

      log(chalk.bold(`\n👉 Project [${projectPath}]`));

      /** INSTALLATION */
      if (argInstall) {
        try {
          await readFile(`${projectPath}/package.json`, {
            encoding: "utf8",
          }).then(JSON.parse);
        } catch (err) {
          log(`❗  Can't find/parse package.json. Skipping!`, {
            level: "WARN",
          });
          continue;
        }
        log("• yarn install");
        spawnSync("yarn", ["install"], options);
      }

      /** TS COMPILATION */
      try {
        await readFile(`${projectPath}/${tscBin}`);
      } catch (_) {
        log(`❗  Can't find 'tsc' in ${tscBin}. Skipping!`, { level: "WARN" });
        continue;
      }
      log("• tsc compilling");
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

// Utilities ----------------------------------------

function logDiffStartEnd(label: string, start: bigint, end: bigint) {
  const NS_PER_MS = BigInt(1e6);
  const diff = Math.round(Number((end - start) / NS_PER_MS));
  log(`${label} ${diff} ms`);
}

type Levels = "ERROR" | "WARN" | "INFO";
type LogOptions = {
  level: Levels;
};
function log(msg: string, options?: LogOptions) {
  if (isCI) {
    if (options?.level === "ERROR") {
      core.setFailed(msg);
    }

    if (options?.level === "WARN") {
      core.warning(msg);
    }

    if (options?.level === "INFO") {
      core.info(msg);
    }
  } else {
    console.log(msg);
  }
}
