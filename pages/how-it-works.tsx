/* eslint-disable no-nested-ternary */
import React from 'react';
import { useTranslation } from 'next-i18next';
import { NextPageContext } from 'next';
import Head from 'next/head';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import styled, { useTheme } from 'styled-components';
import Link from 'next/link';

import { NextPageWithLayout } from './_app';

import HomeLayout from '../components/templates/HomeLayout';
import Headline from '../components/atoms/Headline';
import Text from '../components/atoms/Text';
import assets from '../constants/assets';
import Button from '../components/atoms/Button';
import { useAppSelector } from '../redux-store/store';
import { SUPPORTED_LANGUAGES } from '../constants/general';
import { useAppState } from '../contexts/appStateContext';

export const HowItWorks = () => {
  const { t } = useTranslation('page-HowItWorks');
  const theme = useTheme();
  const { resizeMode } = useAppState();
  const user = useAppSelector((state) => state.user);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );
  const isTablet = ['tablet'].includes(resizeMode);

  return (
    <>
      <Head>
        <title>{t('meta.title')}</title>
        <meta name='description' content={t('meta.description')} />
        <meta property='og:title' content={t('meta.title')} />
        <meta property='og:description' content={t('meta.description')} />
        <meta property='og:image' content={assets.openGraphImage.common} />
      </Head>
      <Container>
        <IntroSection>
          <IntroContent>
            <IntroHeadline variant={1}>{t('intro.title')}</IntroHeadline>
            <IntroText variant={4} weight={600}>
              {t('intro.text')}
            </IntroText>
          </IntroContent>
          <QuestionMarkVisual muted autoPlay playsInline>
            <source
              src={
                theme.name === 'light'
                  ? assets.info.lightQuestionMarkVideo
                  : assets.info.darkQuestionMarkVideo
              }
              type='video/mp4'
            />
          </QuestionMarkVisual>
        </IntroSection>
        <Content>
          <Section>
            <SectionImage
              src={
                theme.name === 'light'
                  ? assets.common.ac.lightAcAnimated()
                  : assets.common.ac.darkAcAnimated()
              }
              alt='bids'
              // Quick fix for animated image alignment
              style={
                // eslint-disable-next-line no-nested-ternary
                isMobile
                  ? { top: -10, right: -5, position: 'relative' }
                  : isTablet
                  ? { top: -35, right: -25, position: 'relative' }
                  : { top: -45, right: -35, position: 'relative' }
              }
            />
            <SectionContent>
              <Headline variant={3}>{t('events.title')}</Headline>
              <SectionText variant={5}>{t('events.text')}</SectionText>
            </SectionContent>
          </Section>

          <Section>
            <SectionImage
              src={
                theme.name === 'light'
                  ? assets.common.mc.lightMcAnimated()
                  : assets.common.mc.darkMcAnimated()
              }
              alt='superpolls'
              // Quick fix for animated image alignment
              style={
                // eslint-disable-next-line no-nested-ternary
                isMobile
                  ? { top: -10, position: 'relative' }
                  : isTablet
                  ? { top: -15, position: 'relative' }
                  : { top: -30, position: 'relative' }
              }
            />
            <SectionContent>
              <Headline variant={3}>{t('superpolls.title')}</Headline>
              <SectionText variant={5}>{t('superpolls.text')}</SectionText>
            </SectionContent>
          </Section>

          {/* <Section>
            <SectionImage
              src={
                theme.name === 'light'
                  ? assets.creation.lightCfAnimated()
                  : assets.creation.darkCfAnimated()
              }
              alt='goals'
              // Quick fix for animated image alignment
              style={
                // eslint-disable-next-line no-nested-ternary
                isMobile
                  ? { top: -10, position: 'relative' }
                  : isTablet
                  ? { top: -15, position: 'relative' }
                  : { top: -30, position: 'relative' }
              }
            />
            <SectionContent>
              <Headline variant={3}>{t('goals.title')}</Headline>
              <SectionText variant={5}>{t('goals.text')}</SectionText>
            </SectionContent>
            </Section> */}

          <ControlsContainer>
            <Link href='/'>
              <a>
                <SButton view='primaryGrad'>{t('exploreButton')}</SButton>
              </a>
            </Link>
            <Link
              href={
                !user.loggedIn
                  ? 'sign-up'
                  : !user.userData?.options?.isCreator
                  ? '/creator-onboarding'
                  : '/creation'
              }
            >
              <a>
                <SButton view='secondary'>{t('createButton')}</SButton>
              </a>
            </Link>
          </ControlsContainer>
        </Content>
      </Container>
    </>
  );
};

