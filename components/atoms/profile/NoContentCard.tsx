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
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin-left: auto;
  margin-right: auto;

  ${({ theme }) => theme.media.tablet} {
    flex-direction: row;
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
    margin-right: 32px;
  }
`;
