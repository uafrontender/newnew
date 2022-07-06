/* eslint-disable no-nested-ternary */
import React from 'react';
import { useTranslation } from 'next-i18next';
import { NextPageContext } from 'next';
import Head from 'next/head';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import styled, { useTheme } from 'styled-components';
import { useRouter } from 'next/router';

import { NextPageWithLayout } from './_app';

import HomeLayout from '../components/templates/HomeLayout';
import Headline from '../components/atoms/Headline';
import Text from '../components/atoms/Text';
import assets from '../constants/assets';
// import { useAppSelector } from '../redux-store/store';
import GoBackButton from '../components/molecules/GoBackButton';

import CancelIcon from '../public/images/svg/icons/outlined/Close.svg';
import InlineSvg from '../components/atoms/InlineSVG';
import Button from '../components/atoms/Button';

export const Rewards = () => {
  const router = useRouter();
  const { t } = useTranslation('page-Rewards');
  const theme = useTheme();
  // const user = useAppSelector((state) => state.user);

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
        <SubHeader>
          <SideHeader>
            <GoBackButton longArrow onClick={() => router.back()}>
              {t('button.back')}
            </GoBackButton>
          </SideHeader>
          <TitleContainer>
            <Logo
              src={
                theme.name === 'light'
                  ? assets.common.lightAnimatedLogo
                  : assets.common.darkAnimatedLogo
              }
              alt='NewNew logo'
            />
            <IntroHeadline variant={1}>{t('title')}</IntroHeadline>
          </TitleContainer>
          <SideHeader />
        </SubHeader>
        <Content>
          <Section>
            <SCloseButton onClick={() => {}}>
              <InlineSvg
                svg={CancelIcon}
                fill={theme.colorsThemed.text.primary}
                width='20px'
                height='20px'
              />
            </SCloseButton>
            <InstructionsHeadline variant={6}>
              {t('instruction.title')}
            </InstructionsHeadline>
            <StepsContainer>
              <Step>
                <StepImage>
                  <img src={assets.decision.votes} alt='bid' />
                </StepImage>
                <StepCard>
                  <Text variant={2} weight={600}>
                    {t('instruction.bid.title')}
                  </Text>
                  <StepDescription>
                    {t('instruction.bid.description')}
                  </StepDescription>
                </StepCard>
              </Step>
              <Step>
                <StepImage>
                  <img src={assets.decision.gold} alt='earn' />
                </StepImage>
                <StepCard>
                  <Text variant={2} weight={600}>
                    {t('instruction.earn.title')}
                  </Text>
                  <StepDescription>
                    {t('instruction.earn.description')}
                  </StepDescription>
                </StepCard>
              </Step>
              <Step>
                <StepImage>
                  <img src={assets.decision.votes} alt='spend' />
                </StepImage>
                <StepCard>
                  <Text variant={2} weight={600}>
                    {t('instruction.spend.title')}
                  </Text>
                  <StepDescription>
                    {t('instruction.spend.description')}
                  </StepDescription>
                </StepCard>
              </Step>
            </StepsContainer>
          </Section>
          <Section>
            <SectionTitle>{t('balance.title')}</SectionTitle>
            <BalanceValue>
              <InfoButton onClick={() => {}}>i</InfoButton>
              {/* TODO: use data from API */}
              $0.00
            </BalanceValue>
            <SButton>{t('balance.button')}</SButton>
          </Section>
          <Section>
            <SectionTitle>{t('rewards.title')}</SectionTitle>
            {/* TODO: Use data from API */}
            {/* TODO: Move to a separate component/ molecule */}
            <RewardsContainer>
              <RewardCard received>
                <RewardImage>
                  <img src={assets.decision.gold} alt='' />
                </RewardImage>
                <RewardTitle received>Signed up</RewardTitle>
                <RewardAmount received>
                  <RewardAmountText>
                    {t('rewards.earned', { value: '5.00' })}
                  </RewardAmountText>
                </RewardAmount>
              </RewardCard>
              <RewardCard>
                <RewardImage>
                  <img src={assets.decision.votes} alt='' />
                </RewardImage>
                <RewardTitle>Place a bid of $1000000000</RewardTitle>
                <RewardAmount>
                  {t('rewards.earn', { value: '5.00' })}
                </RewardAmount>
              </RewardCard>

              {/* Placeholders for flex-wrap content alignment */}
              <RewardCard holder />
              <RewardCard holder />
              <RewardCard holder />
              <RewardCard holder />
            </RewardsContainer>
          </Section>
        </Content>
      </Container>
    </>
  );
};

(Rewards as NextPageWithLayout).getLayout = (page: React.ReactElement) => (
  <HomeLayout>{page}</HomeLayout>
);

export default Rewards;

