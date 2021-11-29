/* eslint-disable no-nested-ternary */
import React from 'react';
import styled from 'styled-components';

import Card from '../../molecules/Card';

import { useAppSelector } from '../../../redux-store/store';

interface IList {
  category: string;
  collection: any;
}

export const List: React.FC<IList> = (props) => {
  const {
    category,
    collection,
  } = props;
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);

  const renderItem = (item: any, index: number) => (
    <SItemWrapper key={`${category}-${item.id}`}>
      <Card
        item={item}
        index={index + 1}
        width="100%"
        height={isMobile ? '564px' : '336px'}
      />
    </SItemWrapper>
  );

  return (
    <SListWrapper>
      {collection.map(renderItem)}
    </SListWrapper>
  );
};

export default List;

const SListWrapper = styled.div`
  left: -16px;
  width: 100vw;
  cursor: grab;
  display: flex;
  padding: 8px 0 0 0;
  position: relative;
  flex-wrap: wrap;
  flex-direction: row;

  ${(props) => props.theme.media.tablet} {
    left: -8px;
    width: calc(100% + 26px);
    padding: 24px 0 0 0;
  }

  ${(props) => props.theme.media.laptop} {
    left: -16px;
    width: calc(100% + 32px);
    padding: 32px 0 0 0;
  }
`;

const SItemWrapper = styled.div`
  width: 100vw;
  margin: 16px 0;

  ${(props) => props.theme.media.tablet} {
    width: calc(33% - 16px);
    margin: 0 8px 24px 8px;
  }

  ${(props) => props.theme.media.laptop} {
    width: calc(25% - 32px);
    margin: 0 16px 32px 16px;
  }

  ${(props) => props.theme.media.laptopL} {
    width: calc(20% - 32px);
  }
`;
