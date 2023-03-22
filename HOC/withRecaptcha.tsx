import { useRouter } from 'next/router';
import React from 'react';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

import ReCaptchaBadgeModal from '../components/organisms/ReCaptchaBadgeModal';

const withRecaptcaProvider =
  (PageComponent: React.FunctionComponent) => (props: any) => {
    const { locale } = useRouter();

    return (
      <GoogleReCaptchaProvider
        reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? ''}
        language={locale}
        scriptProps={{
          async: false,
          defer: false,
          appendTo: 'head',
          nonce: undefined,
        }}
        container={{
          element: 'recaptchaBadge',
          parameters: {
            badge: 'bottomleft',
            theme: 'dark',
          },
        }}
      >
        <PageComponent {...props} />
        <ReCaptchaBadgeModal />
      </GoogleReCaptchaProvider>
    );
  };

export default withRecaptcaProvider;