export const getServerSideProps = async (context: NextPageContext) => {
  const translationContext = await serverSideTranslations(context.locale!!, [
    'common',
    'page-Rewards',
  ]);

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
  padding-top: 26px;

  ${({ theme }) => theme.media.tablet} {
    padding-top: 56px;
    padding-left: 10px;
    padding-right: 10px;
  }

  ${({ theme }) => theme.media.laptop} {
    padding-top: 40px;
    padding-left: 0;
    padding-right: 0;
  }
`;

const SubHeader = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  width: 100%;
  margin-bottom: 24px;

  ${({ theme }) => theme.media.tablet} {
    margin-bottom: 32px;
  }

  ${({ theme }) => theme.media.laptop} {
    margin-bottom: 40px;
  }
`;

const SideHeader = styled.div`
  width: 100px;
  display: none;
  padding-left: 6px;
  padding-right: 6px;

  ${({ theme }) => theme.media.tablet} {
    display: flex;
  }

  ${({ theme }) => theme.media.laptop} {
    padding-left: 0px;
    padding-right: 0px;
  }
`;

const TitleContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`;

const Logo = styled.img`
  object-fit: contain;
  height: 64px;
  width: 85px;
  margin-bottom: 16px;

  ${({ theme }) => theme.media.tablet} {
    height: 64px;
    width: 85px;
  }

  ${({ theme }) => theme.media.laptop} {
    height: 100px;
    width: 134px;
  }
`;

const IntroHeadline = styled(Headline)`
  white-space: nowrap;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 900px;
`;

const Section = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  background-color: ${(props) => props.theme.colorsThemed.background.secondary};
  border-radius: 16px;
  text-align: center;
  padding: 24px;

  margin-bottom: 16px;

  ${({ theme }) => theme.media.laptop} {
    margin-bottom: 32px;
  }
`;

const SCloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;

  display: flex;
  justify-content: center;
  align-items: center;

  width: 36px;
  height: 36px;
  border: none;
  border-radius: 11px;
  background: rgba(255, 255, 255, 0.1);

  color: ${({ theme }) => theme.colorsThemed.text.primary};

  cursor: pointer;
`;

const InstructionsHeadline = styled(Headline)`
  margin-top: 16px;
  margin-bottom: 24px;
  padding-left: 36px;
  padding-right: 36px;

  ${({ theme }) => theme.media.tablet} {
    margin-bottom: 32px;
    flex-direction: row;
  }
`;

const StepsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  gap: 16px;
  padding-left: 16px;
  padding-right: 16px;
  margin-bottom: 8px;

  ${({ theme }) => theme.media.tablet} {
    flex-direction: row;
    align-items: unset;
    gap: 24px;
    padding-left: 32px;
    padding-right: 32px;
    margin-bottom: 16px;
  }

  ${({ theme }) => theme.media.laptop} {
    gap: 32px;
    padding-top: 58px;
  }
`;

const Step = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;

  padding-top: 58px;
  max-width: 230px;

  ${({ theme }) => theme.media.tablet} {
    padding-top: 48px;
    max-width: unset;
  }

  ${({ theme }) => theme.media.laptop} {
    padding-top: 58px;
  }
`;

const StepImage = styled.div`
  position: absolute;
  top: 0;

  width: 100px;
  height: 100px;

  img {
    width: 100%;
    object-fit: contain;
  }

  ${({ theme }) => theme.media.tablet} {
    width: 80px;
    height: 80px;
  }

  ${({ theme }) => theme.media.laptop} {
    width: 100px;
    height: 100px;
  }
`;

const StepCard = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  background-color: ${(props) => props.theme.colorsThemed.background.tertiary};
  border-radius: 16px;
  padding: 50px 25px 28px 25px;
`;

const StepDescription = styled.div`
  color: ${(props) => props.theme.colorsThemed.text.tertiary};
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
  margin-top: 8px;
`;

const SectionTitle = styled.div`
  color: ${(props) => props.theme.colorsThemed.text.secondary};
  font-weight: 600;
  font-size: 20px;
  line-height: 28px;
  margin-bottom: 4px;

  ${({ theme }) => theme.media.tablet} {
    line-height: 32px;
  }
`;

const BalanceValue = styled.div`
  color: ${(props) => props.theme.colorsThemed.text.primary};
  position: relative;
  padding-left: 32px;
  padding-right: 32px;
  font-weight: 700;
  font-size: 56px;
  line-height: 64px;
  margin-bottom: 24px;
`;

const InfoButton = styled.div`
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  right: 0;
  top: 4px;
  width: 17px;
  height: 17px;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.5);
  border-color: rgba(255, 255, 255, 0.5);
  border: 1px solid;
  border-radius: 100%;
  cursor: pointer;
  user-select: none;
`;

const SButton = styled(Button)`
  width: 100%;

  ${({ theme }) => theme.media.tablet} {
    width: 176px;
  }
`;

const RewardsContainer = styled.div`
  margin-top: 28px;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 16px;
`;

const RewardCard = styled.div<{ received?: boolean; holder?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  border-radius: 16px;
  padding: ${(props) => (props.holder ? 0 : '24px 16px;')};
  width: 146px;
  background-color: ${(props) =>
    props.received
      ? props.theme.colorsThemed.button.background.primary
      : undefined};
  border: ${(props) =>
    props.received
      ? undefined
      : `1px solid ${props.theme.colorsThemed.tag.color.primary}`};

  opacity: ${(props) => (props.holder ? 0 : 1)};
`;

const RewardImage = styled.div`
  width: 56px;
  height: 56px;
  margin-bottom: 5px;

  img {
    width: 100%;
    object-fit: contain;
  }
`;

const RewardTitle = styled.div<{ received?: boolean }>`
  flex-grow: 1;
  color: ${(props) =>
    props.received
      ? props.theme.colorsThemed.text.primary
      : props.theme.colorsThemed.text.secondary};
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
  margin-bottom: 16px;
`;

const RewardAmount = styled.div<{ received?: boolean }>`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  height: 34px;
  width: 115px;
  border-radius: 12px;
  background: ${(props) =>
    props.received
      ? 'rgba(40, 41, 51, 0.25)'
      : props.theme.colorsThemed.background.quinary};
  white-space: nowrap;
  overflow: hidden;
`;

const RewardAmountText = styled.div`
  color: ${(props) => props.theme.colorsThemed.text.primary};
  font-weight: 600;
  font-size: 16px;
  line-height: 24px;
`;
