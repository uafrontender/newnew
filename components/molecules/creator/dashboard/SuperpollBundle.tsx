/* eslint-disable react/no-array-index-key */
import React, { useCallback } from 'react';
import styled from 'styled-components';
// import { useTranslation } from 'next-i18next';
// import Text from '../../../atoms/Text';
// import smallvote from '../../../../public/images/dashboard/votes-small.png';

interface IFunctionProps {
  id: number;
  votes: string;
  months: string;
  price: string;
}

export const SuperpollBundle: React.FC<IFunctionProps> = ({
  id,
  votes,
  months,
  price,
}) => {
  // const { t } = useTranslation('page-Creator');

  const renderIco = useCallback(
    () =>
      [...Array(id)].map((e, i) => (
        <span className='busterCards' key={`bundle-votes-${i}-${months}`}>
          ♦
        </span>
      )),
    [id, months]
  );

  return (
    <SContainer>
      <SHeader>
        <SVotes>{votes}</SVotes>
        <div>{renderIco()}</div>
      </SHeader>
    </SContainer>
  );
};

export default SuperpollBundle;

const SContainer = styled.div`
  padding: 16px;
  border-radius: ${(props) => props.theme.borderRadius.medium};
  background: ${(props) => props.theme.colorsThemed.background.tertiary};
  color: ${(props) => props.theme.colorsThemed.text.primary};
`;

const SHeader = styled.div`
  display: flex;
  justify-content: space-between;
  padding-bottom: 12px;
`;

const SVotes = styled.strong`
  font-size: 24px;
  font-weight: bold;
`;
