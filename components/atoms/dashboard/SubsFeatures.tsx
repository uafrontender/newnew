/* eslint-disable no-unsafe-optional-chaining */
import React from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';
import Image from 'next/image';
import Headline from '../Headline';

import RadioIcon from '../../../public/images/svg/icons/filled/Radio.svg';
import InlineSvg from '../InlineSVG';
import assets from '../../../constants/assets';

const SubsFeatures = () => {
  const { t } = useTranslation('page-Creator');

  return (
    <SContainer>
      <Image
        src={assets.subscription.subMC}
        alt={t('subscribersFeatures.title')}
        width={176}
        height={176}
      />
      <SContent>
        <STitle variant={6}>{t('subscribersFeatures.title')}</STitle>
        <SListItem>
          <SBullet>
            <InlineSvg svg={RadioIcon} width='8' height='8' fill='#fff' />
          </SBullet>
          {t('subscribersFeatures.firstFeature')}
        </SListItem>
        <SListItem>
          <SBullet>
            <InlineSvg svg={RadioIcon} width='8' height='8' fill='#fff' />
          </SBullet>
          {t('subscribersFeatures.secondFeature')}
        </SListItem>
        <SListItem>
          <SBullet>
            <InlineSvg svg={RadioIcon} width='8' height='8' fill='#fff' />
          </SBullet>
          {t('subscribersFeatures.thirdFeature')}
        </SListItem>
      </SContent>
    </SContainer>
  );
};

export default SubsFeatures;

const SContainer = styled.div`
  padding: 16px 16px 30px;
  display: flex;
  background: ${(props) =>
    props.theme.name === 'light'
      ? props.theme.colorsThemed.background.primary
      : props.theme.colorsThemed.background.secondary};
  align-items: center;
  border-radius: 16px;
  flex-direction: column;
  justify-content: center;
  margin: 16px 0;

  ${(props) => props.theme.media.tablet} {
    padding: 24px;
    flex-direction: row-reverse;
    justify-content: space-between;
  }
`;
const SContent = styled.div`
  display: flex;
  flex-direction: column;

  ${(props) => props.theme.media.tablet} {
    width: 100%;
    max-width: calc(100% - 222px);
    align-items: flex-start;
  }
`;

const STitle = styled(Headline)`
  margin-top: 16px;
  font-weight: 700;
  text-align: center;

  ${(props) => props.theme.media.tablet} {
    margin-top: unset;
    text-align: left;
  }
`;

const SListItem = styled.div`
  display: flex;
  margin-top: 15px;
  align-items: center;
`;

const SBullet = styled.div`
  border-radius: 50%;
  display: flex;
  width: 18px;
  height: 18px;
  justify-content: center;
  background: #12a573;
  margin-right: 8px;
  flex-shrink: 0;
`;
