import React, { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import styled from 'styled-components';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';

import copyIcon from '../../../../public/images/svg/icons/outlined/Link.svg';
import Button from '../../../atoms/Button';
import { useAppSelector } from '../../../../redux-store/store';
import InlineSvg from '../../../atoms/InlineSVG';
import assets from '../../../../constants/assets';

export const NoResults = () => {
  const { t } = useTranslation('page-Creator');
  const user = useAppSelector((state) => state.user);
  const [isCopiedUrl, setIsCopiedUrl] = useState(false);
  const [linkText, setLinkText] = useState('');

  useEffect(() => {
    if (linkText.length < 1 && window && user.userData?.username) {
      setLinkText(`${window.location.host}/${user.userData?.username}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        <Image
          src={assets.subscription.subDm}
          alt={t('noResults.title')}
          width={108}
          height={96}
        />
        <SText>{t('noResults.text')}</SText>
        <SButton view='quaternary' onClick={shareHandler}>
          <SInlineSvg svg={copyIcon} width='24px' height='24px' />
          {isCopiedUrl ? t('dashboard.subscriptionStats.copied') : linkText}
        </SButton>
      </SWrapper>
      <SUpdateSubs>
        {user.creatorData?.options?.isCreatorConnectedToStripe ? (
          <Link href='/creator/subscribers/edit-subscription-rate'>
            {t('noResults.updateSub')}
          </Link>
        ) : (
          <Link href='/creator/get-paid'>{t('noResults.updateSub')}</Link>
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
  color: ${(props) =>
    props.theme.name !== 'light'
      ? props.theme.colorsThemed.text.tertiary
      : '#586070'};
  font-size: 14px;
`;

const SWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: auto 0;
`;

const SText = styled.p`
  padding-top: 10px;
  margin-bottom: 24px;
  white-space: pre-wrap;
`;

const SUpdateSubs = styled.p`
  margin-top: auto;
  padding-top: 20px;
  a {
    color: ${(props) => props.theme.colorsThemed.text.secondary};
  }
`;

const SButton = styled(Button)`
  border-radius: 24px;
  min-width: 218px;
  font-weight: 600;
  color: ${(props) => props.theme.colorsThemed.accent.blue};
  height: 56px;
  span {
    display: flex;
  }
`;

const SInlineSvg = styled(InlineSvg)`
  margin-right: 7px;
`;
