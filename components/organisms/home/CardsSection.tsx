import React, { useState } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';

import Card from '../../molecules/Card';
import Button from '../../atoms/Button';
import Caption from '../../atoms/Caption';
import Headline from '../../atoms/Headline';

import { useAppSelector } from '../../../redux-store/store';

interface ICardSection {
  url: string,
  title: string,
  collection: {}[],
}

export const CardsSection: React.FC<ICardSection> = (props) => {
  const {
    url,
    title,
    collection,
  } = props;
  const [pagination, setPagination] = useState(1);
  const { t } = useTranslation('home');
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);

  let collectionToRender = collection;
  let renderShowMore = false;

  if (isMobile && collection.length > (3 * pagination)) {
    renderShowMore = true;
    collectionToRender = collection.slice(0, 3 * pagination);
  }

  const handleShowMoreClick = () => {
    setPagination(pagination + 1);
  };

  const renderItem = (item: any, index: number) => (
    <SItemWrapper key={`${item.id}-${title}`}>
      <Card item={item} index={index + 1} />
    </SItemWrapper>
  );

  return (
    <SWrapper>
      <STopWrapper>
        <Headline variant={4}>
          {title}
        </Headline>
        {!isMobile && (
          <Link href={`/${url}`}>
            <a>
              <SCaption>
                {t('button-show-more')}
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
          <Button size="lg" view="secondary" onClick={handleShowMoreClick}>
            {t('button-show-more')}
          </Button>
        </SButtonHolder>
      )}
    </SWrapper>
  );
};

export default CardsSection;

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
  position: relative;
  overflow-x: auto;
  margin-top: 8px;
  flex-direction: column;

  ${(props) => props.theme.media.tablet} {
    left: -32px;
    padding: 0 24px;
    flex-direction: row;

    ::-webkit-scrollbar {
      display: none;
    }
  }

  ${(props) => props.theme.media.laptop} {
    left: -16px;
    width: calc(100% + 32px);
    padding: 0;
    margin-top: 32px;
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
