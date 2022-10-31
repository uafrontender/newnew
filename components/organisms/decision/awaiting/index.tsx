import React from 'react';
import dynamic from 'next/dynamic';
import { newnewapi } from 'newnew-api';

import { TPostType } from '../../../../utils/switchPostType';

// Views
const PostAwaitingResponseAC = dynamic(
  () => import('./PostAwaitingResponseAC')
);
const PostAwaitingResponseMC = dynamic(
  () => import('./PostAwaitingResponseMC')
);

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

  return null;
};

export default WaitingForResponseView;
