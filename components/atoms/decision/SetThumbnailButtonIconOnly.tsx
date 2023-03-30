import React from 'react';
import styled from 'styled-components';

import Button from '../Button';
import InlineSvg from '../InlineSVG';

import ThumbnailIcon from '../../../public/images/svg/icons/filled/AddImage.svg';
import { useAppState } from '../../../contexts/appStateContext';

interface ISetThumbnailButtonIconOnly {
  uiOffset?: number;
  positionLeftOverriden?: number;
  handleClick: () => void;
}

const SetThumbnailButtonIconOnly: React.FunctionComponent<
  ISetThumbnailButtonIconOnly
> = ({ uiOffset, positionLeftOverriden, handleClick }) => {
  const { resizeMode } = useAppState();
  const isMobileOrTablet = [
    'mobile',
    'mobileS',
    'mobileM',
    'mobileL',
    'tablet',
  ].includes(resizeMode);

  return (
    <SSetThumbnailButtonIconOnly
      iconOnly
      view='transparent'
      onClick={() => {
        handleClick();
      }}
      style={{
        ...(uiOffset
          ? {
              transform: `translateY(-${uiOffset}px)`,
            }
          : {}),
        ...(positionLeftOverriden
          ? {
              left: positionLeftOverriden,
            }
          : {}),
      }}
    >
      <InlineSvg
        svg={ThumbnailIcon}
        width={isMobileOrTablet ? '20px' : '24px'}
        height={isMobileOrTablet ? '20px' : '24px'}
        fill='#FFFFFF'
      />
    </SSetThumbnailButtonIconOnly>
  );
};

export default SetThumbnailButtonIconOnly;

const SSetThumbnailButtonIconOnly = styled(Button)`
  position: absolute;
  left: 16px;
  bottom: 16px;

  padding: 8px;
  width: 36px;
  height: 36px;

  border-radius: ${({ theme }) => theme.borderRadius.small};

  transition: bottom 0s linear;

  ${({ theme }) => theme.media.tablet} {
    right: initial;
    left: 16px;
    width: 36px;
    height: 36px;
  }

  ${({ theme }) => theme.media.laptop} {
    right: 72px;
    padding: 12px;
    width: 48px;
    height: 48px;

    border-radius: ${({ theme }) => theme.borderRadius.medium};
  }
`;
