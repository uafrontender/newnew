import React from 'react';
import styled, { useTheme } from 'styled-components';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import Text from '../../../atoms/Text';
import Button from '../../../atoms/Button';
import Headline from '../../../atoms/Headline';
import { Mixpanel } from '../../../../utils/mixpanel';
import assets from '../../../../constants/assets';

export const AboutBundles: React.FC = () => {
  const { t } = useTranslation('page-Creator');
  const theme = useTheme();

  return (
    <SContainer>
      <SBundlesImage
        src={
          theme.name === 'light'
            ? assets.bundles.lightBundles
            : assets.bundles.darkBundles
        }
        alt={t('dashboard.aboutBundles.title')}
      />
      <SContent>
        <STitle variant={6}>{t('dashboard.aboutBundles.title')}</STitle>
        <SDescriptionWrapper>
          <SDescription variant={3} weight={600}>
            {t('dashboard.aboutBundles.text')}
          </SDescription>
        </SDescriptionWrapper>
        <Link href='/creator/bundles'>
          <a>
            <SButton
              view='brandYellow'
              onClick={() => {
                Mixpanel.track('Navigation Item Clicked', {
                  _stage: 'Dashboard',
                  _button: 'Tell me more',
                  _component: 'AboutBundles',
                  _target: '/creator/bundles',
                });
              }}
            >
              {t('dashboard.aboutBundles.button')}
            </SButton>
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

const SBundlesImage = styled.img`
  width: 120px;
  height: 120px;

  ${(props) => props.theme.media.tablet} {
    width: 148px;
    height: 148px;
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

  ${(props) => props.theme.media.tablet} {
    width: unset;
    padding: 12px 24px;
    margin-top: 24px;
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
