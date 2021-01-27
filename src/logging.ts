import * as core from "@actions/core";

const isCI = Boolean(process.env.CI);

export function logDiffStartEnd(label: string, start: bigint, end: bigint) {
  const NS_PER_MS = BigInt(1e6);
  const diff = Math.round(Number((end - start) / NS_PER_MS));
  log(`${label} ${diff} ms`);
}

type Levels = "ERROR" | "WARN" | "INFO";
type LogOptions = {
  level: Levels;
};

export function log(msg: string, options?: LogOptions) {
  if (isCI) {
    if (options?.level === "ERROR") {
      core.setFailed(msg);
    }

    if (options?.level === "WARN") {
      core.warning(msg);
    }

    if (options?.level === "INFO") {
      console.log(msg);
    }
  } else {
    console.log(msg);
  }
}
