import React from 'react';
import styled, { useTheme } from 'styled-components';
import { useTranslation } from 'next-i18next';

import NoContentYetImg from '../../../../public/images/decision/no-content-yet-mock.png';
import MakeFirstBidArrow from '../../../../public/images/svg/icons/filled/MakeFirstBidArrow.svg';
import InlineSvg from '../../../atoms/InlineSVG';
import Text from '../../../atoms/Text';
import { useAppState } from '../../../../contexts/appStateContext';

const NoComments: React.FunctionComponent = () => {
  const theme = useTheme();
  const { t } = useTranslation('page-Post');
  const { resizeMode } = useAppState();
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );

  return (
    <SNoCommentsYet>
      <SNoCommentsImgContainer>
        <img src={NoContentYetImg.src} alt='No content yet' />
      </SNoCommentsImgContainer>
      <SNoCommentsCaption variant={3}>
        {t('comments.noCommentsCaption')}
      </SNoCommentsCaption>
      {!isMobile && (
        <SMakeBidArrowSvg
          svg={MakeFirstBidArrow}
          fill={theme.colorsThemed.background.quinary}
          width='36px'
        />
      )}
    </SNoCommentsYet>
  );
};

NoComments.defaultProps = {
  canDeleteComments: false,
  onFormFocus: () => {},
  onFormBlur: () => {},
};

export default NoComments;

export const SScrollContainer = styled.div`
  ${({ theme }) => theme.media.tablet} {
    padding-right: 0;
    max-height: 500px;
    height: 100%;

    overflow-y: auto;

    // Scrollbar
    &::-webkit-scrollbar {
      width: 4px;
    }
    scrollbar-width: none;
    &::-webkit-scrollbar-track {
      background: transparent;
      border-radius: 4px;
      transition: 0.2s linear;
    }
    &::-webkit-scrollbar-thumb {
      background: transparent;
      border-radius: 4px;
      transition: 0.2s linear;
    }
  }
`;

// No Comments yet
const SNoCommentsYet = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  width: 100%;
  min-height: 300px;
`;

const SNoCommentsImgContainer = styled.div`
  position: absolute;

  top: 100px;

  display: flex;
  justify-content: center;
  align-items: center;

  width: 48px;
  height: 48px;

  img {
    position: relative;
    display: block;
    width: 100%;
    height: 100%;
  }

  margin-bottom: 16px;

  ${({ theme }) => theme.media.tablet} {
    position: initial;
  }
`;

const SNoCommentsCaption = styled(Text)`
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};
`;

const SMakeBidArrowSvg = styled(InlineSvg)`
  position: absolute;
  left: 30%;
  top: -56px;

  transform: scale(1, -1);
`;
