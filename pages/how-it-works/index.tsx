import React from 'react';
import { useTranslation } from 'next-i18next';
import { NextPageContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import styled from 'styled-components';

import { NextPageWithLayout } from '../_app';

import HomeLayout from '../../components/templates/HomeLayout';
import Headline from '../../components/atoms/Headline';
import Text from '../../components/atoms/Text';
import assets from '../../constants/assets';
import Button from '../../components/atoms/Button';
import { useAppSelector } from '../../redux-store/store';
import QuestionMarkVisual from './QuestionMarkVisual';

export const HowItWorks = () => {
  const { t } = useTranslation('how-it-works');
  const router = useRouter();
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );

  const isTablet = ['tablet'].includes(resizeMode);

  return (
    <Container>
      <Content>
        <IntroSection>
          <IntroContent>
            <IntroHeadline variant={1}>{t('intro.title')}</IntroHeadline>
            <IntroText variant={4} weight={600}>
              {t('intro.text')}
            </IntroText>
          </IntroContent>
          <QuestionMarkVisual alt='How it works' />
        </IntroSection>

        <Section>
          <SectionImage
            src={assets.creation.AcAnimated}
            alt='events'
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
            <SectionText variant={3}>{t('events.text')}</SectionText>
          </SectionContent>
        </Section>

        <Section reversed>
          <SectionImage
            src={assets.creation.McAnimated}
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
            <SectionText variant={3}>{t('superpolls.text')}</SectionText>
          </SectionContent>
        </Section>

        <Section>
          <SectionImage
            src={assets.creation.CfAnimated}
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
            <SectionText variant={3}>{t('goals.text')}</SectionText>
          </SectionContent>
        </Section>

        <ControlsContainer>
          <SButton
            onClick={() => {
              router.push('/');
            }}
          >
            {t('exploreButton')}
          </SButton>
          <SButton
            view='secondary'
            onClick={() => {
              router.push('/creation');
            }}
          >
            {t('creteButton')}
          </SButton>
        </ControlsContainer>
      </Content>
    </Container>
  );
};

(HowItWorks as NextPageWithLayout).getLayout = (page: React.ReactElement) => (
  <HomeLayout>{page}</HomeLayout>
);

export default HowItWorks;

export const getServerSideProps = async (context: NextPageContext) => {
  const translationContext = await serverSideTranslations(context.locale!!, [
    'common',
    'how-it-works',
  ]);

  return {
    props: {
      ...translationContext,
    },
  };
};

const Container = styled('div')`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 20px ${({ theme }) => theme.media.tablet} {
    padding-top: 38px;
    padding-left: 20px;
    padding-right: 20px;
  }

  ${({ theme }) => theme.media.laptop} {
    padding-top: 40px;
  }
`;

const Content = styled('div')`
  width: 100%;
  max-width: 990px;
`;

const IntroSection = styled('div')`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 60px;

  ${({ theme }) => theme.media.tablet} {
    margin-bottom: 100px;
  }
`;

const IntroContent = styled('div')`
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

  ${({ theme }) => theme.media.tablet} {
    margin-left: 30px;
    margin-right: 30px;
    margin-top: 16px;
  }

  ${({ theme }) => theme.media.laptop} {
    margin-top: 24px;
  }
`;

const Section = styled('div')<{ reversed?: boolean }>`
  display: flex;
  flex-direction: column;
  margin-bottom: 60px;

  ${({ theme }) => theme.media.tablet} {
    flex-direction: ${({ reversed }) => (reversed ? 'row-reverse' : 'row')};
    margin-left: ${({ reversed }) => (reversed ? '36px' : '0px')};
    margin-bottom: 120px;
    gap: 46px;
  }

  ${({ theme }) => theme.media.laptop} {
    gap: 116px;
    margin-left: ${({ reversed }) => (reversed ? '0px' : '20px')};
    margin-right: ${({ reversed }) => (reversed ? '20px' : '0px')};
  }
`;

const SectionImage = styled('img')`
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

const SectionContent = styled('div')`
  text-align: center;

  ${({ theme }) => theme.media.tablet} {
    text-align: left;
  }
`;

const SectionText = styled(Text)`
  margin-top: 24px;

  ${({ theme }) => theme.media.laptop} {
    margin-top: 16px;
    text-align: left;
  }
`;

const ControlsContainer = styled('div')`
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
