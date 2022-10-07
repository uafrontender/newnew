import { Trans, useTranslation } from 'next-i18next';
import React from 'react';
import styled, { useTheme } from 'styled-components';
import Link from 'next/link';

import Headline from '../../atoms/Headline';
import Text from '../../atoms/Text';

import assets from '../../../constants/assets';

interface IEmbedLink {
  href: string;
  children: React.ReactNode;
}

const EmbedLink = ({ href, children }: IEmbedLink) => (
  <Link href={href}>
    <SLink>{children}</SLink>
  </Link>
);

interface IPoint {
  children: React.ReactNode;
}

const Point = ({ children }: IPoint) => (
  <SPoint>
    <span>👉🏻</span> {children}
  </SPoint>
);

const FaqSection = () => {
  const { t } = useTranslation('page-Home');
  const theme = useTheme();

  return (
    <SContainer>
      <SHeadline variant={4}>{t('faq.title')}</SHeadline>
      <SList>
        {new Array(6).fill('').map((_, i) => (
          <SListItem key={t(`faq.items.${i}.question`)}>
            <STitle variant={2} weight={600}>
              {t(`faq.items.${i}.question`)}
            </STitle>
            <SText variant={3} weight={600}>
              <Trans
                i18nKey={`faq.items.${i}.answer`}
                t={t}
                components={[
                  // @ts-ignore
                  <EmbedLink href='/sign-up?to=create' />,
                  // @ts-ignore
                  <Point />,
                ]}
              />
              {/* {Array.isArray(
                t(`faq.items.${i}.answerSubItems`, { returnObjects: true })
              ) &&
                t(`faq.items.${i}.answerSubItems`, { returnObjects: true }).map(
                  (el) => el
                )} */}
            </SText>
          </SListItem>
        ))}
      </SList>
      <SHint variant={3} weight={600}>
        <Trans
          i18nKey='faq.learMore'
          t={t}
          // @ts-ignore
          components={[
            <SLink
              href='https://intercom.help/newnew-e1a1ca1980f5/en'
              target='_blank'
            />,
          ]}
        />
      </SHint>

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
  width: 100%;
  list-style: none;
`;

const SListItem = styled.li`
  width: 100%;
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

const SPoint = styled.span`
  display: flex;
  align-items: center;
  margin-top: 4px;

  & span {
    margin-right: 6px;
  }

  &:first-of-type {
    margin-top: 6px;
  }
`;

export default FaqSection;
