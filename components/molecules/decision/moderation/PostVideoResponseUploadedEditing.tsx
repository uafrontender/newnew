import React from 'react';
import dynamic from 'next/dynamic';
import { newnewapi } from 'newnew-api';

import { useAppSelector } from '../../../../redux-store/store';

import PostVideoSoundButton from '../../../atoms/decision/PostVideoSoundButton';
import PostVideoResponsesSlider from './PostVideoResponsesSlider';

const PostBitmovinPlayer = dynamic(
  () => import('../common/PostBitmovinPlayer'),
  {
    ssr: false,
  }
);

interface IPostVideoResponseUploadedEditing {
  postId: string;
  response: newnewapi.IVideoUrls;
  isMuted: boolean;
  soundBtnBottomOverriden?: number;
  handleToggleMuted: () => void;
  additionalResponses?: newnewapi.IVideoUrls[];
  handleAddAdditonalResponse: (newVideo: newnewapi.IVideoUrls) => void;
  handleDeleteAdditonalResponse: (videoUuid: string) => void;
}

const PostVideoResponseUploadedEditing: React.FunctionComponent<
  IPostVideoResponseUploadedEditing
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
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isTablet = ['tablet'].includes(resizeMode);

  return (
    <>
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
          handleDeleteAdditionalVideo={handleDeleteAdditonalResponse}
        />
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

export default PostVideoResponseUploadedEditing;
