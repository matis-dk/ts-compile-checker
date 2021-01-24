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
exports.__esModule = true;
var glob = require("glob");
var core = require("@actions/core");
var child = require("child_process");
var spawnSync = child.spawnSync;
var log = console.log;
log("Started TS compile checker");
(function start() {
    return __awaiter(this, void 0, void 0, function () {
        var projects, compileErrors;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getProjects()];
                case 1:
                    projects = _a.sent();
                    compileErrors = runTypescriptCheck(projects);
                    logErrors(compileErrors);
                    return [2 /*return*/];
            }
        });
    });
})();
function getProjects() {
    log("🔍 Searching for projects with a tsconfig.json file");
    return new Promise(function (res, _) {
        glob("./**/tsconfig.json", {}, function (err, files) {
            if (err) {
                log(err);
                throw new Error("Failed search for tsconfig.json files");
            }
            log(files);
            var projects = files
                .filter(function (f) { return !(f.includes("node_modules") || f.includes("ts-compile-check")); })
                .map(function (path) { return path.replace("/tsconfig.json", ""); });
            log("📝 Projects found");
            console.table(projects);
            res(projects);
        });
    });
}
function runTypescriptCheck(projectPaths) {
    try {
        var compileErrors_1 = [];
        core.info("🛠️ Checking for typescript compilation errors");
        projectPaths.forEach(function (projectPath) {
            var _a, _b;
            var tscArgs = ["--noEmit", "--pretty"];
            var options = {
                cwd: projectPath
            };
            spawnSync("yarn", ["install"], options);
            var output = spawnSync("node_modules/.bin/tsc", tscArgs, options);
            if (output.status !== 0) {
                compileErrors_1.push({
                    projectPath: projectPath,
                    stdout: (_a = output.stdout) === null || _a === void 0 ? void 0 : _a.toString(),
                    stderr: (_b = output.stderr) === null || _b === void 0 ? void 0 : _b.toString()
                });
            }
        });
        return compileErrors_1;
    }
    catch (err) {
        core.setFailed("ERROR: Failed to run childProcess");
        throw new Error(err);
    }
}
function logErrors(compileErrors) {
    if (compileErrors.length) {
        core.setFailed("\u274C Failed to compile " + compileErrors.length + " project" + (compileErrors.length > 1 ? "s" : ""));
        compileErrors.forEach(function (c) {
            console.log("------------------------");
            if (c.stdout) {
                log("Project '" + c.projectPath + "'");
                core.setFailed(c.stdout);
            }
            if (c.stderr) {
                core.setFailed(c.stderr);
            }
        });
        process.exit();
    }
    else {
        log("\u2714\uFE0F Successfully compiled all projects");
    }
}
