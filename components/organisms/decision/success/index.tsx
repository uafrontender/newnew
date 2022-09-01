import React from 'react';
import dynamic from 'next/dynamic';
import { newnewapi } from 'newnew-api';

import { TPostType } from '../../../../utils/switchPostType';

// Views
const PostSuccessAC = dynamic(() => import('./PostSuccessAC'));
const PostSuccessMC = dynamic(() => import('./PostSuccessMC'));
const PostSuccessCF = dynamic(() => import('./PostSuccessCF'));

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

  if (typeOfPost === 'cf' && postParsed) {
    return (
      <PostSuccessCF
        key={postParsed.postUuid}
        post={postParsed as newnewapi.Crowdfunding}
      />
    );
  }

  return null;
};

export default SuccessView;