(HowItWorks as NextPageWithLayout).getLayout = (page: React.ReactElement) => (
  <HomeLayout>{page}</HomeLayout>
);

export default HowItWorks;

export const getServerSideProps = async (context: NextPageContext) => {
  context.res?.setHeader(
    'Cache-Control',
    'public, s-maxage=30, stale-while-revalidate=35'
  );
  const translationContext = await serverSideTranslations(
    context.locale!!,
    ['common', 'page-HowItWorks'],
    null,
    SUPPORTED_LANGUAGES
  );

  return {
    props: {
      ...translationContext,
    },
  };
};

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 20px;

  ${({ theme }) => theme.media.tablet} {
    padding-top: 38px;
    padding-left: 20px;
    padding-right: 20px;
  }

  ${({ theme }) => theme.media.laptop} {
    padding-top: 40px;
  }
`;

const Content = styled.div`
  width: 100%;
  max-width: 990px;
`;

const IntroSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 990px;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 60px;

  ${({ theme }) => theme.media.tablet} {
    margin-bottom: 100px;
  }
`;

const IntroContent = styled.div`
  width: min-content;
  text-align: center;
  margin-bottom: 20px;

  ${({ theme }) => theme.media.tablet} {
    margin-bottom: 60px;
  }
  ${({ theme }) => theme.media.laptop} {
    margin-bottom: 80px;
  }
`;

const IntroHeadline = styled(Headline)`
  white-space: nowrap;
`;

const IntroText = styled(Text)`
  margin-left: 16px;
  margin-right: 16px;
  margin-top: 8px;
  color: ${({ theme }) => theme.colorsThemed.text.secondary};

  ${({ theme }) => theme.media.tablet} {
    margin-left: 30px;
    margin-right: 30px;
    margin-top: 16px;
  }

  ${({ theme }) => theme.media.laptop} {
    margin-top: 24px;
  }
`;

const QuestionMarkVisual = styled('video')`
  position: relative;
  display: flex;
  width: 100%;
  object-fit: contain;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 60px;

  ${({ theme }) => theme.media.tablet} {
    flex-direction: row;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 100px;

    &:nth-child(even) {
      flex-direction: row-reverse;
      margin-left: 36px;
    }
  }

  ${({ theme }) => theme.media.laptop} {
    gap: 32px;

    &:nth-child(odd) {
      margin-left: 20px;
    }
    &:nth-child(even) {
      margin-right: 20px;
    }
  }
`;

const SectionImage = styled.img`
  display: flex;
  object-fit: contain;
  margin: auto;
  width: 160px;
  height: 160px;
  margin-bottom: 40px;

  ${({ theme }) => theme.media.tablet} {
    margin: 0%;
    width: 200px;
    height: 200px;
    margin-bottom: 0px;
  }

  ${({ theme }) => theme.media.laptop} {
    width: 250px;
    height: 250px;
  }
`;

const SectionContent = styled.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;

  ${({ theme }) => theme.media.tablet} {
    text-align: left;
    max-width: 607px;
  }
`;

const SectionText = styled(Text)`
  margin: 24px 0;
  font-weight: 700;
  color: ${({ theme }) => theme.colorsThemed.text.secondary};

  ${({ theme }) => theme.media.laptop} {
    margin: 16px 0;
    text-align: left;
  }
`;

const ControlsContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 34px;

  ${({ theme }) => theme.media.tablet} {
    flex-direction: row;
    justify-content: center;
    margin-bottom: 24px;
    gap: 16px;
  }

  ${({ theme }) => theme.media.laptop} {
    margin-bottom: 44px;
    gap: 32px;
  }
`;

const SButton = styled(Button)`
  width: 100%;
  margin-bottom: 16px;

  ${({ theme }) => theme.media.tablet} {
    width: 164px;
    margin-bottom: 0px;
  }

  ${({ theme }) => theme.media.laptop} {
    width: 224px;
  }
`;
