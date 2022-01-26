/* eslint-disable react/no-danger */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, {
  useEffect,
  useRef,
  useState,
} from 'react';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';

import { useAppSelector } from '../../../redux-store/store';

import mockToS from './mockToS';
import Headline from '../../atoms/Headline';
import Caption from '../../atoms/Caption';
import Text from '../../atoms/Text';
import OnboardingTosSubmitForm from './OnboardingTosSubmitForm';

interface IOnboardingSectionTos {
  handleGoToNext: () => void;
}

const OnboardingSectionTos: React.FunctionComponent<IOnboardingSectionTos> = ({
  handleGoToNext,
}) => {
  const { t } = useTranslation('creator-onboarding');
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);

  const [shadowTop, setShadowTop] = useState(false);
  const [shadowBottom, setShadowBottom] = useState(!isMobile);

  const [hasRead, setHasRead] = useState(false);
  const [hasReadDesktop, setHasReadDesktop] = useState(false);

  const containerRef = useRef<HTMLDivElement>();

  useEffect(() => {
    const handleScroll = () => {
      const isScrolledToBottom = (
        (document.body.scrollHeight - (window.innerHeight + window.pageYOffset)) < 10
      );

      if (isScrolledToBottom) {
        setHasRead(true);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolledToTop = (containerRef.current?.scrollTop ?? 0) < 10;
      const isScrolledToBottom = (
        (containerRef.current?.scrollTop ?? 0) + (containerRef.current?.clientHeight ?? 0))
        >= (containerRef.current?.scrollHeight ?? 0);

      if (!isScrolledToTop) {
        setShadowTop(true);
      } else {
        setShadowTop(false);
      }

      if (!isScrolledToBottom) {
        setShadowBottom(true);
      } else {
        setShadowBottom(false);
        setHasReadDesktop(true);
      }
    };

    containerRef.current?.addEventListener('scroll', handleScroll);

    return () => containerRef.current?.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <SHeading
        variant={5}
      >
        {t('TosSection.heading')}
      </SHeading>
      <SSubheading
        variant={1}
        weight={600}
      >
        {t('TosSection.subheading')}
      </SSubheading>
      <SContainer
        ref={(el) => {
          containerRef.current = el!!;
        }}
      >
        {
          !isMobile && (
            <SShadowTop
              style={{
                opacity: shadowTop ? 1 : 0,
              }}
            />
          )
        }
        {
          !isMobile && (
            <SShadowBottom
              style={{
                opacity: shadowBottom ? 1 : 0,
              }}
            />
          )
        }
        <STosText
          dangerouslySetInnerHTML={{
            __html: mockToS,
          }}
        />
      </SContainer>
      <OnboardingTosSubmitForm
        hasScrolledDown={hasRead}
        hasScrolledDownDesktop={hasReadDesktop}
        handleGoToNext={handleGoToNext}
      />
    </>
  );
};

export default OnboardingSectionTos;

const SContainer = styled.div`
  padding-left: 16px;
  padding-right: 16px;

  padding-bottom: 88px;

  ${({ theme }) => theme.media.tablet} {
    padding-bottom: 0;

    height: calc(100vh - 102px - 88px - 24px - 92px);
    overflow-y: scroll;

    padding-left: 152px;
    padding-right: 152px;
  }

  ${({ theme }) => theme.media.laptop} {
    height: calc(100vh - 118px - 88px - 24px - 100px);

    padding-left: 0;
    padding-right: 104px;
  }
`;

const SHeading = styled(Headline)`
  padding-right: 32px;

  padding-left: 16px;

  ${({ theme }) => theme.media.tablet} {
    padding-left: 152px;
  }

  ${({ theme }) => theme.media.laptop} {
    padding-left: 0;
  }
`;

const SSubheading = styled(Caption)`
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};
  font-size: 14px;

  margin-top: 4px;
  margin-bottom: 24px;

  padding-left: 16px;

  ${({ theme }) => theme.media.tablet} {
    margin-top: 8px;
    margin-bottom: 32px;

    padding-left: 152px;
  }

  ${({ theme }) => theme.media.laptop} {
    margin-bottom: 40px;

    padding-left: 0;
  }
`;

const SShadowTop = styled.div`
  position: absolute;
  top: 192px;
  left: 0;

  width: 100%;
  height: 0px;

  z-index: 1;
  box-shadow:
    0px 0px 32px 40px ${({ theme }) => (theme.name === 'dark' ? 'rgba(11, 10, 19, 1)' : '#ffffff')};
  ;
  clip-path: inset(0px 0px -100px 0px);

  transition: linear .2s;

  ${({ theme }) => theme.media.laptop} {
    top: 200px;
  }
`;

const SShadowBottom = styled.div`
  position: absolute;
  bottom: 100px;
  left: 0;

  width: 100%;
  height: 0px;

  z-index: 1;
  box-shadow:
    0px 0px 32px 40px ${({ theme }) => (theme.name === 'dark' ? 'rgba(11, 10, 19, 1)' : '#ffffff')};
  ;
  clip-path: inset(-100px 0px 0px 0px);
  transition: linear .2s;

  ${({ theme }) => theme.media.laptop} {
    bottom: 118px;
  }
`;

const STosText = styled.div`
  p {
    margin-bottom: 16px;
  }
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  color: ${({ theme }) => theme.colorsThemed.text.primary};


`;
