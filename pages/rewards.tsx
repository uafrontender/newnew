/* eslint-disable no-nested-ternary */
import React, { useContext } from 'react';
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
import { useAppSelector } from '../redux-store/store';
import GoBackButton from '../components/molecules/GoBackButton';

import CancelIcon from '../public/images/svg/icons/outlined/Close.svg';
import InlineSvg from '../components/atoms/InlineSVG';
import Button from '../components/atoms/Button';
import RewardList from '../components/molecules/RewardList';
import { formatNumber } from '../utils/format';
import { RewardContext } from '../contexts/rewardContext';
import { useGetAppConstants } from '../contexts/appConstantsContext';
import useRewardInstructionVisible from '../utils/hooks/useRewardInstructionVisible';
import GenericSkeleton from '../components/molecules/GenericSkeleton';

export const Rewards = () => {
  const router = useRouter();
  const { t } = useTranslation('page-Rewards');
  const theme = useTheme();
  const user = useAppSelector((state) => state.user);
  const [instructionVisible, setInstructionVisible] =
    useRewardInstructionVisible();

  const { rewardBalance, isRewardBalanceLoading } = useContext(RewardContext);
  const { currentSignupRewardAmount } = useGetAppConstants().appConstants;

  const rewardBalanceValue: number | undefined = !user.loggedIn
    ? currentSignupRewardAmount?.usdCents
      ? currentSignupRewardAmount.usdCents / 100
      : undefined
    : isRewardBalanceLoading || !rewardBalance?.usdCents
    ? undefined
    : rewardBalance.usdCents / 100;

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
          {instructionVisible && (
            <Section>
              <SCloseButton onClick={() => setInstructionVisible(false)}>
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
                    <img src={assets.common.darkAc} alt='spend' />
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
          )}

          <Section>
            <SectionTitle>{t('balance.title')}</SectionTitle>
            {rewardBalanceValue === undefined ? (
              <SkeletonBalanceValue
                bgColor={theme.colorsThemed.background.quaternary}
                highlightColor={theme.colorsThemed.background.tertiary}
              />
            ) : (
              <BalanceValue>
                {!instructionVisible && (
                  <InfoButton onClick={() => setInstructionVisible(true)}>
                    i
                  </InfoButton>
                )}
                ${formatNumber(rewardBalanceValue)}
              </BalanceValue>
            )}
            <SButton
              onClick={() => {
                if (user.loggedIn) {
                  router.push('/');
                } else {
                  router.push('/sign-up');
                }
              }}
            >
              {user.loggedIn
                ? t('balance.button.spend')
                : t('balance.button.signUp')}
            </SButton>
          </Section>

          <Section>
            <SectionTitle>{t('rewards.title')}</SectionTitle>
            <RewardList />
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
  background: ${({ theme }) =>
    theme.name === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'};

  color: ${({ theme }) => theme.colorsThemed.text.primary};

  cursor: pointer;

  :hover {
    background: ${({ theme }) =>
      theme.name === 'light'
        ? 'rgba(0, 0, 0, 0.05)'
        : 'rgba(255, 255, 255, 0.05)'};
  }
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
  background-color: ${(props) =>
    props.theme.colorsThemed.background.quaternary};
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

const SkeletonBalanceValue = styled(GenericSkeleton)`
  height: 64px;
  width: 180px;
  position: relative;
  margin-bottom: 24px;
  border-radius: 16px;
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
  color: ${(props) => props.theme.colorsThemed.text.primary};
  border-color: ${(props) => props.theme.colorsThemed.text.primary};
  opacity: 0.5;
  border: 1px solid;
  border-radius: 100%;
  cursor: pointer;
  user-select: none;
`;

const SButton = styled(Button)`
  width: 100%;

  ${({ theme }) => theme.media.tablet} {
    width: fit-content;
    min-width: 176px;
  }
`;
