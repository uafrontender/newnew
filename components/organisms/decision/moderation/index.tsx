import React from 'react';

import { usePostInnerState } from '../../../../contexts/postInnerContext';

// Views
import { PostSkeletonView } from '../PostSkeleton';
import PostModerationMC from './PostModerationMC';
import PostModerationAC from './PostModerationAC';
import PostViewScheduled from '../common/PostViewScheduled';
import PostViewProcessingAnnouncement from '../common/PostViewProcessingAnnouncement';

interface IModerationView {}

const ModerationView: React.FunctionComponent<IModerationView> = () => {
  const { postParsed, postStatus, typeOfPost } = usePostInnerState();

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

  return <PostSkeletonView />;
};

export default ModerationView;
