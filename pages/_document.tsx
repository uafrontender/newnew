import React from 'react';
import Document, {
  Html,
  Head,
  Main,
  NextScript,
  DocumentContext,
  DocumentInitialProps,
} from 'next/document';
import { ServerStyleSheet } from 'styled-components';

export default class MyDocument extends Document {
  static async getInitialProps(
    ctx: DocumentContext
  ): Promise<DocumentInitialProps> {
    const sheet = new ServerStyleSheet();
    const originalRenderPage = ctx.renderPage;

    try {
      ctx.renderPage = () =>
        originalRenderPage({
          // eslint-disable-next-line react/jsx-props-no-spreading
          enhanceApp: (App) => (props) =>
            sheet.collectStyles(<App {...props} />),
        });

      const initialProps = await Document.getInitialProps(ctx);
      return {
        ...initialProps,
        styles: (
          <>
            {initialProps.styles}
            {sheet.getStyleElement()}
          </>
        ) as any,
      };
    } finally {
      sheet.seal();
    }
  }

  render() {
    return (
      <Html translate='no'>
        <Head>
          <meta name='google' content='notranslate' />
          {/* Fonts */}
          <link href='/fonts/font-gilroy.css' rel='stylesheet' />
          <link
            rel='preload'
            href='/fonts/Radomir-Tinkov-Gilroy-Medium.otf'
            as='font'
            type='font/otf'
            crossOrigin='anonymous'
          />
          <link
            rel='preload'
            href='/fonts/Radomir-Tinkov-Gilroy-SemiBold.otf'
            as='font'
            type='font/otf'
            crossOrigin='anonymous'
          />
          <link
            rel='preload'
            href='/fonts/Radomir-Tinkov-Gilroy-Bold.otf'
            as='font'
            type='font/otf'
            crossOrigin='anonymous'
          />
          <script
            async
            src={`https://widget.usersnap.com/global/load/${process.env.NEXT_PUBLIC_USERSNAP_GLOBAL_API_KEY}?onload=onUsersnapCXLoad`}
          />
          <script
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{
              __html: `
                window.onUsersnapCXLoad = function(api) {
                  // store the Usersnap global api on the window, if case you want to use it in other contexts
                  window.Usersnap = api;
                  api.init();
              }
              `,
            }}
          />
        </Head>
        <body>
          <Main />
          <NextScript />
          <div id='modal-root' />
        </body>
      </Html>
    );
  }
}
