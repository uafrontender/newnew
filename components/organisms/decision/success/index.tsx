import React from 'react';
import dynamic from 'next/dynamic';
import { newnewapi } from 'newnew-api';

import { TPostType } from '../../../../utils/switchPostType';
import { PostSkeletonView } from '../PostSkeleton';

// Views
const PostSuccessAC = dynamic(() => import('./PostSuccessAC'));
const PostSuccessMC = dynamic(() => import('./PostSuccessMC'));

interface ISuccessView {
  postParsed:
    | newnewapi.Auction
    | newnewapi.Crowdfunding
    | newnewapi.MultipleChoice;
  typeOfPost: TPostType;
}

const SuccessView: React.FunctionComponent<ISuccessView> = ({
  postParsed,
  typeOfPost,
}) => {
  if (typeOfPost === 'mc' && postParsed) {
    return (
      <PostSuccessMC
        key={postParsed.postUuid}
        post={postParsed as newnewapi.MultipleChoice}
      />
    );
  }

  if (typeOfPost === 'ac' && postParsed) {
    return (
      <PostSuccessAC
        key={postParsed.postUuid}
        post={postParsed as newnewapi.Auction}
      />
    );
  }

  return <PostSkeletonView />;
};

export default SuccessView;
