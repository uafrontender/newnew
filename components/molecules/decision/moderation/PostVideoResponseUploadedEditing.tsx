import React from 'react';
import dynamic from 'next/dynamic';
import { newnewapi } from 'newnew-api';

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

interface IPostVideoResponseUploadedEditing {
  isMuted: boolean;
  soundBtnBottomOverriden?: number;
  handleToggleMuted: () => void;
  additionalResponses?: newnewapi.IVideoUrls[];
  handleDeleteUnuploadedAdditonalResponse: (videoUuid: string) => void;
}

const PostVideoResponseUploadedEditing: React.FunctionComponent<
  IPostVideoResponseUploadedEditing
> = ({
  isMuted,
  soundBtnBottomOverriden,
  handleToggleMuted,
  additionalResponses,
  handleDeleteUnuploadedAdditonalResponse,
}) => {
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isTablet = ['tablet'].includes(resizeMode);

  const { postParsed } = usePostModalInnerState();
  const { coreResponse } = usePostModerationResponsesContext();

  return (
    <>
      {!additionalResponses || additionalResponses.length === 0 ? (
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
          videos={[coreResponse!!, ...additionalResponses]}
          isMuted={isMuted}
          {...(soundBtnBottomOverriden
            ? {
                dotsBottom: soundBtnBottomOverriden + 72,
              }
            : {})}
          {...(isTablet && !soundBtnBottomOverriden
            ? {
                dotsBottom: 112,
              }
            : {})}
          handleDeleteAdditionalVideo={handleDeleteUnuploadedAdditonalResponse}
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

export default PostVideoResponseUploadedEditing;
