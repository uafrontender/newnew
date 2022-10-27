/* eslint-disable no-nested-ternary */
import React, { useCallback, useMemo, useState } from 'react';
import styled, { css } from 'styled-components';
import { useTranslation } from 'next-i18next';
import Headline from '../../../atoms/Headline';
import Text from '../../../atoms/Text';
import Button from '../../../atoms/Button';

interface IFunctionProps {
  isBundlesEnabled: boolean;
}

export const BundlesEarnings: React.FC<IFunctionProps> = React.memo(
  ({ isBundlesEnabled }) => {
    const { t } = useTranslation('page-Creator');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [totalEarned, setTotalEarned] = useState<string>('1,825');
    const [hasEarnings, setHasEarnings] = useState<boolean>(true);
    const toggleHasEarnings = useCallback(() => {
      setHasEarnings((prevState) => !prevState);
    }, []);

    interface IBundleEarnings {
      id: number;
      price: string;
      earnedAmount: string;
    }

    const collection: IBundleEarnings[] = useMemo(
      () => [
        {
          id: 1,
          price: '5',
          earnedAmount: '250',
        },
        {
          id: 2,
          price: '25',
          earnedAmount: '1,050',
        },
        {
          id: 3,
          price: '50',
          earnedAmount: '1,850',
        },
        {
          id: 4,
          price: '75',
          earnedAmount: '675',
        },
      ],
      []
    );

    const renderListItem = useCallback(
      (item: IBundleEarnings) => (
        <SBundle key={`superpoll-bundle-${item.id}`}>
          <SBundleTitle>
            ${item.price} {t('myBundles.earnings.unitName')}
          </SBundleTitle>
          <div>
            <SBundlePrice isBundlesEnabled={isBundlesEnabled}>
              ${item.earnedAmount}
            </SBundlePrice>
            <SText variant={3}>{t('myBundles.earnings.earned')}</SText>
          </div>
        </SBundle>
      ),
      [isBundlesEnabled, t]
    );

    return (
      <SBlock>
        <SHeaderLine>
          <STitle variant={6}>{t('myBundles.earnings.title')}</STitle>
          <SButton onClick={toggleHasEarnings} enabled={hasEarnings}>
            {hasEarnings ? 'Turn Off' : 'Turn On'}
          </SButton>
        </SHeaderLine>
        {!hasEarnings ? (
          <SNoEarnings>
            <SText variant={3}>{t('myBundles.earnings.noSoldYet')}</SText>
          </SNoEarnings>
        ) : (
          <>
            <STotal>
              <STotalEarned isBundlesEnabled={isBundlesEnabled}>
                ${totalEarned}
              </STotalEarned>
              <STotalEarnedText>
                {t('myBundles.earnings.payPeriod')}
              </STotalEarnedText>
            </STotal>
            <SBundles>{collection.map(renderListItem)}</SBundles>
          </>
        )}
      </SBlock>
    );
  }
);

export default BundlesEarnings;

interface ISBlock {
  noMargin?: boolean;
}

const SBlock = styled.section<ISBlock>`
  background: ${({ theme }) =>
    theme.name === 'light'
      ? theme.colorsThemed.background.primary
      : theme.colorsThemed.background.secondary};
  padding: 24px;
  border-radius: ${(props) => props.theme.borderRadius.large};
  ${(props) =>
    !props.noMargin &&
    css`
      margin-bottom: 24px;
    `}
  ${(props) => props.theme.media.tablet} {
    max-width: 100%;
  }
  ${(props) => props.theme.media.laptopL} {
    max-width: calc(100% - 435px);
  }
`;

const SHeaderLine = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  margin-bottom: 24px;

  ${(props) => props.theme.media.tablet} {
    margin-bottom: 14px;
    flex-direction: row;
    justify-content: space-between;
  }

  ${(props) => props.theme.media.laptop} {
    margin-bottom: 18px;
  }
`;

const STitle = styled(Headline)``;

interface ISButton {
  enabled?: boolean;
}
const SButton = styled(Button)<ISButton>`
  width: 100%;
  padding: 16px 20px;
  background: ${(props) =>
    !props.enabled
      ? props.theme.colorsThemed.accent.yellow
      : props.theme.colorsThemed.background.tertiary};
  color: ${(props) =>
    !props.enabled
      ? props.theme.colors.darkGray
      : props.theme.name === 'light'
      ? props.theme.colorsThemed.text.primary
      : props.theme.colors.white};

  ${(props) => props.theme.media.tablet} {
    width: unset;
    padding: 12px 24px;
  }
  &:focus,
  &:active,
  &:hover {
    background: ${(props) =>
      !props.enabled
        ? props.theme.colorsThemed.accent.yellow
        : props.theme.colorsThemed.background.tertiary} !important;
    color: ${(props) =>
      !props.enabled
        ? props.theme.colors.darkGray
        : props.theme.name === 'light'
        ? props.theme.colorsThemed.text.primary
        : props.theme.colors.white} !important;
  }
`;

const SNoEarnings = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 15px 0 40px;
`;

const SText = styled(Text)`
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};
`;

const STotal = styled.div`
  display: flex;
  flex-direction: column;
  margin: 0 0 16px;
  padding: 24px;
  border-radius: ${(props) => props.theme.borderRadius.medium};
  background: ${(props) => props.theme.colorsThemed.background.tertiary};
  color: ${(props) => props.theme.colorsThemed.text.primary};
`;

interface ISTotalEarned {
  isBundlesEnabled?: boolean;
}
const STotalEarned = styled.div<ISTotalEarned>`
  font-size: 32px;
  margin-bottom: 6px;
  font-weight: bold;
  color: ${(props) =>
    props.theme.name === 'light'
      ? props.theme.colorsThemed.text.primary
      : props.isBundlesEnabled
      ? props.theme.colorsThemed.text.primary
      : props.theme.colorsThemed.accent.yellow};
`;

const STotalEarnedText = styled.div`
  font-size: 14px;
`;

const SBundles = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  margin-bottom: -16px;
`;

const SBundle = styled.div`
  width: 100%;
  margin: 0 0 16px;
  padding: 16px;
  border-radius: ${(props) => props.theme.borderRadius.medium};
  background: ${(props) => props.theme.colorsThemed.background.tertiary};
  color: ${(props) => props.theme.colorsThemed.text.primary};
  height: 130px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  ${(props) => props.theme.media.tablet} {
    width: 24%;
  }
`;

const SBundleTitle = styled.div`
  color: ${({ theme }) =>
    theme.name === 'light'
      ? theme.colorsThemed.text.primary
      : theme.colorsThemed.text.secondary};
  font-size: 16px;
`;

interface ISBundlePrice {
  isBundlesEnabled?: boolean;
}
const SBundlePrice = styled.div<ISBundlePrice>`
  color: ${(props) =>
    props.theme.name === 'light'
      ? props.theme.colorsThemed.text.primary
      : props.isBundlesEnabled
      ? props.theme.colorsThemed.text.primary
      : props.theme.colorsThemed.accent.yellow};
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 4px;
`;
