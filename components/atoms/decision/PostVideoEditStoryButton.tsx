import React, { useCallback } from 'react';
import styled, { css } from 'styled-components';

import { Mixpanel } from '../../../utils/mixpanel';
import { usePostInnerState } from '../../../contexts/postInnerContext';

import Button from '../Button';
import InlineSvg from '../InlineSVG';

import SelectIcon from '../../../public/images/svg/icons/outlined/Select.svg';
import { useAppState } from '../../../contexts/appStateContext';

interface IPostVideoEditStoryButton {
  active: boolean;
  bottomOverriden?: number;
  handleClick: () => void;
}

const PostVideoEditStoryButton: React.FunctionComponent<
  IPostVideoEditStoryButton
> = ({ active, bottomOverriden, handleClick }) => {
  const { resizeMode } = useAppState();
  const isMobileOrTablet = [
    'mobile',
    'mobileS',
    'mobileM',
    'mobileL',
    'tablet',
  ].includes(resizeMode);

  const { postParsed } = usePostInnerState();

  const handleClickPostVideoStoryButton = useCallback(
    (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      Mixpanel.track('Click post video story button', {
        _stage: 'Post',
        _postUuid: postParsed?.postUuid,
        _component: 'PostVideoEditStoryButton',
      });
      e.stopPropagation();
      handleClick();
    },
    [handleClick, postParsed?.postUuid]
  );

  return (
    <SPostVideoEditStoryButton
      id='edit-story-button'
      buttonActive={active}
      iconOnly
      view='transparent'
      onClick={handleClickPostVideoStoryButton}
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

const SPostVideoEditStoryButton = styled(Button)<{
  buttonActive: boolean;
}>`
  position: absolute;
  left: 16px;
  bottom: 16px;

  padding: 8px;
  width: 36px;
  height: 36px;

  transition: bottom 0s linear;

  border-radius: ${({ theme }) => theme.borderRadius.small};

  &:focus:enabled,
  &:hover:enabled {
    background: #ffffff;
    svg > path {
      stroke: black;
    }
  }

  &:active:enabled {
    background: ${({ theme, view }) =>
      theme.colorsThemed.button.background[view ?? 'primary']} !important;
  }

  ${({ buttonActive }) =>
    buttonActive
      ? css`
          background: #ffffff;
          svg > path {
            stroke: black;
          }
        `
      : null}

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
