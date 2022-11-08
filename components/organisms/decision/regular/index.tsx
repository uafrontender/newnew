import React from 'react';

import { usePostModalInnerState } from '../../../../contexts/postModalInnerContext';

// Views
import { PostSkeletonView } from '../PostSkeleton';
import PostViewMC from './PostViewMC';
import PostViewAC from './PostViewAC';
import PostViewScheduled from '../common/PostViewScheduled';
import PostViewProcessingAnnouncement from '../common/PostViewProcessingAnnouncement';

interface IRegularView {}

const RegularView: React.FunctionComponent<IRegularView> = () => {
  const { postParsed, postStatus, typeOfPost } = usePostModalInnerState();

  if (postStatus === 'scheduled' && postParsed) {
    return <PostViewScheduled key={postParsed.postUuid} variant='decision' />;
  }

  if (postStatus === 'processing_announcement' && postParsed) {
    return (
      <PostViewProcessingAnnouncement
        key={postParsed.postUuid}
        variant='decision'
      />
    );
  }

  if (typeOfPost === 'mc' && postParsed) {
    return <PostViewMC key={postParsed.postUuid} />;
  }

  if (typeOfPost === 'ac' && postParsed) {
    return <PostViewAC key={postParsed.postUuid} />;
  }

  return <PostSkeletonView />;
};

export default RegularView;
