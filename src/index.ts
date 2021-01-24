#!/usr/bin/env node
import * as glob from "glob";
import * as core from "@actions/core";
import * as child from "child_process";

const { spawnSync } = child;
const log = console.log;

type CompileError = {
  projectPath: string;
  stdout: string | null;
  stderr: string | null;
};

log("Started TS compile checker");

(async function start() {
  const projects = await getProjects();
  const compileErrors = runCompilationChecks(projects);
  logErrors(compileErrors);
})();

function getProjects(): Promise<string[]> {
  log("🔍 Searching for projects with a tsconfig.json file");
  return new Promise((res, _) => {
    glob("./**/tsconfig.json", {}, function (err, files) {
      if (err) {
        log(err);
        throw new Error("Failed search for tsconfig.json files");
      }

      const projects = files
        .filter(
          (f) => !(f.includes("node_modules") || f.includes("ts-compile-check"))
        )
        .map((path) => path.replace("/tsconfig.json", ""));

      log("📝 Projects found");
      console.table(projects.map((project) => ({ path: project })));

      res(projects);
    });
  });
}

function runCompilationChecks(projectPaths: string[]) {
  try {
    const compileErrors: CompileError[] = [];
    core.info("🛠️  Checking for typescript compilation errors");

    projectPaths.forEach((projectPath) => {
      const tscArgs = ["--noEmit", "--pretty"];
      const options = {
        cwd: projectPath,
      };

      spawnSync("yarn", ["install"], options);

      const output = spawnSync("node_modules/.bin/tsc", tscArgs, options);

      if (output.status !== 0) {
        compileErrors.push({
          projectPath,
          stdout: output.stdout?.toString(),
          stderr: output.stderr?.toString(),
        });
      }
    });

    return compileErrors;
  } catch (err) {
    core.setFailed("ERROR: Failed to run childProcess");
    throw new Error(err);
  }
}

function logErrors(compileErrors: CompileError[]) {
  if (compileErrors.length) {
    core.setFailed(
      `❌  Failed to compile ${compileErrors.length} project${
        compileErrors.length > 1 ? `s` : ""
      }`
    );

    compileErrors.forEach((c) => {
      console.log("------------------------");
      if (c.stdout) {
        log(`Project '${c.projectPath}'`);
        core.setFailed(c.stdout);
      }
      if (c.stderr) {
        core.setFailed(c.stderr);
      }
    });
    process.exit();
  } else {
    log("✔️  Successfully compiled all projects");
  }
}
