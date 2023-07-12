import React, { useCallback, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useTranslation } from 'next-i18next';
import styled, { useTheme } from 'styled-components';
import { newnewapi } from 'newnew-api';
import Link from 'next/link';
import Text from '../../../atoms/Text';
import Button from '../../../atoms/Button';
import Caption from '../../../atoms/Caption';
import Headline from '../../../atoms/Headline';
import InlineSVG from '../../../atoms/InlineSVG';
import UserAvatar from '../../UserAvatar';

import shareIcon from '../../../../public/images/svg/icons/filled/Share.svg';
import { formatNumber } from '../../../../utils/format';
import { Mixpanel } from '../../../../utils/mixpanel';
import { useAppState } from '../../../../contexts/appStateContext';
import PostTitleContent from '../../../atoms/PostTitleContent';

const ResponseTimer = dynamic(
  () => import('../../../atoms/dashboard/ResponseTimer')
);

interface IExpirationPosts {
  expirationPosts: newnewapi.IPost[];
}

export const ExpirationPosts: React.FC<IExpirationPosts> = ({
  expirationPosts,
}) => {
  const { t } = useTranslation('page-Creator');
  const theme = useTheme();
  const { resizeMode } = useAppState();
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );
  const isTablet = ['tablet'].includes(resizeMode);
  const isDesktop = !isMobile && !isTablet;

  const [isCopiedUrlIndex, setIsCopiedUrlIndex] = useState<number | null>(null);
  const linkCopiedTimerRef = useRef<NodeJS.Timeout | undefined>();

  const getAmountValue = (
    data: newnewapi.Auction | newnewapi.Crowdfunding | newnewapi.MultipleChoice
  ) => {
    let centsQty = 0;

    const localData = data as
      | newnewapi.MultipleChoice
      | newnewapi.Crowdfunding
      | newnewapi.Auction;

    if (localData.totalAmount?.usdCents) {
      centsQty = localData.totalAmount.usdCents;
    }

    return `$${formatNumber(centsQty / 100 ?? 0, false)}`;
  };

  const copyPostUrlToClipboard = useCallback(async (url: string) => {
    if ('clipboard' in navigator) {
      await navigator.clipboard.writeText(url);
    } else {
      document.execCommand('copy', true, url);
    }
  }, []);

  const renderItem = useCallback(
    (item: newnewapi.IPost, index: number) => {
      const postType = Object.keys(item)[0];
      const data = Object.values(item)[0] as
        | newnewapi.Auction
        | newnewapi.Crowdfunding
        | newnewapi.MultipleChoice;

      const handleShareClick = () => {
        if (window) {
          const url = `${window.location.origin}/p/${
            data.postShortId ? data.postShortId : data.postUuid
          }`;

          copyPostUrlToClipboard(url)
            .then(() => {
              setIsCopiedUrlIndex(index);

              if (linkCopiedTimerRef.current) {
                clearTimeout(linkCopiedTimerRef.current);
              }

              linkCopiedTimerRef.current = setTimeout(() => {
                setIsCopiedUrlIndex(null);
              }, 1000);
            })
            .catch((err) => {
              console.log(err);
            });
        }
      };

      const money = getAmountValue(data);

      const imageUrl =
        data.announcement?.coverImageUrl ??
        data.announcement?.thumbnailImageUrl;

      return (
        <SListItemWrapper key={data.postUuid}>
          <SListItem>
            {isDesktop || isTablet ? (
              <>
                <SListBodyItem width='calc(100% - 350px)' align='flex-start'>
                  {imageUrl ? <SImg src={imageUrl} alt='' /> : <SAvatar />}
                  <SListItemTitleWrapper>
                    <SListItemTitle variant={3} weight={600}>
                      <PostTitleContent>{data.title}</PostTitleContent>
                    </SListItemTitle>
                    <SListItemDate variant={2} weight={600}>
                      <ResponseTimer
                        timestampSeconds={new Date(
                          (data.responseUploadDeadline?.seconds as number) *
                            1000
                        ).getTime()}
                      />
                    </SListItemDate>
                  </SListItemTitleWrapper>
                </SListBodyItem>

                <SListBodyItem width='100px' align='flex-start'>
                  <SListBodyItemText variant={3} weight={600}>
                    {t(
                      `dashboard.expirationPosts.postTypes.${postType}` as any
                    )}
                  </SListBodyItemText>
                </SListBodyItem>

                <SListBodyItem width='100px' align='flex-start'>
                  <SListBodyItemText variant={3} weight={600}>
                    {money}
                  </SListBodyItemText>
                </SListBodyItem>

                <SListBodyItem width='150px' align='center'>
                  <Link
                    href={`/p/${
                      data.postShortId ? data.postShortId : data.postUuid
                    }`}
                  >
                    <a>
                      <SListDecideButton
                        view='primary'
                        onClick={() => {
                          Mixpanel.track('Navigation Item Clicked', {
                            _stage: 'Dashboard',
                            _button: 'Response Now',
                            _target: `/p/${
                              data.postShortId
                                ? data.postShortId
                                : data.postUuid
                            }`,
                            _postUuid: data.postUuid,
                          });
                        }}
                      >
                        {t('dashboard.expirationPosts.decide.desktop')}
                      </SListDecideButton>
                    </a>
                  </Link>
                </SListBodyItem>
              </>
            ) : (
              <>
                {!data.announcement?.thumbnailImageUrl ? (
                  <SAvatar />
                ) : (
                  <SImg
                    src={
                      data.announcement?.thumbnailImageUrl
                        ? data.announcement?.thumbnailImageUrl
                        : ''
                    }
                    alt=''
                  />
                )}
                <SListItemTitleWrapper>
                  <SListItemTitle variant={3} weight={600}>
                    <PostTitleContent>{data.title}</PostTitleContent>
                  </SListItemTitle>
                  <SListItemDate variant={2} weight={600}>
                    <ResponseTimer
                      timestampSeconds={new Date(
                        (data.responseUploadDeadline?.seconds as number) * 1000
                      ).getTime()}
                    />
                  </SListItemDate>
                </SListItemTitleWrapper>
                <SListShareButton view='secondary' onClick={handleShareClick}>
                  {isCopiedUrlIndex === index ? (
                    t('dashboard.expirationPosts.linkCopied')
                  ) : (
                    <InlineSVG
                      svg={shareIcon}
                      fill={theme.colorsThemed.text.primary}
                      width='20px'
                      height='20px'
                    />
                  )}
                </SListShareButton>
                <Link
                  href={`/p/${
                    data.postShortId ? data.postShortId : data.postUuid
                  }`}
                >
                  <a>
                    <SListDecideButton view='primary'>
                      {t('dashboard.expirationPosts.decide.mobile')}
                    </SListDecideButton>
                  </a>
                </Link>
              </>
            )}
          </SListItem>
          {index !== expirationPosts.length - 1 && <SListItemSeparator />}
        </SListItemWrapper>
      );
    },

    [
      isTablet,
      isDesktop,
      expirationPosts.length,
      theme.colorsThemed.text.primary,
      isCopiedUrlIndex,
      copyPostUrlToClipboard,
      t,
    ]
  );

  return (
    <SContainer>
      <SHeaderLine>
        <STitle variant={6}>{t('dashboard.expirationPosts.title')}</STitle>
      </SHeaderLine>
      <SListWrapper>
        {isDesktop && (
          <>
            <SListHeader>
              <SListHeaderItem
                width='calc(100% - 350px)'
                align='start'
                weight={600}
                variant={2}
              >
                {t('dashboard.expirationPosts.table.header.post')}
              </SListHeaderItem>
              <SListHeaderItem
                width='100px'
                align='start'
                weight={600}
                variant={2}
              >
                {t('dashboard.expirationPosts.table.header.type')}
              </SListHeaderItem>
              <SListHeaderItem
                width='100px'
                align='start'
                weight={600}
                variant={2}
              >
                {t('dashboard.expirationPosts.table.header.total')}
              </SListHeaderItem>
              <SListHeaderItem
                width='150px'
                align='center'
                weight={600}
                variant={2}
              >
                {' '}
              </SListHeaderItem>
            </SListHeader>
            <SListItemSeparator />
          </>
        )}
        {expirationPosts.map(renderItem)}
      </SListWrapper>
    </SContainer>
  );
};

