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
  const collection = useMemo(() => ([
    {
      id: 1,
      title: 'Should I get a forehead',
      date: '15m 10s left',
    },
    {
      id: 2,
      title: 'Should I get a forehead',
      date: '15m 10s left',
    },
    {
      id: 3,
      title: 'Should I get a forehead',
      date: '15m 10s left',
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
        </SListItem>
        {index !== collection.length - 1 && (
          <SListItemSeparator />
        )}
      </SListItemWrapper>
    );
  }, [
    t,
    isMobile,
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
        {collection.map(renderItem)}
      </SListWrapper>
      <SButton
        view="secondary"
        onClick={handleSubmit}
      >
        {t('dashboard.expirationPosts.submit')}
      </SButton>
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
`;

const SListItemTitleWrapper = styled.div`
  width: 100%;
  display: flex;
  padding: 0 12px;
  max-width: calc(100% - 178px);
  flex-direction: column;

  ${(props) => props.theme.media.tablet} {
    max-width: calc(100% - 226px);
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
`;

const SListItemWrapper = styled.div``;
