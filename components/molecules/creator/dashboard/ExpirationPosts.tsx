/* eslint-disable no-unused-expressions */
/* eslint-disable prefer-template */
import React, { useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useTranslation } from 'next-i18next';
import styled, { useTheme } from 'styled-components';
import { newnewapi } from 'newnew-api';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Text from '../../../atoms/Text';
import Button from '../../../atoms/Button';
import Caption from '../../../atoms/Caption';
import Headline from '../../../atoms/Headline';
import InlineSVG from '../../../atoms/InlineSVG';
import UserAvatar from '../../UserAvatar';

import { useAppSelector } from '../../../../redux-store/store';

import shareIcon from '../../../../public/images/svg/icons/filled/Share.svg';
import { formatNumber } from '../../../../utils/format';

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
  const { resizeMode } = useAppSelector((state) => state.ui);

  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );
  const isTablet = ['tablet'].includes(resizeMode);
  const isDesktop = !isMobile && !isTablet;
  const router = useRouter();

  const [posts, setPosts] = useState<newnewapi.IPost[]>([]);

  useEffect(() => {
    if (expirationPosts) {
      // eslint-disable-next-line no-param-reassign
      if (expirationPosts.length > 3) expirationPosts.length = 3;
      setPosts(expirationPosts);
    }
  }, [expirationPosts]);

  const getAmountValue = (
    postType: string,
    data: newnewapi.Auction | newnewapi.Crowdfunding | newnewapi.MultipleChoice
  ) => {
    let centsQty = 0;

    if (postType === 'multipleChoice') {
      const localData = data as newnewapi.MultipleChoice;
      if (localData.votePrice?.usdCents) {
        centsQty = localData.totalVotes * localData.votePrice.usdCents;
      }
    } else {
      const localData = data as newnewapi.Crowdfunding | newnewapi.Auction;
      if (localData.totalAmount?.usdCents) {
        centsQty = localData.totalAmount.usdCents;
      }
    }
    return `$${formatNumber(centsQty / 100 ?? 0, false)}`;
  };

  async function copyPostUrlToClipboard(url: string) {
    if ('clipboard' in navigator) {
      await navigator.clipboard.writeText(url);
    } else {
      document.execCommand('copy', true, url);
    }
  }

  const renderItem = useCallback(
    (item: newnewapi.IPost, index: number) => {
      const postType = Object.keys(item)[0];
      const data = Object.values(item)[0] as
        | newnewapi.Auction
        | newnewapi.Crowdfunding
        | newnewapi.MultipleChoice;

      const handleShareClick = () => {
        let url;
        if (window) {
          url = `${window.location.origin}/post/${data.postUuid}`;
          copyPostUrlToClipboard(url);
        }
      };

      const money = getAmountValue(postType, data);

      return (
        <SListItemWrapper key={data.postUuid}>
          <SListItem>
            {isDesktop || isTablet ? (
              <>
                <SListBodyItem width='calc(100% - 350px)' align='flex-start'>
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
                      {data.title}
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
                    {t(`dashboard.expirationPosts.postTypes.${postType}`)}
                  </SListBodyItemText>
                </SListBodyItem>

                <SListBodyItem width='100px' align='flex-start'>
                  <SListBodyItemText variant={3} weight={600}>
                    {money}
                  </SListBodyItemText>
                </SListBodyItem>

                <SListBodyItem width='150px' align='center'>
                  <Link href={`/post/${data.postUuid}`}>
                    <a>
                      <SListDecideButton view='primary'>
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
                    {data.title}
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
                  <InlineSVG
                    svg={shareIcon}
                    fill={theme.colorsThemed.text.primary}
                    width='20px'
                    height='20px'
                  />
                </SListShareButton>
                <Link href={`/post/${data.postUuid}`}>
                  <a>
                    <SListDecideButton view='primary'>
                      {t('dashboard.expirationPosts.decide.mobile')}
                    </SListDecideButton>
                  </a>
                </Link>
              </>
            )}
          </SListItem>
          {index !== posts.length - 1 && <SListItemSeparator />}
        </SListItemWrapper>
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      t,
      isMobile,
      isDesktop,
      posts.length,
      theme.colorsThemed.text.primary,
      router,
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
        {posts.map(renderItem)}
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
  min-width: 36px;
  margin-right: 12px;
  border-radius: 12px;
  overflow: visible;
`;

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
