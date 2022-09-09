import React from 'react';
import styled from 'styled-components';

import { useAppSelector } from '../../../redux-store/store';

import Button from '../Button';
import InlineSvg from '../InlineSVG';

import SelectIcon from '../../../public/images/svg/icons/outlined/Select.svg';

interface IPostVideoEditStoryButton {
  active: boolean;
  bottomOverriden?: number;
  handleClick: () => void;
}

const PostVideoEditStoryButton: React.FunctionComponent<
  IPostVideoEditStoryButton
> = ({ active, bottomOverriden, handleClick }) => {
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobileOrTablet = [
    'mobile',
    'mobileS',
    'mobileM',
    'mobileL',
    'tablet',
  ].includes(resizeMode);

  return (
    <SPostVideoEditStoryButton
      id='sound-button'
      iconOnly
      view='transparent'
      onClick={(e) => {
        e.stopPropagation();
        handleClick();
      }}
      style={{
        ...(bottomOverriden
          ? {
              bottom: bottomOverriden,
            }
          : {}),
      }}
    >
      <InlineSvg
        svg={SelectIcon}
        width={isMobileOrTablet ? '20px' : '24px'}
        height={isMobileOrTablet ? '20px' : '24px'}
        fill='none'
      />
    </SPostVideoEditStoryButton>
  );
};

export default PostVideoEditStoryButton;

const SPostVideoEditStoryButton = styled(Button)`
  position: absolute;
  left: 16px;
  bottom: 16px;

  padding: 8px;
  width: 36px;
  height: 36px;

  border-radius: ${({ theme }) => theme.borderRadius.small};

  ${({ theme }) => theme.media.tablet} {
    width: 36px;
    height: 36px;
  }

  ${({ theme }) => theme.media.laptop} {
    padding: 12px;
    width: 48px;
    height: 48px;

    border-radius: ${({ theme }) => theme.borderRadius.medium};
  }
`;
