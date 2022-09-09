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

interface IPostVideoResponseUploadedRegular {
  postId: string;
  response: newnewapi.IVideoUrls;
  isMuted: boolean;
  soundBtnBottomOverriden?: number;
  isEditingStories?: boolean;
  handleToggleMuted: () => void;
  additionalResponses?: newnewapi.IVideoUrls[];
  handleDeleteAdditonalResponse: (videoUuid: string) => void;
}

const PostVideoResponseUploadedRegular: React.FunctionComponent<
  IPostVideoResponseUploadedRegular
> = ({
  postId,
  response,
  isMuted,
  soundBtnBottomOverriden,
  isEditingStories,
  handleToggleMuted,
  additionalResponses,
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

export default PostVideoResponseUploadedRegular;
