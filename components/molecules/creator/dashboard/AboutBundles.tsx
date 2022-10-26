import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import Text from '../../../atoms/Text';
import Button from '../../../atoms/Button';
import Headline from '../../../atoms/Headline';

import votesSmall from '../../../../public/images/dashboard/votes-small.png';

export const AboutBundles = () => {
  const { t } = useTranslation('page-Creator');

  return (
    <SContainer>
      <SImgHolder>
        <img
          src={votesSmall.src}
          alt={t('dashboard.aboutBundles.title')}
          width={100}
          height={100}
        />
        <img
          src={votesSmall.src}
          alt={t('dashboard.aboutBundles.title')}
          width={100}
          height={100}
        />
      </SImgHolder>
      <SContent>
        <STitle variant={6}>{t('dashboard.aboutBundles.title')}</STitle>
        <SDescriptionWrapper>
          <SDescription variant={3} weight={600}>
            {t('dashboard.aboutBundles.text')}
          </SDescription>
        </SDescriptionWrapper>
        <Link href='/creator/bundles'>
          <a>
            <SButton>{t('dashboard.aboutBundles.button')}</SButton>
          </a>
        </Link>
      </SContent>
    </SContainer>
  );
};

export default AboutBundles;

const SContainer = styled.div`
  padding: 32px 24px !important;
  display: flex;
  background: ${(props) =>
    props.theme.name === 'light'
      ? props.theme.colorsThemed.background.primary
      : props.theme.colorsThemed.background.secondary};

  border-radius: 16px;
  flex-direction: column;

  ${(props) => props.theme.media.tablet} {
    padding: 18px 24px 18px 32px;
    flex-direction: row-reverse;
    justify-content: space-between;
    align-items: center;
    justify-content: center;
  }
`;

const SImgHolder = styled.div`
  width: 130px;
  height: 100px;
  position: relative;
  img {
    position: absolute;
    left: 0;
    top: 0;
    z-index: 1;
    &:last-child {
      left: 30px;
      z-index: 0;
    }
  }
  ${(props) => props.theme.media.tablet} {
    margin-left: auto;
  }
`;
const SContent = styled.div`
  margin-right: auto;
  ${(props) => props.theme.media.tablet} {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-width: calc(100% - 222px);
    align-items: flex-start;
  }
`;

const STitle = styled(Headline)`
  margin-top: 16px;
  font-weight: 600;

  ${(props) => props.theme.media.tablet} {
    margin-top: unset;
  }
`;

const SButton = styled(Button)`
  width: 100%;
  padding: 16px 20px;
  margin-top: 16px;

  background: ${(props) => props.theme.colorsThemed.accent.yellow};
  color: #2c2c33;

  ${(props) => props.theme.media.tablet} {
    width: unset;
    padding: 12px 24px;
    margin-top: 24px;
  }
  &:hover {
    background: ${(props) => props.theme.colorsThemed.accent.yellow} !important;
  }
`;

const SDescriptionWrapper = styled.div`
  margin-top: 8px;

  p {
    display: inline;
  }

  ${(props) => props.theme.media.tablet} {
    margin-top: 12px;
  }

  ${(props) => props.theme.media.laptop} {
    margin-top: 8px;
  }
`;

const SDescription = styled(Text)`
  white-space: pre-wrap;
  color: ${(props) => props.theme.colorsThemed.text.secondary};
`;
