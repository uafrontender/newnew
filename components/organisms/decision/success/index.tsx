import React from 'react';
import { newnewapi } from 'newnew-api';

import { TPostType } from '../../../../utils/switchPostType';

// Views
import PostSuccessMC from './PostSuccessMC';
import PostSuccessAC from './PostSuccessAC';
import { PostSkeletonView } from '../PostSkeleton';

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
