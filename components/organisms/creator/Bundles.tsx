import React, { useCallback, useMemo, useState } from 'react';
import styled, { css } from 'styled-components';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';

import Headline from '../../atoms/Headline';
import { useAppSelector } from '../../../redux-store/store';
import Text from '../../atoms/Text';
import Button from '../../atoms/Button';

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

interface ISuperpollBundle {
  id: number;
  votes: string;
  months: string;
  price: string;
}

export const Bundles: React.FC = React.memo(() => {
  const { t } = useTranslation('page-Creator');
  const { resizeMode } = useAppSelector((state) => state.ui);

  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );

  const [isBundlesEnabled, setIsBundlesEnabled] = useState<boolean>(false);

  const toggleBundlesEnabled = useCallback(() => {
    setIsBundlesEnabled((prevState) => !prevState);
  }, []);

  const collection: ISuperpollBundle[] = useMemo(
    () => [
      {
        id: 1,
        votes: '100',
        months: '1',
        price: '5',
      },
      {
        id: 2,
        votes: '4,500',
        months: '3',
        price: '25',
      },
      {
        id: 3,
        votes: '10,000',
        months: '6',
        price: '50',
      },
      {
        id: 4,
        votes: '20,000',
        months: '12',
        price: '575',
      },
    ],
    []
  );

  const renderListItem = useCallback(
    (item: ISuperpollBundle) => (
      <SuperpollBundle
        key={`superpoll-bundle-${item.id}`}
        id={item.id}
        votes={item.votes}
        months={item.months}
        price={item.price}
      />
    ),
    []
  );

  return (
    <SContainer>
      {!isMobile && <Navigation />}
      <SContent>
        <STitleBlock>
          <STitle variant={4}>{t('myBundles.title')}</STitle>
          {!isMobile && <DynamicSection />}
        </STitleBlock>
        {isBundlesEnabled && <BundlesEarnings />}
        <SBlock>
          <SHeaderLine>
            <STextHolder>
              <STitle variant={6}>{t('myBundles.bundlesSet.title')}</STitle>
              <SText variant={3}>{t('myBundles.bundlesSet.subTitle')}</SText>
            </STextHolder>
            <SButton onClick={toggleBundlesEnabled} enabled={isBundlesEnabled}>
              {isBundlesEnabled
                ? t('myBundles.buttonTurnOff')
                : t('myBundles.buttonTurnOn')}
            </SButton>
          </SHeaderLine>
          {collection.map(renderListItem)}
        </SBlock>
        {!isBundlesEnabled && <BundlesEarnings />}
      </SContent>
    </SContainer>
  );
});

export default Bundles;

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
  background: ${(props) => props.theme.colorsThemed.background.secondary};
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
  justify-content: space-between;
  padding-bottom: 24px;

  ${(props) => props.theme.media.tablet} {
    margin-bottom: 14px;
  }

  ${(props) => props.theme.media.laptop} {
    margin-bottom: 18px;
  }
`;

const STextHolder = styled.div`
  display: flex;
  flex-direction: column;
`;

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
    !props.enabled ? props.theme.colors.darkGray : props.theme.colors.white};

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
        : props.theme.colors.white} !important;
  }
`;
