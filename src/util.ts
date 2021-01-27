import fs from "fs";
import { promisify } from "util";

const readFile = promisify(fs.readFile);

export async function validatingFile(filePath: string): Promise<boolean> {
  try {
    await readFile(filePath, { encoding: "utf8" });
    return true;
  } catch (err) {
    return false;
  }
}
