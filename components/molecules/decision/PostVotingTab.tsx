/* eslint-disable no-unsafe-optional-chaining */
import React from 'react';
import styled, { useTheme } from 'styled-components';

import InlineSvg from '../../atoms/InlineSVG';

import StatisticsIconFilled from '../../../public/images/svg/icons/filled/Statistics.svg';

interface IPostVotingTab {
  children: string;
}

const PostVotingTab: React.FunctionComponent<IPostVotingTab> = ({
  children,
}) => {
  const theme = useTheme();

  return (
    <STabs>
      <STabsContainer>
        <STab>
          <InlineSvg
            svg={StatisticsIconFilled}
            fill={theme.colorsThemed.text.primary}
            width='24px'
            height='24px'
          />
          <div>{children}</div>
        </STab>
      </STabsContainer>
    </STabs>
  );
};

export default PostVotingTab;

const STabs = styled.div`
  position: relative;
  /* overflow: hidden; */

  padding-bottom: 12px;

  ${({ theme }) => theme.media.tablet} {
    padding-bottom: 16px;
  }
`;

const STabsContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  gap: 24px;

  width: 100%;
  overflow: hidden;
  position: relative;

  border-bottom: 1px solid
    ${({ theme }) => theme.colorsThemed.background.outlines1};
`;

const STab = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;

  position: relative;
  width: 50%;

  background: transparent;
  border: transparent;

  padding-bottom: 12px;

  white-space: nowrap;
  font-weight: 600;

  font-size: 14px;
  line-height: 20px;

  ${({ theme }) => theme.media.tablet} {
    font-size: 14px;
    line-height: 18px;
  }

  ${({ theme }) => theme.media.laptop} {
    font-size: 14px;
    line-height: 20px;
  }

  color: ${({ theme }) => theme.colorsThemed.text.primary};

  /* No select */
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;

  ${({ theme }) => theme.media.tablet} {
    padding-bottom: 12px;
  }
`;
