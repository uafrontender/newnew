import React from 'react';
import dynamic from 'next/dynamic';
import { newnewapi } from 'newnew-api';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';

import { Mixpanel } from '../../../../utils/mixpanel';
import { useAppSelector } from '../../../../redux-store/store';

import Button from '../../../atoms/Button';
import InlineSvg from '../../../atoms/InlineSVG';

import ThumbnailIcon from '../../../../public/images/svg/icons/filled/AddImage.svg';
import PostVideoSoundButton from '../../../atoms/decision/PostVideoSoundButton';

const PostBitmovinPlayer = dynamic(
  () => import('../common/PostBitmovinPlayer'),
  {
    ssr: false,
  }
);

interface IPostVideoAnnouncementTab {
  postId: string;
  announcement: newnewapi.IVideoUrls;
  isMuted: boolean;
  isSetThumbnailButtonIconOnly: boolean;
  ellipseButtonRef: any;
  soundBtnBottomOverriden?: number;
  handleOpenEllipseMenu: () => void;
  handleToggleMuted: () => void;
}

const PostVideoAnnouncementTab: React.FunctionComponent<
  IPostVideoAnnouncementTab
> = ({
  postId,
  announcement,
  isMuted,
  isSetThumbnailButtonIconOnly,
  ellipseButtonRef,
  soundBtnBottomOverriden,
  handleOpenEllipseMenu,
  handleToggleMuted,
}) => {
  const { t } = useTranslation('page-Post');
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobileOrTablet = [
    'mobile',
    'mobileS',
    'mobileM',
    'mobileL',
    'tablet',
  ].includes(resizeMode);

  return (
    <>
      <PostBitmovinPlayer
        id={postId}
        resources={announcement}
        muted={isMuted}
        showPlayButton
      />
      {isSetThumbnailButtonIconOnly ? (
        <SSetThumbnailButtonIconOnly
          iconOnly
          view='transparent'
          ref={ellipseButtonRef as any}
          onClick={() => {
            Mixpanel.track('Open Ellipse Menu', {
              _stage: 'Post',
              _postUuid: postId,
              _component: 'PostVideoModeration',
            });
            handleOpenEllipseMenu();
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
            svg={ThumbnailIcon}
            width={isMobileOrTablet ? '20px' : '24px'}
            height={isMobileOrTablet ? '20px' : '24px'}
            fill='#FFFFFF'
          />
        </SSetThumbnailButtonIconOnly>
      ) : (
        <SSetThumbnailButton
          view='transparent'
          ref={ellipseButtonRef as any}
          onClick={() => {
            Mixpanel.track('Open Ellipse Menu', {
              _stage: 'Post',
              _postUuid: postId,
              _component: 'PostVideoModeration',
            });
            handleOpenEllipseMenu();
          }}
          style={{
            ...(soundBtnBottomOverriden
              ? {
                  bottom: soundBtnBottomOverriden,
                }
              : {}),
          }}
        >
          {t('postVideo.setThumbnail')}
        </SSetThumbnailButton>
      )}
      <PostVideoSoundButton
        postId={postId}
        isMuted={isMuted}
        soundBtnBottomOverriden={soundBtnBottomOverriden}
        handleToggleMuted={handleToggleMuted}
      />
    </>
  );
};

export default PostVideoAnnouncementTab;

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
