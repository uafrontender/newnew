import React from 'react';
import styled, { useTheme } from 'styled-components';
import ReCAPTCHA from 'react-google-recaptcha';

interface IReCaptcha2 {
  className?: string;
  onChange: (recaptchaToken: string | null) => void;
}
const ReCaptchaV2 = React.forwardRef(
  ({ className, onChange }: IReCaptcha2, ref: any) => {
    const theme = useTheme();

    return (
      <SRecaptchaWrapper className={className}>
        <ReCAPTCHA
          ref={ref}
          size='normal'
          theme={theme.name as 'dark' | 'light'}
          sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_V2_SITE_KEY ?? ''}
          onChange={onChange}
        />
      </SRecaptchaWrapper>
    );
  }
);

export default ReCaptchaV2;

const SRecaptchaWrapper = styled.div``;