export default ExpirationPosts;

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
  overflow: hidden;

  ${(props) => props.theme.media.tablet} {
    left: unset;
    padding: 24px;
    border-radius: 24px;
    width: 100%;
  }

  ${(props) => props.theme.media.laptop} {
    background: ${(props) =>
      props.theme.name === 'light'
        ? props.theme.colors.white
        : props.theme.colorsThemed.background.secondary};
  }
`;

const STitle = styled(Headline)`
  font-weight: 600;
`;

const SHeaderLine = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  flex-direction: row;
  justify-content: space-between;

  ${(props) => props.theme.media.tablet} {
    margin-bottom: 12px;
  }

  ${(props) => props.theme.media.laptop} {
    margin-bottom: 14px;
  }
`;

const SListWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const SListHeader = styled.div`
  display: flex;
  flex-direction: row;
`;

interface ISListHeaderItem {
  width: string;
  align: string;
}

const SListHeaderItem = styled(Caption)<ISListHeaderItem>`
  width: ${(props) => props.width};
  color: ${(props) => props.theme.colorsThemed.text.tertiary};
  max-width: ${(props) => props.width};
  text-align: ${(props) => props.align};
`;

const SListBodyItem = styled.div<ISListHeaderItem>`
  width: ${(props) => props.width};
  display: flex;
  max-width: ${(props) => props.width};
  align-items: center;
  flex-direction: row;
  justify-content: ${(props) => props.align};
`;

