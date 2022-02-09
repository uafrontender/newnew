import React, {
  useEffect, useState,
} from 'react';
import styled from 'styled-components';
import { newnewapi } from 'newnew-api';
import { useTranslation } from 'next-i18next';

import { useAppSelector } from '../../../redux-store/store';
import { fetchSetStripeLinkCreator, getMyOnboardingState } from '../../../api/endpoints/user';

import Headline from '../../atoms/Headline';
import Navigation from '../../molecules/creator/Navigation';
import Button from '../../atoms/Button';
import InlineSvg from '../../atoms/InlineSVG';
import Lottie from '../../atoms/Lottie';

import StripeLogo from '../../../public/images/svg/StripeLogo.svg';
import StripeLogoS from '../../../public/images/svg/icons/filled/StripeLogoS.svg';
import loadingAnimation from '../../../public/animations/logo-loading-blue.json';

export const GetPaid = () => {
  const { t } = useTranslation('creator');
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);

  const [onboardingState, setOnboardingState] = useState<newnewapi.GetMyOnboardingStateResponse>();
  const [isLoading, setIsLoading] = useState(true);

  const handleRedirectToStripesetup = async () => {
    try {
      const payload = new newnewapi.SetupStripeCreatorAccountRequest({
        refreshUrl: window.location.href,
        returnUrl: window.location.href,
      });

      const res = await fetchSetStripeLinkCreator(payload);

      if (!res.data || res.error) throw new Error(res.error?.message ?? 'Request failed');

      const url = res.data.setupUrl;
      window.location.href = url;
    } catch (err) {
      console.error(err);
    }
  };

  const handleRedirectToStripeAccount = () => {};

  const handleRedirectToStripeUpdate = () => {};

  useEffect(() => {
    async function fetchOnboardingState() {
      try {
        const payload = new newnewapi.EmptyRequest({});
        const res = await getMyOnboardingState(payload);

        if (res.data) {
          setOnboardingState(res.data);
        }
        setIsLoading(false);
      } catch (err) {
        console.error(err);
      }
    }

    fetchOnboardingState();
  }, []);

  return (
    <SContainer>
      {!isMobile && <Navigation />}
      <SContent>
        <STitleBlock>
          <STitle variant={4}>
            {t('getPaid.title')}
          </STitle>
        </STitleBlock>
        {!isLoading ? (
            <>
            {!onboardingState?.isCreatorConnectedToStripe && (
              <>
                <SHeadline
                  variant={5}
                >
                  <span>
                    {t('getPaid.title-set-up-stripe')}
                  </span>
                  <InlineSvg
                    svg={StripeLogo}
                    width="80px"
                  />
                </SHeadline>
                <SUl>
                  <li>
                    {t('getPaid.bullets.1')}
                  </li>
                  <li>
                    {t('getPaid.bullets.2')}
                  </li>
                  <li>
                    {t('getPaid.bullets.3')}
                  </li>
                </SUl>
                <SButton
                  view="primaryGrad"
                  onClick={() => handleRedirectToStripesetup()}
                >
                  <InlineSvg
                    svg={StripeLogoS}
                    width="24px"
                    height="24px"
                  />
                  <span>
                    {t('getPaid.requestSetupLinkBtn')}
                  </span>
                </SButton>
              </>
            )}
            {onboardingState?.isCreatorConnectedToStripe && (
              <>
                <SHeadline
                  variant={5}
                >
                  <InlineSvg
                    svg={StripeLogo}
                    width="80px"
                  />
                  <span>
                    {t('getPaid.title-stripe-active')}
                  </span>
                </SHeadline>
                <div
                  style={{
                    display: 'flex',
                    gap: '16px',
                    flexWrap: 'wrap',
                  }}
                >
                  <SButton
                    view="primaryGrad"
                    onClick={() => handleRedirectToStripeAccount()}
                  >
                    <InlineSvg
                      svg={StripeLogoS}
                      width="24px"
                      height="24px"
                    />
                    <span>
                      {t('getPaid.getPaidBtn')}
                    </span>
                  </SButton>
                  <SButton
                    view="primaryGrad"
                    onClick={() => handleRedirectToStripeUpdate()}
                  >
                    <InlineSvg
                      svg={StripeLogoS}
                      width="24px"
                      height="24px"
                    />
                    <span>
                      {t('getPaid.updateBtn')}
                    </span>
                  </SButton>
                </div>
              </>
            )}
            </>
          ) : (
            <Lottie
              width={64}
              height={64}
              options={{
                loop: true,
                autoplay: true,
                animationData: loadingAnimation,
              }}
            />
          )}
      </SContent>
    </SContainer>
  );
};

export default GetPaid;

const SContainer = styled.div`
  position: relative;
  margin-top: -16px;

  ${(props) => props.theme.media.tablet} {
    margin-top: unset;
  }

  ${(props) => props.theme.media.laptop} {
    margin-top: -40px;
    margin-bottom: -40px;
  }
`;

const SContent = styled.div`
  min-height: calc(100vh - 120px);

  ${(props) => props.theme.media.tablet} {
    margin-left: 180px;
  }

  ${(props) => props.theme.media.laptop} {
    width: calc(100vw - 320px);
    padding: 40px 32px;
    background: ${(props) => props.theme.colorsThemed.background.tertiary};
    margin-left: 224px;
    border-top-left-radius: 24px;
  }
`;

const STitle = styled(Headline)``;

const STitleBlock = styled.section`
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  flex-direction: row;
  justify-content: space-between;
`;

const SHeadline = styled(Headline)`
  display: flex;
  align-items: flex-start;

  margin-bottom: 40px;

  span {
    position: relative;
    top: 3px;
  }
`;

const SUl = styled.ul`
  padding-left: 16px;

  margin-bottom: 24px;
  li {
    font-weight: 600;
    font-size: 14px;
    line-height: 20px;
    color: ${({ theme }) => theme.colorsThemed.text.primary};

    margin-bottom: 8px;
  }
`;

const SButton = styled(Button)`

  margin-bottom: 24px;

  width: 100%;

  ${({ theme }) => theme.media.tablet} {
    width: 256px;
  }

  span {
    display: flex;

    span {
      position: relative;
      top: 1px;
    }
  }
`;
