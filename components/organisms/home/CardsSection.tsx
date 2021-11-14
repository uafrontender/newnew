import React from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

import Card from '../../molecules/Card';
import Button from '../../atoms/Button';
import Caption from '../../atoms/Caption';
import Headline from '../../atoms/Headline';
import UserAvatar from '../../molecules/UserAvatar';

import { useAppSelector } from '../../../redux-store/store';

interface ICardSection {
  url: string,
  user?: any,
  type?: 'default' | 'creator'
  title?: string,
  collection: {}[],
}

export const CardsSection: React.FC<ICardSection> = (props) => {
  const {
    url,
    user,
    type,
    title,
    collection,
  } = props;
  const { t } = useTranslation('home');
  const router = useRouter();
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);

  let collectionToRender = collection;
  let renderShowMore = false;

  if (isMobile && collection.length > 3) {
    renderShowMore = true;
    collectionToRender = collection.slice(0, 3);
  }

  const renderItem = (item: any, index: number) => (
    <SItemWrapper key={`${item.id}-${title}`}>
      <Card item={item} index={index + 1} />
    </SItemWrapper>
  );
  const handleUserClick = () => {
    router.push(url);
  };

  return (
    <SWrapper>
      <STopWrapper>
        {type === 'default' ? (
          <Headline variant={4}>
            {title}
          </Headline>
        ) : (
          <SCreatorHeadline>
            <UserAvatar user={user} withClick onClick={handleUserClick} />
            <SHeadline variant={4}>
              {user.username}
            </SHeadline>
            <SButton view="quaternary" onClick={handleUserClick}>
              {t('button-creator-on-the-rise')}
            </SButton>
          </SCreatorHeadline>
        )}
        {!isMobile && (
          <Link href={url}>
            <a>
              <SCaption>
                {t(type === 'default' ? 'button-show-more' : 'button-show-more-creator')}
              </SCaption>
            </a>
          </Link>
        )}
      </STopWrapper>
      <SListWrapper>
        {collectionToRender.map(renderItem)}
      </SListWrapper>
      {renderShowMore && (
        <SButtonHolder>
          <Link href={url}>
            <a>
              <Button size="lg" view="secondary">
                {t(type === 'default' || isMobile ? 'button-show-more' : 'button-show-more-creator')}
              </Button>
            </a>
          </Link>
        </SButtonHolder>
      )}
    </SWrapper>
  );
};

export default CardsSection;

CardsSection.defaultProps = {
  type: 'default',
  user: {},
  title: '',
};

const SWrapper = styled.section`
  padding: 0 0 24px 0;

  ${(props) => props.theme.media.tablet} {
    padding: 32px 0;
  }

  ${(props) => props.theme.media.laptop} {
    padding: 40px 0;
  }
`;

const SListWrapper = styled.div`
  left: -16px;
  width: 100vw;
  display: flex;
  padding: 8px 0 0 0;
  position: relative;
  overflow-x: auto;
  flex-direction: column;

  ${(props) => props.theme.media.tablet} {
    left: -32px;
    padding: 24px 24px 0 24px;
    flex-direction: row;

    ::-webkit-scrollbar {
      display: none;
    }
  }

  ${(props) => props.theme.media.laptop} {
    left: -16px;
    width: calc(100% + 32px);
    padding: 32px 0 0 0;
  }
`;

const SItemWrapper = styled.div`
  margin: 16px 0;

  ${(props) => props.theme.media.tablet} {
    margin: 0 8px;
  }

  ${(props) => props.theme.media.laptop} {
    margin: 0 16px;
  }
`;

const SButtonHolder = styled.div`
  display: flex;
  position: relative;
  margin-top: 8px;
  align-items: center;
  justify-content: center;

  button {
    width: 100%;
  }
`;

const STopWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const SCaption = styled(Caption)`
  color: ${(props) => props.theme.colorsThemed.text.secondary};
`;

const SCreatorHeadline = styled.div`
  display: flex;
  align-items: center;
  flex-direction: row;
`;

const SHeadline = styled(Headline)`
  margin: 0 8px;

  ${(props) => props.theme.media.tablet} {
    margin: 0 16px;
  }
`;

const SButton = styled(Button)`
  padding: 12px;
  font-size: 12px;
  line-height: 16px;

  ${(props) => props.theme.media.tablet} {
    padding: 8px 12px;
    font-size: 14px;
    line-height: 24px;
  }
`;
