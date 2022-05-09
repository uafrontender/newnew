import React, { ReactElement } from 'react';
import styled from 'styled-components';

interface INoContentCard {
  children: ReactElement | ReactElement[];
}

const NoContentCard: React.FunctionComponent<INoContentCard> = ({
  children,
}) => (
  <NoContentMessageContainer>
    <NoContentInfoContainer>{children}</NoContentInfoContainer>
  </NoContentMessageContainer>
);

export default NoContentCard;

const NoContentMessageContainer = styled.div`
  padding: 16px 24px 30px !important;
  margin: 60px 16px 30px !important;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;

  ${({ theme }) => theme.media.tablet} {
    flex-direction: row;
    padding: 24px 32px 24px 16px !important;
    margin: 80px auto 30px !important;
    width: auto;
  }

  ${({ theme }) => theme.media.laptop} {
    margin-top: 60px;
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
