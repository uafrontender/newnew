/* eslint-disable no-nested-ternary */
import React from 'react';
import styled, { css, useTheme } from 'styled-components';
import { useTranslation } from 'next-i18next';
import { newnewapi } from 'newnew-api';

import Text from '../../../atoms/Text';
import BulletCheckmark from '../../../atoms/BulletCheckmark';
import { formatNumber } from '../../../../utils/format';
import assets from '../../../../constants/assets';

interface IFunctionProps {
  id: number;
  bundleOffer: newnewapi.IBundleOffer;
  isBundlesEnabled: boolean;
}

export const SuperpollBundle: React.FC<IFunctionProps> = ({
  id,
  bundleOffer,
  isBundlesEnabled,
}) => {
  const { t } = useTranslation('page-Creator');
  const theme = useTheme();

  const daysOfAccess = bundleOffer.accessDurationInSeconds! / 60 / 60 / 24;
  const monthsOfAccess = Math.floor(daysOfAccess / 30);

  return (
    <SContainer>
      <SHeader>
        <SVotes>
          <SVotesQty isBundlesEnabled={isBundlesEnabled}>
            {formatNumber(bundleOffer.votesAmount!, true)}
          </SVotesQty>{' '}
          {t('myBundles.bundlesSet.votes')}
        </SVotes>
        <SBundleIcon
          src={
            theme.name === 'light'
              ? assets.bundles.lightVotes[id].animated()
              : assets.bundles.darkVotes[id].animated()
          }
          alt='Bundle votes'
        />
      </SHeader>
      {monthsOfAccess === 1 ? (
        <SText variant={3}>
          {t('myBundles.bundlesSet.descriptionSingular')}
        </SText>
      ) : (
        <SText variant={3}>
          {t('myBundles.bundlesSet.description', { duration: monthsOfAccess })}
        </SText>
      )}
      <SBundlesList>
        <SBundlesListItem>
          <BulletCheckmark
            fill={
              !isBundlesEnabled
                ? theme.colorsThemed.accent.yellow
                : theme.colorsThemed.text.tertiary
            }
            fillCheckmark={
              theme.name === 'light'
                ? isBundlesEnabled
                  ? '#ffffff'
                  : '#2C2C33'
                : '#2C2C33'
            }
          />
          <Text variant={3}>{t('myBundles.bundlesSet.firstOption')}</Text>
        </SBundlesListItem>
        <SBundlesListItem>
          <BulletCheckmark
            fill={
              !isBundlesEnabled
                ? theme.colorsThemed.accent.yellow
                : theme.colorsThemed.text.tertiary
            }
            fillCheckmark={
              theme.name === 'light'
                ? isBundlesEnabled
                  ? '#ffffff'
                  : '#2C2C33'
                : '#2C2C33'
            }
          />
          <Text variant={3}>{t('myBundles.bundlesSet.secondOption')}</Text>
        </SBundlesListItem>
      </SBundlesList>
      <SFooter>
        <SText variant={3} noMargin>
          <SPrice>${(bundleOffer.price?.usdCents as number) / 100}</SPrice> /{' '}
          {t('myBundles.bundlesSet.perBundle')}
        </SText>
      </SFooter>
    </SContainer>
  );
};

export default SuperpollBundle;

const SContainer = styled.div`
  width: 100%;
  margin: 0 0 16px;
  padding: 16px;
  border-radius: ${(props) => props.theme.borderRadius.medium};
  background: ${(props) => props.theme.colorsThemed.background.tertiary};
  color: ${(props) => props.theme.colorsThemed.text.primary};
  ${(props) => props.theme.media.tablet} {
    width: 49%;
  }
`;

const SHeader = styled.div`
  display: flex;
  justify-content: space-between;
  padding-bottom: 12px;
`;

const SVotes = styled.strong`
  font-size: 24px;
  font-weight: bold;
`;

const SBundleIcon = styled.img`
  width: 36x;
  height: 36px;
`;

interface ISSVotesQty {
  isBundlesEnabled?: boolean;
}
const SVotesQty = styled.strong<ISSVotesQty>`
  font-size: 24px;
  font-weight: bold;
  color: ${(props) =>
    props.theme.name === 'light'
      ? props.theme.colorsThemed.text.primary
      : props.isBundlesEnabled
      ? props.theme.colorsThemed.text.primary
      : props.theme.colorsThemed.accent.yellow};
`;

interface ISText {
  noMargin?: boolean;
}
const SText = styled(Text)<ISText>`
  color: ${({ theme }) => theme.colorsThemed.text.secondary};
  ${(props) =>
    !props.noMargin &&
    css`
      margin-bottom: 12px;
    `}
`;

const SBundlesList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0 0 6px;
`;

const SBundlesListItem = styled.li`
  display: flex;
  margin-bottom: 8px;
`;

const SFooter = styled.div`
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 16px 0 0;
`;

const SPrice = styled.span`
  font-size: 24px;
  color: ${({ theme }) => theme.colorsThemed.text.primary};
  font-weight: bold;
`;
