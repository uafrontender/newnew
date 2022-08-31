import React from 'react';
import dynamic from 'next/dynamic';

import { usePostModalInnerState } from '..';

// Views
const PostModerationAC = dynamic(() => import('./PostModerationAC'));
const PostModerationMC = dynamic(() => import('./PostModerationMC'));
const PostModerationCF = dynamic(() => import('./PostModerationCF'));
const PostViewScheduled = dynamic(() => import('../common/PostViewScheduled'));
const PostViewProcessingAnnouncement = dynamic(
  () => import('../common/PostViewProcessingAnnouncement')
);

interface IModerationView {}

const ModerationView: React.FunctionComponent<IModerationView> = () => {
  const { postParsed, postStatus, typeOfPost } = usePostModalInnerState();

  if (postStatus === 'processing_announcement' && postParsed) {
    return (
      <PostViewProcessingAnnouncement
        key={postParsed.postUuid}
        variant='moderation'
      />
    );
  }

  if (postStatus === 'scheduled' && postParsed) {
    return <PostViewScheduled key={postParsed.postUuid} variant='moderation' />;
  }

  if (typeOfPost === 'mc' && postParsed) {
    return <PostModerationMC key={postParsed.postUuid} />;
  }

  if (typeOfPost === 'ac' && postParsed) {
    return <PostModerationAC key={postParsed.postUuid} />;
  }

  if (typeOfPost === 'cf' && postParsed) {
    return <PostModerationCF key={postParsed.postUuid} />;
  }

  return null;
};

export default ModerationView;
