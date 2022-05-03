import React, { ReactElement } from 'react';
import styled from 'styled-components';

interface INoContentCard {
  graphics: ReactElement;
  children: ReactElement | ReactElement[];
}

const NoContentCard: React.FunctionComponent<INoContentCard> = ({
  graphics,
  children,
}) => (
  <NoContentMessageContainer>
    <NoContentGraphicsContainer>{graphics}</NoContentGraphicsContainer>
    <NoContentInfoContainer>{children}</NoContentInfoContainer>
  </NoContentMessageContainer>
);

export default NoContentCard;

const NoContentMessageContainer = styled.div`
  margin: 8px 16px 30px !important;
  padding: 16px 24px 30px !important;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;

  ${({ theme }) => theme.media.tablet} {
    flex-direction: row;
    padding: 24px 32px 24px 16px !important;
    margin: 56px auto 30px !important;
    width: auto;
  }
`;

const NoContentGraphicsContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 24px;

  ${({ theme }) => theme.media.tablet} {
    width: auto;
  }
`;

const NoContentInfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  ${({ theme }) => theme.media.tablet} {
    align-items: flex-start;
    margin-left: 24px;
  }
`;
