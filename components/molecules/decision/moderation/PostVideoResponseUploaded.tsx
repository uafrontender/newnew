import React, { useMemo } from 'react';
import { newnewapi } from 'newnew-api';
import dynamic from 'next/dynamic';

import { usePostInnerState } from '../../../../contexts/postInnerContext';
import { usePostModerationResponsesContext } from '../../../../contexts/postModerationResponsesContext';

import PostVideoSoundButton from '../../../atoms/decision/PostVideoSoundButton';
import PostVideoResponsesSlider from './PostVideoResponsesSlider';
import { useAppState } from '../../../../contexts/appStateContext';

const PostVideojsPlayer = dynamic(() => import('../common/PostVideojsPlayer'), {
  ssr: false,
});

interface IPostVideoResponseUploaded {
  isMuted: boolean;
  uiOffset?: number;
  isEditingStories?: boolean;
  handleToggleMuted: () => void;
  handleDeleteUnUploadedAdditionalResponse?: () => void;
}

const PostVideoResponseUploaded: React.FunctionComponent<
  IPostVideoResponseUploaded
> = ({
  isMuted,
  uiOffset,
  isEditingStories,
  handleToggleMuted,
  handleDeleteUnUploadedAdditionalResponse,
}) => {
  const { resizeMode } = useAppState();
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
    isDeletingAdditionalResponse,
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
          {...(uiOffset && !isMobileOrTablet
            ? {
                uiOffset,
              }
            : {})}
          videoDurationWithTime={!isEditingStories}
          isDeletingAdditionalResponse={isDeletingAdditionalResponse}
          handleDeleteAdditionalVideo={handleDeleteAdditionalResponse}
          handleDeleteUnUploadedAdditionalResponse={
            handleDeleteUnUploadedAdditionalResponse
          }
          autoscroll
        />
      ) : (
        <PostVideojsPlayer
          id={postParsed?.postUuid ?? ''}
          resources={coreResponse}
          muted={isMuted}
          showPlayButton
          videoDurationWithTime
        />
      )}
      <PostVideoSoundButton
        postUuid={postParsed?.postUuid ?? ''}
        isMuted={isMuted}
        uiOffset={uiOffset}
        handleToggleMuted={handleToggleMuted}
      />
    </>
  );
};

export default PostVideoResponseUploaded;
