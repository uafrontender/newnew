import React from 'react';
import dynamic from 'next/dynamic';

import { usePostModalInnerState } from '../../../../contexts/postModalInnerContext';

// Views
const PostViewAC = dynamic(() => import('./PostViewAC'));
const PostViewMC = dynamic(() => import('./PostViewMC'));
const PostViewScheduled = dynamic(() => import('../common/PostViewScheduled'));
const PostViewProcessingAnnouncement = dynamic(
  () => import('../common/PostViewProcessingAnnouncement')
);

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

  return null;
};

export default RegularView;
