import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import styled, { useTheme } from 'styled-components';

import Text from '../../../atoms/Text';
import Button from '../../../atoms/Button';
import Caption from '../../../atoms/Caption';
import Headline from '../../../atoms/Headline';
import InlineSVG from '../../../atoms/InlineSVG';
import UserAvatar from '../../UserAvatar';

import { useAppSelector } from '../../../../redux-store/store';

import infoIcon from '../../../../public/images/svg/icons/filled/Info.svg';
import shareIcon from '../../../../public/images/svg/icons/filled/Share.svg';

export const ExpirationPosts = () => {
  const { t } = useTranslation('creator');
  const theme = useTheme();
  const user = useAppSelector((state) => state.user);
  const { resizeMode } = useAppSelector((state) => state.ui);

  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);
  const isTablet = ['tablet'].includes(resizeMode);
  const isDesktop = !isMobile && !isTablet;
  const collection = useMemo(() => ([
    {
      id: 1,
      title: 'Should I get a forehead',
      date: '15m 10s left',
      total: '$45.00',
      contributions: '120 bids',
    },
    {
      id: 2,
      title: 'Should I get a forehead',
      date: '15m 10s left',
      total: '$45.00',
      contributions: '120 bids',
    },
    {
      id: 3,
      title: 'Should I get a forehead',
      date: '15m 10s left',
      total: '$45.00',
      contributions: '120 bids',
    },
  ]), []);
  const renderItem = useCallback((item, index) => {
    const handleUserClick = () => {
    };
    const handleInfoClick = () => {
    };
    const handleDecideClick = () => {
    };

    return (
      <SListItemWrapper key={`item-expiration-${item.id}`}>
        <SListItem>
          {isDesktop ? (
            <>
              <SListBodyItem
                width="calc(100% - 300px)"
                align="flex-start"
              >
                <SAvatar
                  withClick
                  onClick={handleUserClick}
                  avatarUrl={user.userData?.avatarUrl}
                />
                <SListItemTitleWrapper>
                  <SListItemTitle variant={3} weight={600}>
                    {item.title}
                  </SListItemTitle>
                  <SListItemDate variant={2} weight={600}>
                    {item.date}
                  </SListItemDate>
                </SListItemTitleWrapper>
              </SListBodyItem>
              <SListBodyItem
                width="100px"
                align="flex-start"
              >
                <SListBodyItemText variant={3} weight={600}>
                  {item.total}
                </SListBodyItemText>
              </SListBodyItem>
              <SListBodyItem
                width="100px"
                align="flex-start"
              >
                <SListBodyItemText variant={3} weight={600}>
                  {item.contributions}
                </SListBodyItemText>
              </SListBodyItem>
              <SListBodyItem
                width="100px"
                align="center"
              >
                <SListDecideButton
                  view="secondary"
                  onClick={handleDecideClick}
                >
                  {t('dashboard.expirationPosts.decide')}
                </SListDecideButton>
              </SListBodyItem>
            </>
          ) : (
            <>
              <SAvatar
                withClick
                onClick={handleUserClick}
                avatarUrl={user.userData?.avatarUrl}
              />
              <SListItemTitleWrapper>
                <SListItemTitle variant={3} weight={600}>
                  {item.title}
                </SListItemTitle>
                <SListItemDate variant={2} weight={600}>
                  {item.date}
                </SListItemDate>
              </SListItemTitleWrapper>
              <SListShareButton
                view="secondary"
                onClick={handleDecideClick}
              >
                <InlineSVG
                  svg={shareIcon}
                  fill={theme.colorsThemed.text.primary}
                  width="20px"
                  height="20px"
                />
              </SListShareButton>
              {!isMobile && (
                <SListShareButton
                  view="secondary"
                  onClick={handleInfoClick}
                >
                  <InlineSVG
                    svg={infoIcon}
                    fill={theme.colorsThemed.text.primary}
                    width="20px"
                    height="20px"
                  />
                </SListShareButton>
              )}
              <SListDecideButton
                view="secondary"
                onClick={handleDecideClick}
              >
                {t('dashboard.expirationPosts.decide')}
              </SListDecideButton>
            </>
          )}
        </SListItem>
        {index !== collection.length - 1 && (
          <SListItemSeparator />
        )}
      </SListItemWrapper>
    );
  }, [
    t,
    isMobile,
    isDesktop,
    collection.length,
    user.userData?.avatarUrl,
    theme.colorsThemed.text.primary,
  ]);

  const handleSubmit = useCallback(() => {
    console.log('load more 10');
  }, []);

  return (
    <SContainer>
      <SHeaderLine>
        <STitle variant={6}>
          {t('dashboard.expirationPosts.title')}
        </STitle>
      </SHeaderLine>
      <SListWrapper>
        {isDesktop && (
          <>
            <SListHeader>
              <SListHeaderItem
                width="calc(100% - 300px)"
                align="start"
                weight={600}
                variant={2}
              >
                {t('dashboard.expirationPosts.table.header.post')}
              </SListHeaderItem>
              <SListHeaderItem
                width="100px"
                align="start"
                weight={600}
                variant={2}
              >
                {t('dashboard.expirationPosts.table.header.total')}
              </SListHeaderItem>
              <SListHeaderItem
                width="100px"
                align="start"
                weight={600}
                variant={2}
              >
                {t('dashboard.expirationPosts.table.header.contributions')}
              </SListHeaderItem>
              <SListHeaderItem
                width="100px"
                align="center"
                weight={600}
                variant={2}
              >
                {t('dashboard.expirationPosts.table.header.actions')}
              </SListHeaderItem>
            </SListHeader>
            <SListItemSeparator />
          </>
        )}
        {collection.map(renderItem)}
      </SListWrapper>
      {isMobile && (
        <SButton
          view="secondary"
          onClick={handleSubmit}
        >
          {t('dashboard.expirationPosts.submit')}
        </SButton>
      )}
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
  background: ${(props) => (props.theme.name === 'light' ? props.theme.colorsThemed.background.primary : props.theme.colorsThemed.background.secondary)};
  flex-direction: column;

  ${(props) => props.theme.media.tablet} {
    left: unset;
    width: 100%;
    padding: 24px;
    border-radius: 24px;
  }

  ${(props) => props.theme.media.laptop} {
    background: ${(props) => (props.theme.name === 'light' ? props.theme.colors.white : props.theme.colorsThemed.background.secondary)};
  }
`;

const STitle = styled(Headline)``;

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

const SButton = styled(Button)`
  width: 100%;
  padding: 16px 20px;
  margin-top: 16px;

  ${(props) => props.theme.media.tablet} {
    padding: 12px 24px;
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
  color: ${(props) => props.theme.colorsThemed.text.tertiary};
`;

const SListShareButton = styled(Button)`
  padding: 8px;
  min-width: 36px;
  margin-right: 12px;
  border-radius: 12px;
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
