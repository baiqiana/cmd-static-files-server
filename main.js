const http = require("http");
const url = require("url");
const path = require("path");
const fs = require("fs").promises;
const mime = require("mime");
const ejs = require("ejs");
const { createReadStream } = require("fs");
const { promisify } = require("util");

function mergeConfig(config) {
  return {
    port: 1234,
    directory: process.cwd(),
    ...config,
  };
}

class Server {
  constructor(config) {
    this.config = mergeConfig(config);
  }

  start() {
    const server = http.createServer(this.serveHandle.bind(this));

    server.listen(this.config.port);
  }

  async serveHandle(req, res) {
    let { pathname } = url.parse(req.url);
    pathname = decodeURIComponent(pathname);
    let absPath = path.join(this.config.directory, pathname);

    try {
      let statObj = await fs.stat(absPath);
      if (statObj.isFile()) {
        this.fileHandle(req, res, absPath);
      } else if (statObj.isDirectory()) {
        let dirs = await fs.readdir(absPath);
        dirs = dirs.map((d) => {
          return {
            path: path.join(pathname, d),
            name: d,
          };
        });
        let renderFile = promisify(ejs.renderFile);

        let parentPath = path.dirname(pathname);

        let ret = await renderFile(path.resolve(__dirname, "./index.html"), {
          arr: dirs,
          parent: pathname === "/" ? false : true,
          parentPath,
          title: path.basename(absPath),
        });
        res.setHeader("Content-Type", "text/html;charset=utf-8");
        res.end(ret);
      }
    } catch (error) {
      this.errorHandle(req, res, error);
    }
  }

  fileHandle(req, res, path) {
    const mimeType = mime.getType(path);
    res.statusCode = 200;
    res.setHeader("Content-Type", mimeType + ";charset=utf-8");
    createReadStream(path).pipe(res);
  }

  errorHandle(req, res, error) {
    res.statusCode = 404;
    res.setHeader("Content-Type", "text/html;charset=utf-8");
    res.end("404 Not Found");
  }
}

module.exports = Server;
