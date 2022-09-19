import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';

import { useAppSelector } from '../../../../redux-store/store';

import PostVideoSoundButton from '../../../atoms/decision/PostVideoSoundButton';
import PostVideoResponsesSlider from './PostVideoResponsesSlider';
import { usePostModalInnerState } from '../../../../contexts/postModalInnerContext';
import { usePostModerationResponsesContext } from '../../../../contexts/postModerationResponsesContext';

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
  handleDeleteUnuploadedAdditonalResponse: () => void;
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
  const isTablet = ['tablet'].includes(resizeMode);

  const { postParsed } = usePostModalInnerState();
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
      {/* {!additionalResponses || additionalResponses.length === 0 ? ( */}
      {!responses || responses.length === 0 ? (
        <>
          <PostBitmovinPlayer
            id={postParsed?.postUuid ?? ''}
            resources={coreResponse}
            muted={isMuted}
            showPlayButton
          />
        </>
      ) : (
        <PostVideoResponsesSlider
          // videos={[coreResponse!!, ...additionalResponses]}
          videos={responses!!}
          isMuted={isMuted}
          isEditingStories={isEditingStories}
          {...(soundBtnBottomOverriden
            ? {
                dotsBottom:
                  soundBtnBottomOverriden + (!isEditingStories ? 72 : 0),
              }
            : {})}
          {...(isTablet && !soundBtnBottomOverriden
            ? {
                dotsBottom: !isEditingStories ? 112 : 0,
              }
            : {})}
          handleDeleteAdditionalVideo={handleDeleteAdditionalResponse}
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
