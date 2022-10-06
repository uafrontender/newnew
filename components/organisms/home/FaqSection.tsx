import { useTranslation } from 'next-i18next';
import React from 'react';
import styled, { useTheme } from 'styled-components';
import Headline from '../../atoms/Headline';

import Text from '../../atoms/Text';

import assets from '../../../constants/assets';

const FAQs = [
  {
    question: 'How do subscriptions work?',
    answer:
      'Subscribing to your favorite creator lets you unlock exclusive extras. These include 1-on-1 convos with the creator, a free vote on every superpoll the creator makes, and the power to add your own options to their superpolls.',
  },
  {
    question: 'How much is a subscription?',
    answer:
      'Every creator sets their own subscription price and subscriptions start as low as $1.99 per month.',
  },
  {
    question:
      'When I subscribe to one creator, does it mean I’m subscribed to all creators?',
    answer:
      'Your subscription gives you access to the specific creator you chose on NewNew.',
  },
  {
    question: 'Can I cancel a subsciption?',
    answer:
      'Yes. You can cancel a subscription at any time. Just go to the creator\'s profile, open the "More" menu and then tap unsubscribe. Don’t worry if you cancel in the middle of your billing period, you\'ll still be able to interact with the creator until the end of the billing period.',
  },
  {
    question: 'Do all creators offer a subscription?',
    answer:
      'No. Although every creator can offer subscriptions, some creators choose not to.',
  },
];

const FaqSection = () => {
  const { t } = useTranslation('page-Home');
  const theme = useTheme();

  return (
    <SContainer>
      <SHeadline variant={4}>{t('FAQ.title')}</SHeadline>
      <SList>
        {FAQs.map((item) => (
          <SListItem>
            <STitle variant={2} weight={600}>
              {item.question}
            </STitle>
            <SText variant={3} weight={600}>
              {item.answer}
            </SText>
          </SListItem>
        ))}
      </SList>
      {/* Left side floating icons */}
      <SSubImageLeftTop
        src={
          theme.name === 'dark'
            ? assets.floatingAssets.darkSubMC
            : assets.floatingAssets.lightSubMC
        }
        alt='background'
        draggable={false}
      />
      <SSubImageLeftMiddle
        src={
          theme.name === 'dark'
            ? assets.floatingAssets.darkSubMC
            : assets.floatingAssets.lightSubMC
        }
        alt='background'
        draggable={false}
      />
      <SSubImageLeftBottom
        src={
          theme.name === 'dark'
            ? assets.floatingAssets.darkSubMC
            : assets.floatingAssets.lightSubMC
        }
        alt='background'
        draggable={false}
      />

      {/* Right side floating icons */}
      <SSubImageRightTop
        src={
          theme.name === 'dark'
            ? assets.floatingAssets.darkSubMC
            : assets.floatingAssets.lightSubMC
        }
        alt='background'
        draggable={false}
      />
      <SSubImageRightMiddle
        src={
          theme.name === 'dark'
            ? assets.floatingAssets.darkSubMC
            : assets.floatingAssets.lightSubMC
        }
        alt='background'
        draggable={false}
      />
      <SSubImageRightBottom
        src={
          theme.name === 'dark'
            ? assets.floatingAssets.darkSubMC
            : assets.floatingAssets.lightSubMC
        }
        alt='background'
        draggable={false}
      />
      <SHint variant={3} weight={600}>
        {t('FAQ.stillHaveQuestion')}{' '}
        <SLink
          href='https://intercom.help/newnew-e1a1ca1980f5/en'
          target='_blank'
        >
          {t('FAQ.newnewHelpCenter')}
        </SLink>
      </SHint>
    </SContainer>
  );
};

const SContainer = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  padding: 20px 0;

  ${(props) => props.theme.media.laptop} {
    padding: 60px 128px;
  }

  ${(props) => props.theme.media.laptopM} {
    margin: 0 auto;

    max-width: 1248px;
  }
`;

const SHeadline = styled(Headline)`
  margin-bottom: 24px;
  font-size: 28px;
  line-height: 36px;

  ${({ theme }) => theme.media.laptop} {
    font-size: 32px;
    line-height: 40px;
  }
`;

const SList = styled.ul`
  list-style: none;
`;

const SListItem = styled.li`
  padding: 24px;
  margin-bottom: 12px;
  background-color: ${({ theme }) => theme.colorsThemed.background.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.medium};

  &:last-child {
    margin-bottom: 0;
  }
