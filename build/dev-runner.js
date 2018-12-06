const { spawn } = require("child_process");
const electron = require("electron");
const chalk = require("chalk");
const path = require("path");
const fs = require("fs");

let electronProcess = null;
let vueProcess = null;
let electronRestart = false;

/**
 * 监听electron文件变化，重启app
 */
function watchFile() {
    fs.watch(
        path.join(__dirname, "../electron"),
        {
            recursive: true
        },
        function (eventType, filename) {
            electronRestart = true;
            if (electronProcess && electronProcess.pid) {
                process.kill(electronProcess.pid);
            }
            electronProcess = null;
            console.log(chalk.green(eventType + ":" + filename));
            startElectron();
            console.log(chalk.green("electron restart"));
            setTimeout(() => {
                electronRestart = false;
            }, 5000);
        }
    );
}

function startVue() {
    return new Promise(resolove => {
        vueProcess = spawn("yarn", ["serve"]);
        vueProcess.stdout.on("data", data => {
            let str = data.toString();
            if (str.includes("running")) {
                resolove();
            }
            console.log(chalk.green(str));
        });
        vueProcess.stderr.on("data", data => {
            let str = data.toString();
            console.log(chalk.red(str));
        });

        vueProcess.on("close", () => {
            process.exit();
        });
    });
}
function startElectron() {
    electronProcess = spawn(
        electron,
        [path.join(__dirname, "../electron/main.js")],
        {
            env: {
                NODE_ENV: "development"
            }
        }
    );

    electronProcess.stdout.on("data", data => {
        console.log(chalk.green(data.toString()));
    });
    electronProcess.stderr.on("data", data => {
        console.log(chalk.red(data.toString()));
    });

    electronProcess.on("close", () => {
        if (!electronRestart) process.exit();
    });
}

function init() {
    watchFile();
    startVue().then(() => {
        startElectron();
    });
}
init();
