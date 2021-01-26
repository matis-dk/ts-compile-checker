#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
exports.__esModule = true;
var child = require("child_process");
var fg = require("fast-glob");
var fs = require("fs");
var chalk = require("chalk");
var util_1 = require("util");
var cli_1 = require("./cli");
var logging_1 = require("./logging");
if (cli_1.cliArguments.help) {
    console.log(cli_1.cliUsage);
    process.exit();
}
var readFile = util_1.promisify(fs.readFile);
var spawnSync = child.spawnSync;
var tscBin = "node_modules/.bin/tsc";
var tscArgs = cli_1.cliArguments.options;
(function start() {
    return __awaiter(this, void 0, void 0, function () {
        var projects, compileErrors;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getProjects()];
                case 1:
                    projects = _a.sent();
                    if (projects.length === 0) {
                        logging_1.log("\n\uD83E\uDDD0 Found 0 projects. Exiting early");
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, runCompilationChecks(projects)];
                case 2:
                    compileErrors = _a.sent();
                    logging_1.log("\n" + (compileErrors ? "😕" : "👏") + " Finished with " + compileErrors + " compilation errors!");
                    return [2 /*return*/];
            }
        });
    });
})();
function getProjects() {
    return __awaiter(this, void 0, void 0, function () {
        var tSearchStart, files, tSearchEnd, projects, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (cli_1.cliArguments.include.length) {
                        logging_1.log(chalk.bold("\n📝 Using projects paths. Skipping search"));
                        console.table(cli_1.cliArguments.include.map(function (project) { return ({ path: project }); }));
                        return [2 /*return*/, Promise.resolve(cli_1.cliArguments.include)];
                    }
                    logging_1.log(chalk.bold("\n🔍 Searching for projects with a tsconfig.json file"));
                    tSearchStart = process.hrtime.bigint();
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, fg(cli_1.cliArguments.cwd + "/**/tsconfig.json", {
                            ignore: ["**/node_modules/**", "**/build/**", "**/dist/**"]
                        })];
                case 2:
                    files = _a.sent();
                    tSearchEnd = process.hrtime.bigint();
                    projects = files
                        .map(function (path) {
                        return path === "tsconfig.json" ? "." : path.replace("/tsconfig.json", "");
                    })
                        .filter(function (p) {
                        if (cli_1.cliArguments.exclude.includes(p)) {
                            logging_1.log(chalk.italic("   project path [" + p + "] excluded"));
                            return false;
                        }
                        return true;
                    });
                    logging_1.log(chalk.bold("\n📝 Projects found"));
                    console.table(projects.map(function (p) { return ({ path: p }); }));
                    logging_1.logDiffStartEnd(chalk.bold("\n⏰ Search took"), tSearchStart, tSearchEnd);
                    return [2 /*return*/, projects];
                case 3:
                    err_1 = _a.sent();
                    logging_1.log(err_1);
                    throw new Error("Failed search for tsconfig.json files");
                case 4: return [2 /*return*/];
            }
        });
    });
}
function runCompilationChecks(projectPaths) {
    var projectPaths_1, projectPaths_1_1;
    var e_1, _a;
    return __awaiter(this, void 0, void 0, function () {
        var compileErrors, projectPath, options, err_2, _1, output, stdout, stderr, e_1_1, err_3;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    compileErrors = 0;
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 22, , 23]);
                    logging_1.log(chalk.bold("\n🛠️  Checking for typescript compilation errors"));
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 15, 16, 21]);
                    projectPaths_1 = __asyncValues(projectPaths);
                    _b.label = 3;
                case 3: return [4 /*yield*/, projectPaths_1.next()];
                case 4:
                    if (!(projectPaths_1_1 = _b.sent(), !projectPaths_1_1.done)) return [3 /*break*/, 14];
                    projectPath = projectPaths_1_1.value;
                    options = {
                        cwd: projectPath
                    };
                    logging_1.log(chalk.bold("\n\uD83D\uDC49 Project [" + projectPath + "]"));
                    if (!!cli_1.cliArguments.skip) return [3 /*break*/, 9];
                    _b.label = 5;
                case 5:
                    _b.trys.push([5, 7, , 8]);
                    return [4 /*yield*/, readFile(projectPath + "/package.json", {
                            encoding: "utf8"
                        }).then(JSON.parse)];
                case 6:
                    _b.sent();
                    return [3 /*break*/, 8];
                case 7:
                    err_2 = _b.sent();
                    logging_1.log("\u2757  Can't find/parse package.json. Skipping!", {
                        level: "WARN"
                    });
                    return [3 /*break*/, 13];
                case 8:
                    logging_1.log("•  yarn install");
                    spawnSync("yarn", ["install"], options);
                    _b.label = 9;
                case 9:
                    _b.trys.push([9, 11, , 12]);
                    return [4 /*yield*/, readFile(projectPath + "/" + tscBin)];
                case 10:
                    _b.sent();
                    return [3 /*break*/, 12];
                case 11:
                    _1 = _b.sent();
                    logging_1.log("\u2757  Can't find 'tsc' in " + tscBin + ". Skipping!", { level: "WARN" });
                    return [3 /*break*/, 13];
                case 12:
                    logging_1.log("•  tsc compilling");
                    output = spawnSync(tscBin, tscArgs, options);
                    /** LOGGING */
                    if (output.status === 0) {
                        logging_1.log("✔️  Compiled successfully ");
                    }
                    else {
                        compileErrors += 1;
                        stdout = output.stdout.toString();
                        stderr = output.stdout.toString();
                        logging_1.log("\u274C  Compilation failed", { level: "ERROR" });
                        Boolean(stdout) && logging_1.log(stdout, { level: "ERROR" });
                        Boolean(stderr) && logging_1.log(stderr, { level: "ERROR" });
                    }
                    _b.label = 13;
                case 13: return [3 /*break*/, 3];
                case 14: return [3 /*break*/, 21];
                case 15:
                    e_1_1 = _b.sent();
                    e_1 = { error: e_1_1 };
                    return [3 /*break*/, 21];
                case 16:
                    _b.trys.push([16, , 19, 20]);
                    if (!(projectPaths_1_1 && !projectPaths_1_1.done && (_a = projectPaths_1["return"]))) return [3 /*break*/, 18];
                    return [4 /*yield*/, _a.call(projectPaths_1)];
                case 17:
                    _b.sent();
                    _b.label = 18;
                case 18: return [3 /*break*/, 20];
                case 19:
                    if (e_1) throw e_1.error;
                    return [7 /*endfinally*/];
                case 20: return [7 /*endfinally*/];
                case 21: return [2 /*return*/, compileErrors];
                case 22:
                    err_3 = _b.sent();
                    logging_1.log("ERROR: Failed to run childProcess", { level: "ERROR" });
                    throw new Error(err_3);
                case 23: return [2 /*return*/];
            }
        });
    });
}
