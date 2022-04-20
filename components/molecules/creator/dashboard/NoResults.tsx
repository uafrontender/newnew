import React, { useCallback, useState } from 'react';
import Image from 'next/image';
import styled from 'styled-components';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';

import emptyFolder from '../../../../public/images/dashboard/empty-folder.png';
import Button from '../../../atoms/Button';
import { useAppSelector } from '../../../../redux-store/store';

interface INoResults {
  isCreatorConnectedToStripe: boolean | undefined;
}

export const NoResults: React.FC<INoResults> = ({ isCreatorConnectedToStripe }) => {
  const { t } = useTranslation('creator');
  const user = useAppSelector((state) => state.user);
  const [isCopiedUrl, setIsCopiedUrl] = useState(false);

  async function copyPostUrlToClipboard(url: string) {
    if ('clipboard' in navigator) {
      await navigator.clipboard.writeText(url);
    } else {
      document.execCommand('copy', true, url);
    }
  }

  const shareHandler = useCallback(() => {
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
      <SWrapper>
        <Image src={emptyFolder} alt={t('noResults.title')} width={49} height={48} />
        <STitle>{t('noResults.title')}</STitle>
        <SText>{t('noResults.text')}</SText>
        <Button view="primaryGrad" onClick={shareHandler}>
          {isCopiedUrl ? t('dashboard.subscriptionStats.copied') : t('noResults.btnShare')}
        </Button>
      </SWrapper>
      <SUpdateSubs>
        {isCreatorConnectedToStripe ? (
          <Link href="/creator/subscribers/edit-subscription-rate">{t('noResults.updateSub')}</Link>
        ) : (
          <Link href="/creator/get-paid">{t('noResults.updateSub')}</Link>
        )}
      </SUpdateSubs>
    </SContainer>
  );
};

export default NoResults;

const SContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 270px);
  color: ${(props) => (props.theme.name !== 'light' ? props.theme.colorsThemed.text.tertiary : '#586070')};
  font-size: 14px;
`;

const STitle = styled.strong`
  color: ${(props) => props.theme.colorsThemed.text.primary};
  font-weight: 700;
  font-size: 20px;
  margin: 16px 0 6px;
  line-height: 28px;
`;

const SWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: auto 0;
`;

const SText = styled.p`
  margin-bottom: 24px;
`;

const SUpdateSubs = styled.p`
  margin-top: auto;
  a {
    color: ${(props) => props.theme.colorsThemed.text.secondary};
  }
`;
