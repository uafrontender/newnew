import React from 'react';
import dynamic from 'next/dynamic';
import { newnewapi } from 'newnew-api';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';

import Button from '../../../atoms/Button';

import PostVideoSoundButton from '../../../atoms/decision/PostVideoSoundButton';
import SetThumbnailButtonIconOnly from '../../../atoms/decision/SetThumbnailButtonIconOnly';

const PostBitmovinPlayer = dynamic(
  () => import('../common/PostBitmovinPlayer'),
  {
    ssr: false,
  }
);

interface IPostVideoAnnouncementTab {
  postUuid: string;
  announcement: newnewapi.IVideoUrls;
  hasCoverImage: boolean;
  isMuted: boolean;
  isSetThumbnailButtonIconOnly: boolean;
  soundBtnBottomOverriden?: number;
  handleOpenEditCoverImageMenu: () => void;
  handleToggleMuted: () => void;
}

const PostVideoAnnouncementTab: React.FunctionComponent<
  IPostVideoAnnouncementTab
> = ({
  postUuid,
  announcement,
  hasCoverImage,
  isMuted,
  isSetThumbnailButtonIconOnly,
  soundBtnBottomOverriden,
  handleOpenEditCoverImageMenu,
  handleToggleMuted,
}) => {
  const { t } = useTranslation('page-Post');

  return (
    <>
      <PostBitmovinPlayer
        id={postUuid}
        resources={announcement}
        muted={isMuted}
        showPlayButton
      />
      {isSetThumbnailButtonIconOnly ? (
        <SetThumbnailButtonIconOnly
          handleClick={handleOpenEditCoverImageMenu}
          soundBtnBottomOverriden={soundBtnBottomOverriden}
        />
      ) : (
        <SSetThumbnailButton
          view='transparent'
          onClick={handleOpenEditCoverImageMenu}
          style={{
            ...(soundBtnBottomOverriden
              ? {
                  bottom: soundBtnBottomOverriden,
                }
              : {}),
          }}
        >
          {hasCoverImage
            ? t('postVideo.changeThumbnail')
            : t('postVideo.setThumbnail')}
        </SSetThumbnailButton>
      )}
      <PostVideoSoundButton
        postUuid={postUuid}
        isMuted={isMuted}
        soundBtnBottomOverriden={soundBtnBottomOverriden}
        handleToggleMuted={handleToggleMuted}
      />
    </>
  );
};

export default PostVideoAnnouncementTab;

const SSetThumbnailButton = styled(Button)`
  position: absolute;
  right: 64px;
  bottom: 16px;

  padding: 8px;
  height: 36px;

  transition: bottom 0s linear;

  border-radius: ${({ theme }) => theme.borderRadius.small};

  ${({ theme }) => theme.media.laptop} {
    right: 72px;

    padding: 12px;
    height: 48px;

    border-radius: ${({ theme }) => theme.borderRadius.medium};
  }
`;