`;

const STitle = styled(Text)`
  margin-bottom: 8px;
  font-size: 16px;
  line-height: 24px;
`;

const SText = styled(Text)`
  color: ${({ theme }) =>
    theme.name === 'dark'
      ? theme.colorsThemed.background.outlines2
      : theme.colorsThemed.text.secondary};

  ${({ theme }) => theme.media.tablet} {
    font-size: 14px;
    line-height: 20px;
  }
`;

const SHint = styled(Text)`
  margin-top: 24px;
  color: ${({ theme }) =>
    theme.name === 'dark'
      ? theme.colorsThemed.background.outlines2
      : theme.colorsThemed.text.secondary};
`;

const SLink = styled.a`
  color: ${({ theme }) => theme.colorsThemed.accent.blue};
  text-decoration: underline;
  cursor: pointer;
  font-weight: 700;
`;

const SFloatingImage = styled.img`
  position: absolute;

  visibility: hidden;

  ${({ theme }) => theme.media.tablet} {
    visibility: visible;
  }
`;

const SSubImageLeftTop = styled(SFloatingImage)`
  width: 41px;
  height: 41px;
  left: -2.3%;
  top: -3.2%;
  transform: rotate(19deg);
  opacity: 0.8;

  ${({ theme }) => theme.media.laptop} {
    width: ${({ theme }) => (theme.name === 'dark' ? '86px' : '42px')};
    height: ${({ theme }) => (theme.name === 'dark' ? '86px' : '57px')};
    left: ${({ theme }) => (theme.name === 'dark' ? '-6%' : '-4%')};
    top: 20%;
    transform: rotate(13deg);
  }
`;

const SSubImageLeftMiddle = styled(SFloatingImage)`
  width: 19px;
  height: 19px;
  top: 15.5%;
  left: 2.5%;
  transform: rotate(21deg);
  opacity: 0.6;

  ${({ theme }) => theme.media.laptop} {
    width: ${({ theme }) => (theme.name === 'dark' ? '36px' : '20px')};
    height: ${({ theme }) => (theme.name === 'dark' ? '36px' : '28px')};
    left: 2%;
    top: 49%;
    transform: rotate(17deg);
  }
`;

const SSubImageLeftBottom = styled(SFloatingImage)`
  width: 26px;
  height: 26px;
  bottom: 1%;
  left: -2.7%;
  transform: rotate(-60deg);

  ${({ theme }) => theme.media.laptop} {
    width: ${({ theme }) => (theme.name === 'dark' ? '50px' : '30px')};
    height: ${({ theme }) => (theme.name === 'dark' ? '50px' : '38px')};
    left: -3.5%;
    top: 71%;
    transform: rotate(-59deg);
  }
`;

const SSubImageRightTop = styled(SFloatingImage)`
  width: 70px;
  height: 70px;
  right: -4%;
  top: 0;
  transform: scaleX(-1) rotate(17deg);

  ${({ theme }) => theme.media.laptop} {
    width: ${({ theme }) => (theme.name === 'dark' ? '112px' : '56px')};
    height: ${({ theme }) => (theme.name === 'dark' ? '112px' : '75px')};
    right: 0;
    top: 20.5%;
    transform: scaleX(-1) translateX(-62%);
  }
`;

const SSubImageRightMiddle = styled(SFloatingImage)`
  width: 19px;
  height: 19px;
  top: 15%;
  right: 5%;
  transform: scaleX(-1) rotate(33deg);
  opacity: 0.6;

  ${({ theme }) => theme.media.laptop} {
    width: ${({ theme }) => (theme.name === 'dark' ? '53px' : '29px')};
    height: ${({ theme }) => (theme.name === 'dark' ? '53px' : '39px')};
    right: 1.8%;
    top: 52%;
    transform: scaleX(-1) rotate(30deg);
  }
`;

const SSubImageRightBottom = styled(SFloatingImage)`
  width: 26.23px;
  height: 26.03px;
  bottom: 1%;
  right: 2%;
  transform: scaleX(-1) rotate(-60deg);

  ${({ theme }) => theme.media.laptop} {
    width: ${({ theme }) => (theme.name === 'dark' ? '38px' : '20px')};
    height: ${({ theme }) => (theme.name === 'dark' ? '38px' : '26px')};
    right: -3.5%;
    top: 75.5%;
    transform: scaleX(-1) rotate(-60deg);
    opacity: 0.6;
  }
`;

export default FaqSection;
