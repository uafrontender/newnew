/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import styled from 'styled-components';
import { newnewapi } from 'newnew-api';
import { useTranslation } from 'next-i18next';

import { Mixpanel } from '../../../../utils/mixpanel';
import { useAppSelector } from '../../../../redux-store/store';

import Button from '../../../atoms/Button';
import InlineSvg from '../../../atoms/InlineSVG';

import VolumeOff from '../../../../public/images/svg/icons/filled/VolumeOFF1.svg';
import VolumeOn from '../../../../public/images/svg/icons/filled/VolumeON.svg';
import PostVideoResponsesSlider from './PostVideoResponsesSlider';

const PostBitmovinPlayer = dynamic(
  () => import('../common/PostBitmovinPlayer'),
  {
    ssr: false,
  }
);

interface IPostVideoResponseUploadedTab {
  postId: string;
  response: newnewapi.IVideoUrls;
  isMuted: boolean;
  soundBtnBottomOverriden?: number;
  handleToggleMuted: () => void;
  additionalResponses?: newnewapi.IVideoUrls[];
  handleAddAdditonalResponse: (newVideo: newnewapi.IVideoUrls) => void;
  handleDeleteAdditonalResponse: (videoUuid: string) => void;
}

const PostVideoResponseUploadedTab: React.FunctionComponent<
  IPostVideoResponseUploadedTab
> = ({
  postId,
  response,
  isMuted,
  soundBtnBottomOverriden,
  handleToggleMuted,
  additionalResponses,
  handleAddAdditonalResponse,
  handleDeleteAdditonalResponse,
}) => {
  const { t } = useTranslation('modal-Post');
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobileOrTablet = [
    'mobile',
    'mobileS',
    'mobileM',
    'mobileL',
    'tablet',
  ].includes(resizeMode);

  const [openedTab, setOpenedTab] = useState<'regular' | 'uploading'>(
    'regular'
  );

  return (
    <SContainer>
      {!additionalResponses || additionalResponses.length === 0 ? (
        <>
          <PostBitmovinPlayer
            id={postId}
            resources={response}
            muted={isMuted}
            showPlayButton
          />
        </>
      ) : (
        <PostVideoResponsesSlider
          videos={[response, ...additionalResponses]}
          isMuted={isMuted}
        />
      )}
      <SSoundButton
        id='sound-button'
        iconOnly
        view='transparent'
        onClick={(e) => {
          Mixpanel.track('Toggle Muted Mode', {
            _stage: 'Post',
            _postUuid: postId,
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
    </SContainer>
  );
};

export default PostVideoResponseUploadedTab;

const SContainer = styled.div`
  width: 100%;
  height: 100%;
`;

const SSoundButton = styled(Button)`
  position: absolute;
  right: 16px;
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
