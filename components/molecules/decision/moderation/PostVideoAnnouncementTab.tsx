import React from 'react';
import dynamic from 'next/dynamic';
import { newnewapi } from 'newnew-api';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';

import Button from '../../../atoms/Button';

import PostVideoSoundButton from '../../../atoms/decision/PostVideoSoundButton';
import SetThumbnailButtonIconOnly from '../../../atoms/decision/SetThumbnailButtonIconOnly';

const PostVideojsPlayer = dynamic(() => import('../common/PostVideojsPlayer'), {
  ssr: false,
});

interface IPostVideoAnnouncementTab {
  postUuid: string;
  announcement: newnewapi.IVideoUrls;
  hasCoverImage: boolean;
  isMuted: boolean;
  isSetThumbnailButtonIconOnly: boolean;
  uiOffset?: number;
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
  uiOffset,
  handleOpenEditCoverImageMenu,
  handleToggleMuted,
}) => {
  const { t } = useTranslation('page-Post');

  return (
    <>
      <PostVideojsPlayer
        id={postUuid}
        resources={announcement}
        muted={isMuted}
        showPlayButton
        videoDurationWithTime
      />
      {isSetThumbnailButtonIconOnly ? (
        <SetThumbnailButtonIconOnly
          handleClick={handleOpenEditCoverImageMenu}
          uiOffset={uiOffset}
        />
      ) : (
        <SSetThumbnailButton
          view='transparent'
          onClick={handleOpenEditCoverImageMenu}
          style={{
            ...(uiOffset
              ? {
                  transform: `translateY(-${uiOffset}px)`,
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
        uiOffset={uiOffset}
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
