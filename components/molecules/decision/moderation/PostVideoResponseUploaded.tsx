import React, { useMemo } from 'react';
import { newnewapi } from 'newnew-api';
import dynamic from 'next/dynamic';

import { useAppSelector } from '../../../../redux-store/store';
import { usePostInnerState } from '../../../../contexts/postInnerContext';
import { usePostModerationResponsesContext } from '../../../../contexts/postModerationResponsesContext';

import PostVideoSoundButton from '../../../atoms/decision/PostVideoSoundButton';
import PostVideoResponsesSlider from './PostVideoResponsesSlider';

const PostBitmovinPlayer = dynamic(
  () => import('../common/PostBitmovinPlayer'),
  {
    ssr: false,
  }
);

interface IPostVideoResponseUploaded {
  isMuted: boolean;
  soundBtnBottomOverriden?: number;
  isEditingStories?: boolean;
  handleToggleMuted: () => void;
  handleDeleteUnuploadedAdditonalResponse?: () => void;
}

const PostVideoResponseUploaded: React.FunctionComponent<
  IPostVideoResponseUploaded
> = ({
  isMuted,
  soundBtnBottomOverriden,
  isEditingStories,
  handleToggleMuted,
  handleDeleteUnuploadedAdditonalResponse,
}) => {
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobileOrTablet = [
    'mobile',
    'mobileS',
    'mobileM',
    'mobileL',
    'tablet',
  ].includes(resizeMode);

  const { postParsed } = usePostInnerState();
  const {
    coreResponse,
    additionalResponses,
    videoProcessing,
    responseFileProcessingProgress,
    handleDeleteAdditionalResponse,
  } = usePostModerationResponsesContext();
  const value = useMemo(() => videoProcessing?.targetUrls, [videoProcessing]);

  const responses = useMemo(() => {
    if (additionalResponses) {
      if (responseFileProcessingProgress === 100) {
        return [coreResponse, ...additionalResponses, value];
      }
      return [coreResponse, ...additionalResponses];
    }

    return undefined;
  }, [
    coreResponse,
    additionalResponses,
    value,
    responseFileProcessingProgress,
  ]);

  return (
    <>
      {responses && responses.length > 1 ? (
        <PostVideoResponsesSlider
          videos={responses as newnewapi.IVideoUrls[]}
          isMuted={isMuted}
          isEditingStories={isEditingStories}
          {...(soundBtnBottomOverriden && !isMobileOrTablet
            ? {
                dotsBottom:
                  soundBtnBottomOverriden + (!isEditingStories ? 72 : 24),
              }
            : {})}
          handleDeleteAdditionalVideo={handleDeleteAdditionalResponse}
          handleDeleteUnuploadedAdditonalResponse={
            handleDeleteUnuploadedAdditonalResponse
          }
        />
      ) : (
        <PostBitmovinPlayer
          id={postParsed?.postUuid ?? ''}
          resources={coreResponse}
          muted={isMuted}
          showPlayButton
        />
      )}
      <PostVideoSoundButton
        postId={postParsed?.postUuid ?? ''}
        isMuted={isMuted}
        soundBtnBottomOverriden={soundBtnBottomOverriden}
        handleToggleMuted={handleToggleMuted}
      />
    </>
  );
};

export default PostVideoResponseUploaded;
