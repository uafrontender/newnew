import React, { useCallback, useState } from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';

import Button from '../../../atoms/Button';
import Headline from '../../../atoms/Headline';
import { useAppSelector } from '../../../../redux-store/store';

export const EmptySubscriptionStats = () => {
  const { t } = useTranslation('page-Creator');
  const user = useAppSelector((state) => state.user);
  const [isCopiedUrl, setIsCopiedUrl] = useState(false);

  async function copyPostUrlToClipboard(url: string) {
    if ('clipboard' in navigator) {
      await navigator.clipboard.writeText(url);
    } else {
      document.execCommand('copy', true, url);
    }
  }

  const handlerCopy = useCallback(() => {
    if (window && user.userData?.username) {
      const url = `${window.location.origin}/${user.userData?.username}`;

      copyPostUrlToClipboard(url)
        .then(() => {
          setIsCopiedUrl(true);
          setTimeout(() => {
            setIsCopiedUrl(false);
          }, 1500);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [user.userData?.username]);

  return (
    <SContainer>
      <SHeaderLine>
        <STitle variant={6}>{t('dashboard.subscriptionStats.title')}</STitle>
      </SHeaderLine>
      <SContent>{t('dashboard.subscriptionStats.noSubs')}</SContent>
      <SButton view='primaryGrad' onClick={handlerCopy} disabled={isCopiedUrl}>
        {isCopiedUrl
          ? t('dashboard.subscriptionStats.copied')
          : t('dashboard.subscriptionStats.copyLink')}
      </SButton>
    </SContainer>
  );
};

export default EmptySubscriptionStats;

const SContainer = styled.div`
  left: -16px;
  width: calc(100% + 32px);
  padding: 16px;
  display: flex;
  position: relative;
  background: ${(props) =>
    props.theme.name === 'light'
      ? props.theme.colorsThemed.background.primary
      : props.theme.colorsThemed.background.secondary};
  flex-direction: column;

  ${(props) => props.theme.media.tablet} {
    left: unset;
    width: 100%;
    padding: 24px;
    border-radius: 24px;
  }
`;

const STitle = styled(Headline)``;

const SHeaderLine = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  flex-direction: row;
  justify-content: space-between;

  ${(props) => props.theme.media.tablet} {
    margin-bottom: 10px;
  }

  ${(props) => props.theme.media.laptop} {
    margin-bottom: 18px;
  }
`;

const SContent = styled.div`
  font-size: 16px;
  text-align: center;
  padding: 6px 0 24px;
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};
`;

const SButton = styled(Button)`
  margin: 0 auto;
`;
