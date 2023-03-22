/* eslint-disable no-nested-ternary */
import React from 'react';

// Views
import PostRegular from './PostRegular';
import PostModeration from './PostModeration';
import PostAwaitingSuccess from './PostAwaitingSuccess';

interface IPost {
  isMyPost: boolean;
  shouldRenderVotingFinishedModal: boolean;
}

// Memorization does not work
const Post: React.FunctionComponent<IPost> = ({
  isMyPost,
  shouldRenderVotingFinishedModal,
}) => (
  <>
    {isMyPost ? (
      // Render Moderation view
      <PostModeration />
    ) : shouldRenderVotingFinishedModal ? (
      // Render awaiting response or success view
      <PostAwaitingSuccess />
    ) : (
      // Render regular view
      <PostRegular />
    )}
  </>
);

Post.defaultProps = {};

export default Post;
