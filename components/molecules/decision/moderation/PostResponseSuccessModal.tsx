import React, { useCallback, useMemo, useState } from 'react';
import styled, { useTheme } from 'styled-components';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';

import { useAppSelector } from '../../../../redux-store/store';
import { Mixpanel } from '../../../../utils/mixpanel';

import Text from '../../../atoms/Text';
import Button from '../../../atoms/Button';
import Headline from '../../../atoms/Headline';
import InlineSvg from '../../../atoms/InlineSVG';
import Modal from '../../../organisms/Modal';
import AnimatedBackground from '../../../atoms/AnimationBackground';

import assets from '../../../../constants/assets';
import CancelIcon from '../../../../public/images/svg/icons/outlined/Close.svg';
import CopyLinkIcon from '../../../../public/images/svg/icons/outlined/Link.svg';
import { usePostInnerState } from '../../../../contexts/postInnerContext';

interface IPostResponseSuccessModal {
  isOpen: boolean;
  zIndex: number;
  amount: string;
}

const PostResponseSuccessModal: React.FunctionComponent<
  IPostResponseSuccessModal
> = ({ amount, isOpen, zIndex }) => {
  const theme = useTheme();
  const router = useRouter();
  const { t: tCommon } = useTranslation('common');
  const { t } = useTranslation('modal-ResponseSuccessModal');
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );

  const { postParsed } = usePostInnerState();
  const postShortId = useMemo(() => postParsed?.postShortId, [postParsed]);
  const postUuid = useMemo(() => postParsed?.postUuid, [postParsed]);

  const [isCopiedUrl, setIsCopiedUrl] = useState(false);

  async function copyPostUrlToClipboard(url: string) {
    if ('clipboard' in navigator) {
      await navigator.clipboard.writeText(url);
    } else {
      document.execCommand('copy', true, url);
    }
  }

  const handlerCopy = useCallback(() => {
    if (window) {
      const url = `${window.location.origin}/p/${postShortId || postUuid}`;
      Mixpanel.track('Copy Link Post', {
        _stage: 'Post',
        _postUuid: postUuid,
      });
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
  }, [postShortId, postUuid]);

  const handleGoToDashboard = () => {
    router?.push('/creator/dashboard', undefined, {
      scroll: true,
    });
  };

  return (
    <Modal show={isOpen} additionalz={zIndex}>
      {!isMobile && (
        <AnimatedBackground src={assets.decision.gold} alt='coin' noBlur />
      )}
      {!isMobile && (
        <SCloseButton
          view='secondary'
          iconOnly
          onClick={() => handleGoToDashboard()}
        >
          <InlineSvg
            svg={CancelIcon}
            fill={theme.colorsThemed.text.primary}
            width='24px'
            height='24px'
          />
        </SCloseButton>
      )}
      <SWrapper>
        <SContentContainer>
          {isMobile && (
            <SCloseButton
              view='secondary'
              iconOnly
              onClick={() => handleGoToDashboard()}
            >
              <InlineSvg
                svg={CancelIcon}
                fill={theme.colorsThemed.text.primary}
                width='24px'
                height='24px'
              />
            </SCloseButton>
          )}
          <SHeadline variant={4}>{t('header')}</SHeadline>
          <SText variant={2} weight={500}>
            {t('youMade')}
          </SText>
          <SHeadline id='earned-amount' variant={1}>
            {amount}
          </SHeadline>
          <SMakeAnotherPostButton>
            <Link href='/creation' scroll>
              <a href='/creation'>
                <SCoinImage src={assets.decision.gold} />
                <SButtonText variant={2} weight={600}>
                  {t('makeNewPostButton')}
                </SButtonText>
                <SButtonSubtitle variant={3}>{t('subtitle')}</SButtonSubtitle>
              </a>
            </Link>
          </SMakeAnotherPostButton>
          <SCopyLinkButton
            onClick={(e) => {
              e.stopPropagation();
              handlerCopy();
            }}
          >
            <InlineSvg svg={CopyLinkIcon} width='24px' height='24px' />
            {isCopiedUrl
              ? tCommon('ellipse.linkCopied')
              : tCommon('ellipse.copyLink')}
          </SCopyLinkButton>
        </SContentContainer>
      </SWrapper>
    </Modal>
  );
};

export default PostResponseSuccessModal;

const SWrapper = styled.div`
  width: 100%;
  height: 100%;

  display: flex;
  justify-content: center;
  align-items: center;

  /* No select */
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
`;

const SContentContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  background-color: ${({ theme }) =>
    theme.name === 'dark'
      ? theme.colorsThemed.background.secondary
      : theme.colorsThemed.background.primary};

  padding: 16px;

  ${({ theme }) => theme.media.tablet} {
    width: 480px;
    height: fit-content;
    margin: auto;

    border-radius: ${({ theme }) => theme.borderRadius.medium};

    padding: 72px 48px;
  }
`;

const SHeadline = styled(Headline)`
  margin-top: 4px;
`;

const SText = styled(Text)`
  margin-top: 16px;

  color: ${({ theme }) => theme.colorsThemed.text.tertiary};
`;

const SMakeAnotherPostButton = styled.button`
  border: transparent;
  border-radius: 16px;

  margin-top: 24px;
  padding: 30px;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  width: 224px;

  background-color: ${({ theme }) => theme.colorsThemed.background.quaternary};

  cursor: pointer;
  transition: 0.2s linear;

  &:focus:enabled,
  &:active:enabled {
    outline: none;
  }

  &:hover {
    background-color: ${({ theme }) => theme.colorsThemed.background.quinary};
  }
`;

const SCoinImage = styled.img`
  object-fit: contain;

  width: 108px;
`;

const SButtonText = styled(Text)`
  color: ${({ theme }) => theme.colorsThemed.text.primary};
`;

const SButtonSubtitle = styled(Text)`
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};
`;

const SCloseButton = styled(Button)`
  position: absolute;
  right: 16px;
  top: 16px;

  display: flex;
  justify-content: flex-end;
  align-items: center;

  border: transparent;

  color: ${({ theme }) => theme.colorsThemed.text.primary};
  font-size: 20px;
  line-height: 28px;
  font-weight: bold;
  text-transform: capitalize;

  cursor: pointer;

  ${({ theme }) => theme.media.tablet} {
    right: 24px;
    top: 32px;
  }
`;

const SCopyLinkButton = styled.div`
  width: 224px;
  height: 48px;

  margin-top: 24px;

  display: flex;
  overflow: hidden;
  align-items: center;
  justify-content: center;
  gap: 4px;
  border-radius: 12px;
  background: ${(props) => props.theme.colorsThemed.social.copy.main};

  font-weight: bold;
  font-size: 14px;
  line-height: 24px;

  color: #ffffff;
  cursor: pointer;
`;
