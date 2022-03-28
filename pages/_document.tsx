import React from 'react';
import Document, {
  Html, Head, Main, NextScript, DocumentContext, DocumentInitialProps,
} from 'next/document';
import { ServerStyleSheet } from 'styled-components';

export default class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext): Promise<DocumentInitialProps> {
    const sheet = new ServerStyleSheet();
    const originalRenderPage = ctx.renderPage;

    try {
      ctx.renderPage = () => originalRenderPage({
        // eslint-disable-next-line react/jsx-props-no-spreading
        enhanceApp: (App) => (props) => sheet.collectStyles(<App {...props} />),
      });

      const initialProps = await Document.getInitialProps(ctx);
      return {
        ...initialProps,
        styles: (
          <>
            {initialProps.styles}
            {sheet.getStyleElement()}
          </>
        ),
      };
    } finally {
      sheet.seal();
    }
  }

  render() {
    return (
      <Html translate="no">
        <Head>
          <link href="/fonts/font-gilroy.css" rel="stylesheet" />
          <link rel="preload" href="/fonts/Radomir Tinkov - Gilroy-Medium.otf" as="font" type="font/otf" crossOrigin="anonymous" />
          <link rel="preload" href="/fonts/Radomir Tinkov - Gilroy-SemiBold.otf" as="font" type="font/otf" crossOrigin="anonymous" />
          <link rel="preload" href="/fonts/Radomir Tinkov - Gilroy-Bold.otf" as="font" type="font/otf" crossOrigin="anonymous" />
          {/* Preload assets */}
            {/* Sign up screen hero */}
              {/* Dark */}
          <link rel="preload" href="/images/signup/hero-visual/Dark/Sign-In-Hold-Frame.png" as="image" crossOrigin="anonymous" />
          <link rel="preload" href="/images/signup/hero-visual/Dark/sign-in-intro-fade.webp" as="image" crossOrigin="anonymous" />
          <link rel="preload" href="/images/signup/hero-visual/Dark/sign-in-outro.webp" as="image" crossOrigin="anonymous" />
              {/* Light */}
          <link rel="preload" href="/images/signup/hero-visual/Light/Sign-In-Hold-Frame-Light.png" as="image" crossOrigin="anonymous" />
          <link rel="preload" href="/images/signup/hero-visual/Light/sign-in-intro-fade-light.webp" as="image" crossOrigin="anonymous" />
          <link rel="preload" href="/images/signup/hero-visual/Light/sign-in-outro-light.webp" as="image" crossOrigin="anonymous" />
            {/* Email verification screen */}
            {/* Landing page */}
              {/* Dark */}
              {/* NB! Video is not supported, so preload placeholders */}
          {/* <link rel="preload" href="/images/home/Landing-Page-Dark.mp4" as="video" crossOrigin="anonymous" /> */}
          <link rel="preload" href="/images/home/Landing-Page-Hold-Frame-Light.webp" as="image" crossOrigin="anonymous" />
              {/* Light */}
          <link rel="preload" href="/images/home/Landing-Page-Hold-Frame-Dark.webp" as="image" crossOrigin="anonymous" />
            {/* Creation screen */}
          <link rel="preload" href="/images/creation/AC-static.png" as="image" crossOrigin="anonymous" />
          <link rel="preload" href="/images/creation/MC-static.png" as="image" crossOrigin="anonymous" />
          <link rel="preload" href="/images/creation/CF-static.png" as="image" crossOrigin="anonymous" />
          <link rel="preload" href="/images/creation/AC.webp" as="image" crossOrigin="anonymous" />
          <link rel="preload" href="/images/creation/MC.webp" as="image" crossOrigin="anonymous" />
          <link rel="preload" href="/images/creation/CF.webp" as="image" crossOrigin="anonymous" />

        </Head>
        <body>
          <Main />
          <NextScript />
          <div id="modal-root" />
        </body>
      </Html>
    );
  }
}
