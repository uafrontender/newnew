import { Trans, useTranslation } from 'next-i18next';
import React from 'react';
import styled, { css, useTheme } from 'styled-components';
import Link from 'next/link';

import Headline from '../../atoms/Headline';
import Text from '../../atoms/Text';
import InlineSvg from '../../atoms/InlineSVG';

import { useAppSelector } from '../../../redux-store/store';
import assets from '../../../constants/assets';

import CheckmarkIcon from '../../../public/images/svg/icons/outlined/Checkmark.svg';
import PlayIcon from '../../../public/images/svg/icons/filled/Play.svg';
import canBecomeCreator from '../../../utils/canBecomeCreator';
import { useGetAppConstants } from '../../../contexts/appConstantsContext';

interface IEmbedLink {
  href: string;
  children?: React.ReactNode;
}

const EmbedLink = ({ href, children }: IEmbedLink) => (
  <Link href={href}>
    <SLink>{children}</SLink>
  </Link>
);

interface IPoint {
  children?: React.ReactNode;
  variant: 1 | 2;
}

const Point = ({ children, variant }: IPoint) => (
  <SPoint variant={variant}>
    {variant === 1 && (
      <span>
        <InlineSvg svg={CheckmarkIcon} width='6px' height='5px' />
      </span>
    )}
    {variant === 2 && (
      <span>
        <InlineSvg svg={PlayIcon} width='14px' height='14px' />
      </span>
    )}
    {children}
  </SPoint>
);

const FaqSection = () => {
  const { t } = useTranslation('page-Home');
  const theme = useTheme();
  const user = useAppSelector((state) => state.user);
  const { appConstants } = useGetAppConstants();

  return (
    <SContainer>
      <SHeadline variant={1}>{t('faq.title')}</SHeadline>
      <SList>
        {new Array(7).fill('').map((_, i) => {
          // Skip section about becoming creator for users younger then 13
          if (
            i === 1 &&
            user.loggedIn &&
            !user.userData?.options?.isCreator &&
            !canBecomeCreator(
              user.userData?.dateOfBirth,
              appConstants.minCreatorAgeYears
            )
          ) {
            return null;
          }

          return (
            <SListItem key={t(`faq.items.${i}.question` as any)}>
              <STitle variant={2} weight={600}>
                {t(`faq.items.${i}.question` as any)}
              </STitle>
              <SText variant={3} weight={600}>
                <Trans
                  key={`trans-${user.loggedIn}`}
                  i18nKey={`faq.items.${i}.answer` as any}
                  t={t}
                  components={[
                    <EmbedLink
                      href={
                        // eslint-disable-next-line no-nested-ternary
                        user.loggedIn
                          ? user.userData?.options?.isCreator
                            ? '/creator/dashboard'
                            : '/creator-onboarding'
                          : '/sign-up?to=create'
                      }
                    />,

                    <Point variant={2} />,
                    <Point variant={1} />,
                  ]}
                />
              </SText>
            </SListItem>
          );
        })}
      </SList>
      <SHint variant={3} weight={600}>
        <Trans
          i18nKey='faq.learMore'
          t={t}
          components={[
            <SLink
              href='https://intercom.help/NewNewHelpCenter/en'
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

  ${(props) => props.theme.media.tablet} {
    margin-top: 20px;
  }

  ${(props) => props.theme.media.laptop} {
    padding: 60px 128px;
    margin-top: 0;
  }

  ${(props) => props.theme.media.laptopM} {
    margin: 0 auto;

    max-width: 1248px;
  }
`;

const SHeadline = styled(Headline)`
  margin-bottom: 24px;

  ${({ theme }) => theme.media.tablet} {
    font-size: 32px;
    line-height: 40px;
  }

  ${({ theme }) => theme.media.laptopL} {
    font-size: 40px;
    line-height: 48px;
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
  white-space: pre-line;

  ${({ theme }) => theme.media.tablet} {
    font-size: 14px;
    line-height: 20px;
    font-weight: 500;
  }
`;

const SHint = styled(Text)`
  margin-top: 24px;
  color: ${({ theme }) =>
    theme.name === 'dark'
      ? theme.colorsThemed.background.outlines2
      : theme.colorsThemed.text.secondary};

  ${({ theme }) => theme.media.tablet} {
    line-height: 20px;
    font-weight: 500;
  }
`;

const SLink = styled.a`
  color: ${({ theme }) => theme.colorsThemed.accent.blue};
  text-decoration: underline;
  cursor: pointer;
  line-height: 24px;

  ${({ theme }) => theme.media.tablet} {
    font-weight: 600;
  }
`;

const SFloatingImage = styled.img`
  position: absolute;

  visibility: hidden;

  ${({ theme }) => theme.media.laptop} {
    visibility: visible;
  }
`;

const SSubImageLeftTop = styled(SFloatingImage)`
  width: ${({ theme }) => (theme.name === 'dark' ? '41px' : '33px')};
  height: 41px;
  left: -2.3%;
  top: -3.2%;
  transform: rotate(19deg);
  opacity: 0.8;

  ${({ theme }) => theme.media.tablet} {
    visibility: visible;
  }

  ${({ theme }) => theme.media.laptop} {
    width: ${({ theme }) => (theme.name === 'dark' ? '86px' : '42px')};
    height: ${({ theme }) => (theme.name === 'dark' ? '86px' : '57px')};
    left: ${({ theme }) => (theme.name === 'dark' ? '-6%' : '-4%')};
    top: 20%;
    transform: rotate(13deg);
  }
`;

const SSubImageLeftMiddle = styled(SFloatingImage)`
  width: ${({ theme }) => (theme.name === 'dark' ? '19px' : '16px')};
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
  width: ${({ theme }) => (theme.name === 'dark' ? '26px' : '21px')};
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
  width: ${({ theme }) => (theme.name === 'dark' ? '70px' : '56px')};
  height: 70px;
  right: -4%;
  top: 0;
  transform: scaleX(-1) rotate(17deg);

  ${({ theme }) => theme.media.tablet} {
    visibility: visible;
  }

  ${({ theme }) => theme.media.laptop} {
    width: ${({ theme }) => (theme.name === 'dark' ? '112px' : '56px')};
    height: ${({ theme }) => (theme.name === 'dark' ? '112px' : '75px')};
    right: 0;
    top: 20.5%;
    transform: scaleX(-1) translateX(-62%);
  }
`;

const SSubImageRightMiddle = styled(SFloatingImage)`
  width: ${({ theme }) => (theme.name === 'dark' ? '19px' : '16px')};
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
  width: ${({ theme }) => (theme.name === 'dark' ? '26.23px' : '22.23px')};
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

const SPoint = styled.span<{ variant: 1 | 2 }>`
  display: flex;
  align-items: center;
  margin-top: 4px;

  &:first-of-type {
    margin-top: 6px;
  }

  ${({ variant }) =>
    variant === 1
      ? css`
          & span {
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 8px;
            max-width: 12px;
            max-height: 12px;
            min-width: 12px;
            min-height: 12px;
            border-radius: 50%;
            background-color: ${({ theme }) =>
              theme.colorsThemed.accent.yellow};

            & svg {
              color: ${({ theme }) => theme.colors.dark};
            }
          }
        `
      : css`
          & span {
            margin-right: 6px;
          }
          & svg {
            fill: ${({ theme }) =>
              theme.name === 'dark'
                ? theme.colors.white
                : theme.colorsThemed.background.outlines2};
          }
        `}
`;

export default FaqSection;
