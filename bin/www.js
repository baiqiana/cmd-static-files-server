#! /usr/bin/env node

const { program } = require("commander");

let options = {
  "-p, --port <port>": {
    description: "init server port",
    example: "bqserve -p 3000",
    default: 3000,
  },
  "-d, --directory <dir>": {
    description: "init server direcotry",
    example: "bqserve -d d:",
  },
};

function formatConfig(configs, cb) {
  Object.entries(configs).forEach(([key, val]) => {
    cb(key, val);
  });
}

formatConfig(options, (cmd, val) => {
  program.option(cmd, val.description, val.default);
});

program.on("--help", () => {
  console.log("Examples");
  formatConfig(options, (cmd, val) => {
    console.log(val.example);
  });
});

program.name("bqserve");
let version = require("../package.json").version;
program.version(version);

// console.log(program.opts())
program.parse(process.argv);
let cmdConfig = program.opts();

let Server = require("../main.js");
new Server(cmdConfig).start();
