/* eslint-disable no-nested-ternary */
import React from 'react';
import styled, { css, useTheme } from 'styled-components';
import { useTranslation } from 'next-i18next';
import Text from '../../../atoms/Text';
import BulletCheckmark from '../../../atoms/BulletCheckmark';
import TicketSet from '../../../atoms/bundles/TicketSet';

interface IFunctionProps {
  id: number;
  votes: string;
  months: string;
  price: string;
  isBundlesEnabled: boolean;
}

export const SuperpollBundle: React.FC<IFunctionProps> = ({
  id,
  votes,
  months,
  price,
  isBundlesEnabled,
}) => {
  const { t } = useTranslation('page-Creator');
  const theme = useTheme();

  return (
    <SContainer>
      <SHeader>
        <SVotes>
          <SVotesQty isBundlesEnabled={isBundlesEnabled}>{votes}</SVotesQty>{' '}
          {t('myBundles.bundlesSet.votes')}
        </SVotes>
        <TicketSet size={36} shift={11} numberOFTickets={id} />
      </SHeader>
      {months === '1' ? (
        <SText variant={3}>
          {t('myBundles.bundlesSet.descriptionSingular')}
        </SText>
      ) : (
        <SText variant={3}>
          {t('myBundles.bundlesSet.description', { duration: months })}
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
          <SPrice>${price}</SPrice> / {t('myBundles.bundlesSet.perBundle')}
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
