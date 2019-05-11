import path from 'path';
import {Server} from 'http';
import express, {Express} from 'express';
import chalk from 'chalk';

import renderApp, {GetAppFn} from '../middlewares/render-app';
import HTML, {HTMLProps} from '../components/html';

const originalDebug = console.debug;
const originalLog = console.log;
const originalError = console.error;

const timestamp = () => {
  return new Date().toISOString()
}

const error = (...args) => {
  originalError(chalk.red(...args));
};

const debug = (...args) => {
  if (
    String(process.env.NODE_ENV) === 'development' ||
    String(process.env.APP_ENV) !== 'production'
  ) {
    originalDebug(`${timestamp()} ${chalk.blueBright.bgBlack('Debug:')} ${chalk.gray(...args)}`);
  }
};

console.debug = debug;
console.error = error;

export type IsoServerOpts = {
  html?: (HTMLProps) => JSX.Element;
  port?: number;
  debug?: boolean;
};

class IsoServer {
  defaultOpts: IsoServerOpts = {
    html: HTML,
    port: process.env.PORT ? Number(process.env.PORT) : 3000,
    debug: false,
  };
  opts: IsoServerOpts;
  getAppFn: GetAppFn;
  middlewares: any[];
  app?: Express;
  server?: Server;

  constructor(getApp: GetAppFn, opts: IsoServerOpts = {}) {
    if (!getApp) {
      throw new Error('Must have an app selector');
    }

    this._listenCallback = this._listenCallback.bind(this);
    this._log = this._log.bind(this);
    this._registerMiddleware = this._registerMiddleware.bind(this);
    this._registerCommonMiddleware = this._registerCommonMiddleware.bind(this);

    this.opts = {
      ...this.defaultOpts,
      ...opts,
    };
    this.getAppFn = getApp;
    this.middlewares = [];
  }

  use(...args) {
    this.middlewares.push([...args]);
  }

  start() {
    this.app = express();

    this.middlewares.forEach(this._registerMiddleware);

    this._registerCommonMiddleware();

    this.server = this.app.listen(this.opts.port, this._listenCallback);

    return this.server;
  }

  _registerMiddleware(middleware) {
    if (this.app) {
      this._debug(`Registering middleware`, middleware);
      this.app.use(...middleware);
    }
  }

  _registerCommonMiddleware() {
    if (this.app) {
      this._debug('Registering common middlewares');
      this.app.use(this._log);
      this.app.use('/static', express.static(path.join(__dirname, '/static')));
      this.app.use(express.static(path.join(__dirname, 'public')));
      this.app.use(renderApp(this.getAppFn, this.opts.html));
    }
  }

  _log(req, res, next) {
    const start = new Date().getTime();

    res.on('finish', () => {
      const time = new Date().getTime() - start;
      console.log(
        `${req.method} ${req.url} -> ${this._formatStatus(
          res.statusCode
        )} (${time}ms)`
      );
    });

    next();
  }

  _formatStatus(status) {
    if (status >= 200 && status < 300) {
      return chalk.green(status);
    }
    if (status >= 300 && status < 400) {
      return chalk.yellowBright(status);
    }
    if (status >= 400 && status < 500) {
      return chalk.yellow(status);
    }
    return chalk.red(status);
  }

  _listenCallback() {
    console.log(
      chalk.green(`Isomorphic Server Listening on port ${this.opts.port}`)
    );
    this._debug(
      `Server running with ${this.middlewares.length} custom middlewares`
    );
  }

  _debug(...args) {
    if (this.opts.debug) {
      console.debug(chalk.gray(...args));
    }
  }
}

export default IsoServer;
