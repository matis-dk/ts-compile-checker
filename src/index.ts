#!/usr/bin/env node
import * as core from "@actions/core";
import * as child from "child_process";
import * as fg from "fast-glob";
import * as fs from "fs";
import { promisify } from "util";

const readFile = promisify(fs.readFile);
const { spawnSync } = child;

const isCI = Boolean(process.env.CI);
const argInstall = true;
const tscBin = `node_modules/.bin/tsc`;

type CompileError = {
  projectPath: string;
  stdout: string | null;
  stderr: string | null;
  output: any;
};

log("Started TS compile checker");

(async function start() {
  const projects = await getProjects();
  const compileErrors = await runCompilationChecks(
    projects.filter((p) => p !== "api")
  );
  logErrors(compileErrors);
})();

async function getProjects(): Promise<string[]> {
  log("🔍 Searching for projects with a tsconfig.json file");
  const timeSearchStart = process.hrtime.bigint();

  try {
    const files = await fg("**/tsconfig.json", {
      ignore: ["**/node_modules/**", "**/build/**", "**/dist/**"],
    });
    const timeSearchEnd = process.hrtime.bigint();

    const projects = files.map((path) => {
      if (path === "tsconfig.json") {
        return ".";
      } else {
        return path.replace("/tsconfig.json", "");
      }
    });

    log("\n📝 Projects found");
    logDiffStartEnd("\n⏰ Search took", timeSearchStart, timeSearchEnd);

    console.table(projects.map((project) => ({ path: project })));

    return projects;
  } catch (err) {
    log(err);
    throw new Error("Failed search for tsconfig.json files");
  }
}

async function runCompilationChecks(projectPaths: string[]) {
  try {
    const compileErrors: CompileError[] = [];
    log("\n🛠️  Checking for typescript compilation errors");

    for await (const projectPath of projectPaths) {
      const tscArgs = ["--noEmit", "--pretty"];
      const options = {
        cwd: projectPath,
      };

      log(`\n👉 Project [${projectPath}]`);

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

      /** ADDING COMPILE ERRORS */
      if (output.status !== 0) {
        compileErrors.push({
          projectPath,
          stdout: output.stdout?.toString(),
          stderr: output.stderr?.toString(),
          output,
        });
      }
    }

    return compileErrors;
  } catch (err) {
    log("ERROR: Failed to run childProcess", { level: "ERROR" });
    throw new Error(err);
  }
}

// Utilities ----------------------------------------

function logErrors(compileErrors: CompileError[]) {
  if (compileErrors.length) {
    log(`\n❌  Failed to compile ${compileErrors.length} projects`, {
      level: "ERROR",
    });
    compileErrors.forEach((c) => {
      console.log("------------------------");
      if (c.stdout) {
        log(c.stdout, { level: "ERROR" });
      }
      if (c.stderr) {
        log(c.stderr, { level: "ERROR" });
      }
      console.log(c);
    });
  } else {
    log("\n✔️  Successfully compiled all projects");
  }
}

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
