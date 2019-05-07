import React from 'react';
import parse from 'html-react-parser';

import {HelmetData} from 'react-helmet'

export type HTMLProps = {
  helmet?: HelmetData,
  children: string,
  scripts?: string,
  initialState?: Object
}

const HTML = ({helmet, children, scripts, initialState}: HTMLProps) => {
  const isBrowser = !!process.env.BROWSER;
  if (isBrowser) {
    throw new Error('HTML component should not be executed on client!');
  }

  const htmlAttrs = helmet ? helmet.htmlAttributes.toComponent() : null;
  const bodyAttrs = helmet ? helmet.bodyAttributes.toComponent() : null;
  const scriptTags = scripts ? parse(scripts) : null;
  return (
    <html {...htmlAttrs}>
      <head>
        {helmet && helmet.title.toComponent()}
        {helmet && helmet.meta.toComponent()}
        {helmet && helmet.link.toComponent()}
        <meta name="viewport" content="width=device-width, initial-scale=1.0"></meta>
        <link href="https://fonts.googleapis.com/css?family=Lato|Roboto" rel="stylesheet"></link>
        {initialState && (
          <script
            type="text/javascript"
            dangerouslySetInnerHTML={{__html: `window.__INITIAL_STATE__=${JSON.stringify(
              initialState
            ).replace(/</g, '\\u003c')}`}}
          />
        )}
      </head>
      <body {...bodyAttrs}>
        <main id="app">{children}</main>
        {scriptTags}
      </body>
    </html>
  );
};

export default HTML;
