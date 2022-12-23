import React from 'react';
import styled from 'styled-components';

import { Mixpanel } from '../../../utils/mixpanel';
import { useAppSelector } from '../../../redux-store/store';

import Button from '../Button';
import InlineSvg from '../InlineSVG';

import VolumeOff from '../../../public/images/svg/icons/filled/VolumeOFF1.svg';
import VolumeOn from '../../../public/images/svg/icons/filled/VolumeON.svg';

interface IPostVideoSoundButton {
  postUuid: string;
  isMuted?: boolean;
  soundBtnBottomOverriden?: number;
  handleToggleMuted: () => void;
}

const PostVideoSoundButton: React.FunctionComponent<IPostVideoSoundButton> = ({
  postUuid,
  isMuted,
  soundBtnBottomOverriden,
  handleToggleMuted,
}) => {
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobileOrTablet = [
    'mobile',
    'mobileS',
    'mobileM',
    'mobileL',
    'tablet',
  ].includes(resizeMode);

  return (
    <SSoundButton
      id='sound-button'
      iconOnly
      view='transparent'
      onClick={(e) => {
        Mixpanel.track('Toggle Muted Mode', {
          _stage: 'Post',
          _postUuid: postUuid,
        });
        e.stopPropagation();
        handleToggleMuted();
      }}
      style={{
        ...(soundBtnBottomOverriden
          ? {
              bottom: soundBtnBottomOverriden,
            }
          : {}),
      }}
    >
      <InlineSvg
        svg={isMuted ? VolumeOff : VolumeOn}
        width={isMobileOrTablet ? '20px' : '24px'}
        height={isMobileOrTablet ? '20px' : '24px'}
        fill='#FFFFFF'
      />
    </SSoundButton>
  );
};

export default PostVideoSoundButton;

const SSoundButton = styled(Button)`
  position: absolute;
  right: 16px;
  bottom: 16px;

  padding: 8px;
  width: 36px;
  height: 36px;

  border-radius: ${({ theme }) => theme.borderRadius.small};

  transition: unset;

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
