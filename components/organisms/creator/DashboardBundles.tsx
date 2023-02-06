/* eslint-disable no-nested-ternary */
import React, { useCallback, useState } from 'react';
import styled, { css } from 'styled-components';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import { newnewapi } from 'newnew-api';

import Headline from '../../atoms/Headline';
import { useAppSelector } from '../../../redux-store/store';
import Text from '../../atoms/Text';
import Button from '../../atoms/Button';
import { useGetAppConstants } from '../../../contexts/appConstantsContext';
import { Mixpanel } from '../../../utils/mixpanel';
import Loader from '../../atoms/Loader';
import { useBundles } from '../../../contexts/bundlesContext';

const Navigation = dynamic(() => import('../../molecules/creator/Navigation'));
const DynamicSection = dynamic(
  () => import('../../molecules/creator/dashboard/DynamicSection')
);
const BundlesEarnings = dynamic(
  () => import('../../molecules/creator/dashboard/BundlesEarnings')
);
const SuperpollBundle = dynamic(
  () => import('../../molecules/creator/dashboard/SuperpollBundle')
);
const TurnBundleModal = dynamic(
  () => import('../../molecules/creator/dashboard/TurnBundleModal')
);
const SuccessBundleModal = dynamic(
  () => import('../../molecules/creator/dashboard/SuccessBundleModal')
);

export const DashboardBundles: React.FC = React.memo(() => {
  const { t } = useTranslation('page-Creator');
  const { resizeMode } = useAppSelector((state) => state.ui);
  const { appConstants } = useGetAppConstants();
  const { isSellingBundles, toggleIsSellingBundles } = useBundles();

  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );

  const [turnBundleModalOpen, setTurnBundleModalOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);

  const toggleTurnBundleModalOpen = useCallback(() => {
    Mixpanel.track(
      turnBundleModalOpen
        ? 'Turn bundle Modal Closed'
        : 'Turn bundle Modal Opened',
      {
        _stage: 'Dashboard',
      }
    );
    setTurnBundleModalOpen((prevState) => !prevState);
  }, [turnBundleModalOpen]);

  const onToggleBundles = useCallback(async () => {
    toggleIsSellingBundles()
      .then(() => {
        setTurnBundleModalOpen(false);
        setSuccessModalOpen(true);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [toggleIsSellingBundles]);

  const renderListItem = useCallback(
    (item: newnewapi.IBundleOffer, index: number) => (
      <SuperpollBundle
        key={`superpoll-bundle-${index + 1}`}
        id={index}
        bundleOffer={item}
        isBundlesEnabled={!!isSellingBundles}
      />
    ),
    [isSellingBundles]
  );

  return (
    <SContainer>
      {!isMobile && <Navigation />}
      <SContent>
        <STitleBlock>
          <STitle variant={4}>{t('myBundles.title')}</STitle>
          {!isMobile && <DynamicSection baseUrl='/creator/bundles' />}
        </STitleBlock>
        {isSellingBundles === undefined ? (
          <SLoader size='md' />
        ) : (
          <>
            {isSellingBundles && (
              <BundlesEarnings isBundlesEnabled={isSellingBundles} />
            )}
            <SBlock>
              <SHeaderLine>
                <STextHolder>
                  <STitle variant={6}>{t('myBundles.bundlesSet.title')}</STitle>
                  <SText variant={3}>
                    {t('myBundles.bundlesSet.subTitle')}
                  </SText>
                </STextHolder>
                <SButton
                  id='turn-on-bundles-button'
                  view={isSellingBundles ? 'quaternary' : 'brandYellow'}
                  onClick={toggleTurnBundleModalOpen}
                  enabled={isSellingBundles}
                  disabled={isSellingBundles === undefined}
                >
                  {isSellingBundles
                    ? t('myBundles.buttonTurnOff')
                    : t('myBundles.buttonTurnOn')}
                </SButton>
              </SHeaderLine>
              <SBundles>
                {appConstants.bundleOffers?.map(renderListItem)}
              </SBundles>
            </SBlock>
            {!isSellingBundles && (
              <BundlesEarnings isBundlesEnabled={isSellingBundles} />
            )}
          </>
        )}
      </SContent>
      {turnBundleModalOpen && (
        <TurnBundleModal
          show
          zIndex={1001}
          isBundlesEnabled={isSellingBundles}
          onToggleBundles={onToggleBundles}
          onClose={toggleTurnBundleModalOpen}
        />
      )}
      {successModalOpen && (
        <SuccessBundleModal
          show
          zIndex={1002}
          isBundlesEnabled={isSellingBundles}
          onClose={() => setSuccessModalOpen(false)}
        />
      )}
    </SContainer>
  );
});

export default DashboardBundles;

const SContainer = styled.div`
  position: relative;
  margin-top: -16px;

  ${(props) => props.theme.media.tablet} {
    margin-top: unset;
  }

  ${(props) => props.theme.media.laptop} {
    margin-top: -40px;
    margin-bottom: -40px;
  }
`;

const SContent = styled.div`
  position: relative;
  min-height: calc(100vh - 120px);

  ${(props) => props.theme.media.tablet} {
    margin-left: 180px;
  }

  ${(props) => props.theme.media.laptop} {
    width: calc(100vw - 320px);
    padding: 40px 32px;
    background: ${(props) => props.theme.colorsThemed.background.tertiary};
    margin-left: 224px;
    border-top-left-radius: 24px;
  }
`;

const STitle = styled(Headline)``;
const SText = styled(Text)`
  margin-top: 8px;
  color: ${(props) => props.theme.colorsThemed.text.secondary};
`;

const STitleBlock = styled.section`
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  flex-direction: row;
  justify-content: space-between;
`;

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
  flex-direction: row;
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

const STextHolder = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
  ${(props) => props.theme.media.tablet} {
    margin-bottom: 0;
  }
`;

interface ISButton {
  enabled?: boolean;
}
const SButton = styled(Button)<ISButton>`
  width: 100%;
  margin-left: 0;
  padding: 16px 20px;

  ${(props) => props.theme.media.tablet} {
    width: unset;
    padding: 12px 24px;
    margin-left: 10px;
  }
`;

const SBundles = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  margin-bottom: -16px;
`;

const SLoader = styled(Loader)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  ${(props) => props.theme.media.laptopL} {
    transform: translate(calc(-50% - 218px), -50%);
  }
`;