const SListBodyItemText = styled(Text)``;

const SListItem = styled.div`
  padding: 4px 0;
  display: flex;
  align-items: center;
  flex-direction: row;
`;

const SImg = styled.img`
  width: 36px;
  height: 36px;
  min-width: 36px;
  min-height: 36px;
  border-radius: 12px;

  object-fit: cover;
  object-position: top;

  ${(props) => props.theme.media.laptop} {
    width: 48px;
    height: 48px;
    min-width: 48px;
    min-height: 48px;
    border-radius: 16px;
  }
`;

const SAvatar = styled(UserAvatar)`
  width: 36px;
  height: 36px;
  min-width: 36px;
  min-height: 36px;
  border-radius: 12px;

  ${(props) => props.theme.media.laptop} {
    width: 48px;
    height: 48px;
    min-width: 48px;
    min-height: 48px;
    border-radius: 16px;
  }
`;

const SListItemTitleWrapper = styled.div`
  width: 100%;
  display: flex;
  padding: 0 12px;
  flex-direction: column;
  overflow: hidden;

  ${(props) => props.theme.media.laptop} {
    width: calc(100% - 48px);
    padding: 0 20px 0 12px;
  }
`;

const SListItemTitle = styled(Text)`
  overflow: hidden;
  white-space: nowrap;
  margin-bottom: 4px;
  text-overflow: ellipsis;
`;

const SListItemDate = styled(Caption)`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: ${(props) => props.theme.colorsThemed.accent.pink};
`;

const SListShareButton = styled(Button)`
  padding: 8px;
  /* min-width: 36px; */
  margin-right: 12px;
  border-radius: 12px;
  overflow: visible;
  position: relative;
`;

// const SCopiedTooltip = styled.div`
//   position: absolute;
//   left: -25px;
//   top: -45px;
//   background: ${(props) =>
//     props.theme.name === 'light'
//       ? props.theme.colorsThemed.background.secondary
//       : props.theme.colorsThemed.background.tertiary};
//   border-radius: ${({ theme }) => theme.borderRadius.medium};
//   padding: 8px;
// `;

const SListDecideButton = styled(Button)`
  min-width: 94px;
`;

const SListItemSeparator = styled.div`
  height: 2px;
  margin: 8px 0;
  background: ${(props) => props.theme.colorsThemed.background.outlines1};
  border-radius: 2px;

  ${(props) => props.theme.media.laptop} {
    margin: 12px 0;
  }
`;

const SListItemWrapper = styled.div``;
