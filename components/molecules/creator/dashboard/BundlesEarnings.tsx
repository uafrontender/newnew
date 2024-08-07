/* eslint-disable no-nested-ternary */
import React, { useCallback, useEffect, useState, useRef } from 'react';
import styled, { css } from 'styled-components';
import { newnewapi } from 'newnew-api';
import { useTranslation } from 'next-i18next';
import Headline from '../../../atoms/Headline';
import Text from '../../../atoms/Text';
import { getMyBundleEarnings } from '../../../../api/endpoints/bundles';
import { formatNumber } from '../../../../utils/format';
import { useGetAppConstants } from '../../../../contexts/appConstantsContext';
import Loader from '../../../atoms/Loader';

interface IFunctionProps {
  isBundlesEnabled: boolean;
}

export const BundlesEarnings: React.FC<IFunctionProps> = React.memo(
  ({ isBundlesEnabled }) => {
    const { t } = useTranslation('page-Creator');
    const [totalEarned, setTotalEarned] = useState(0);
    const loading = useRef(false);
    const [isLoading, setIsLoading] = useState(false);
    const { appConstants } = useGetAppConstants();
    const [myEarnings, setMyEarnings] = useState<
      newnewapi.GetMyBundleEarningsResponse | undefined
    >();

    useEffect(() => {
      async function fetchMyEarnings() {
        try {
          setIsLoading(true);
          loading.current = true;
          const payload = new newnewapi.GetMyBundleEarningsRequest();
          const res = await getMyBundleEarnings(payload);

          if (!res?.data || res.error) {
            throw new Error(res?.error?.message ?? 'Request failed');
          }

          setMyEarnings(res.data);

          if (res.data.totalBundleEarnings?.usdCents) {
            setTotalEarned(res.data.totalBundleEarnings.usdCents);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setIsLoading(false);
          loading.current = false;
        }
      }

      if (loading.current) {
        return;
      }

      fetchMyEarnings();
    }, []);

    const renderListItem = useCallback(
      (item: newnewapi.IBundleOffer) => {
        let soldBundle;
        if (myEarnings?.soldBundles && myEarnings?.soldBundles.length > 0) {
          soldBundle = myEarnings?.soldBundles.find(
            (el) => el.pricePerUnit?.usdCents === item.price?.usdCents
          );
        }
        const price = soldBundle?.pricePerUnit?.usdCents
          ? soldBundle.pricePerUnit?.usdCents
          : item.price?.usdCents!!;
        const quantitySold = soldBundle?.quantitySold
          ? soldBundle.quantitySold
          : 0;
        const totalEarnings = soldBundle?.totalEarnings?.usdCents
          ? soldBundle.totalEarnings?.usdCents
          : 0;

        return (
          <SBundle
            id={`${price}-bundle-earnings`}
            key={`superpoll-bundle-${price}`}
          >
            <div>
              <SBundleTitle>
                $
                {`${formatNumber(price / 100 ?? 0, true)} ${t(
                  'myBundles.earnings.unitName'
                )}`}
              </SBundleTitle>
              <SText id={`${price}-bundle-sold`} variant={3}>
                {`${quantitySold} ${t('myBundles.earnings.sold')}`}
              </SText>
            </div>
            <div>
              <SBundlePrice isBundlesEnabled={isBundlesEnabled}>
                ${formatNumber(totalEarnings / 100 ?? 0, false)}
              </SBundlePrice>
              <SText variant={3}>{t('myBundles.earnings.earned')}</SText>
            </div>
          </SBundle>
        );
      },
      [isBundlesEnabled, t, myEarnings?.soldBundles]
    );

    return (
      <SBlock>
        <SHeaderLine>
          <STitle variant={6}>{t('myBundles.earnings.title')}</STitle>
        </SHeaderLine>
        {!myEarnings?.soldBundles && !isLoading && (
          <SNoEarnings>
            <SText variant={3}>{t('myBundles.earnings.noSoldYet')}</SText>
          </SNoEarnings>
        )}
        {myEarnings?.soldBundles && !isLoading && (
          <>
            <STotal>
              <STotalEarned
                id='total-bundle-earnings'
                isBundlesEnabled={isBundlesEnabled}
              >
                ${formatNumber(totalEarned / 100 ?? 0, false)}
              </STotalEarned>
              <STotalEarnedText>
                {t('myBundles.earnings.payPeriod')}
              </STotalEarnedText>
            </STotal>
            <SBundles>
              {appConstants.bundleOffers?.map(renderListItem)}
            </SBundles>
          </>
        )}
        {isLoading && (
          <SLoaderWrapper>
            <Loader size='md' />
          </SLoaderWrapper>
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
  position: relative;
  padding: 24px;

  background: ${({ theme }) =>
    theme.name === 'light'
      ? theme.colorsThemed.background.primary
      : theme.colorsThemed.background.secondary};
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
  /* align-items: center; */
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
      : !props.isBundlesEnabled
      ? props.theme.colorsThemed.text.primary
      : props.theme.colorsThemed.accent.yellow};
`;

const STotalEarnedText = styled.div`
  font-size: 14px;
`;

const SBundles = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-bottom: -16px;
  justify-content: space-between;
`;

const SBundle = styled.div`
  width: 49%;
  margin: 0 0 16px 0;
  padding: 16px;
  border-radius: ${(props) => props.theme.borderRadius.medium};
  background: ${(props) => props.theme.colorsThemed.background.tertiary};
  color: ${(props) => props.theme.colorsThemed.text.primary};
  height: 148px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  ${(props) => props.theme.media.tablet} {
    width: 24%;
  }
`;

const SBundleTitle = styled.div`
  color: ${({ theme }) => theme.colorsThemed.text.primary};
  font-size: 16px;
  margin-bottom: 4px;
`;

interface ISBundlePrice {
  isBundlesEnabled?: boolean;
}
const SBundlePrice = styled.div<ISBundlePrice>`
  color: ${(props) =>
    props.theme.name === 'light'
      ? props.theme.colorsThemed.text.primary
      : !props.isBundlesEnabled
      ? props.theme.colorsThemed.text.primary
      : props.theme.colorsThemed.accent.yellow};
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 4px;
`;

const SLoaderWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`;
