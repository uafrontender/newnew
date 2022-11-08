import React from 'react';
import { newnewapi } from 'newnew-api';

import { TPostType } from '../../../../utils/switchPostType';

// Views
import { PostSkeletonView } from '../PostSkeleton';
import PostAwaitingResponseAC from './PostAwaitingResponseAC';
import PostAwaitingResponseMC from './PostAwaitingResponseMC';

interface IWaitingForResponseView {
  postParsed:
    | newnewapi.Auction
    | newnewapi.Crowdfunding
    | newnewapi.MultipleChoice;
  typeOfPost: TPostType;
}

const WaitingForResponseView: React.FunctionComponent<
  IWaitingForResponseView
> = ({ postParsed, typeOfPost }) => {
  if (typeOfPost === 'ac' && postParsed) {
    return (
      <PostAwaitingResponseAC
        key={postParsed.postUuid}
        post={postParsed as newnewapi.Auction}
      />
    );
  }

  if (typeOfPost === 'mc' && postParsed) {
    return (
      <PostAwaitingResponseMC
        key={postParsed.postUuid}
        post={postParsed as newnewapi.MultipleChoice}
      />
    );
  }

  return <PostSkeletonView />;
};

export default WaitingForResponseView;
