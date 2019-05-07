import fs from 'fs';
import path from 'path';
import React from 'react';
import ReactDOM from 'react-dom/server';
import Helmet from 'react-helmet';

import express from 'express';
import HTML from '../components/html';

export type GetAppResult = {
  app: string;
  initialState?: Object;
};

export type RouteContext = {
  action?: string;
  status: number;
  url?: string
};

export type GetAppFn = (req: express.Request, res: express.Response, context: RouteContext) => GetAppResult

export type GetAppProps = {
  req: express.Request;
  res: express.Response;
};

const renderApp = (getApp: GetAppFn, document = HTML) => async (req: express.Request, res: express.Response) => {
  const scripts = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
  const context: RouteContext = {
    status: 200,
  };
  const {app, initialState} = await getApp(req, res, context);
  const helmet = Helmet.renderStatic();
  const Document = document;
  const rendered = ReactDOM.renderToString(
    <Document helmet={helmet} scripts={scripts} initialState={initialState}>
      {app}
    </Document>
  );

  res.status(context.status);

  switch (context.action) {
    case 'REPLACE':
      return res.redirect(context.url);
    default:
      res.send(`<!DOCTYPE html>${rendered}`);
  }
};

export default renderApp;
