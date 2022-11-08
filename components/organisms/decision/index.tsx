/* eslint-disable no-nested-ternary */
import React from 'react';

// Views
import PostModalRegular from './PostModalRegular';
import PostModalModeration from './PostModalModeration';
import PostModalAwaitingSuccess from './PostModalAwaitingSuccess';

interface IPostModal {
  isMyPost: boolean;
  shouldRenderVotingFinishedModal: boolean;
}

// Memorization does not work
const PostModal: React.FunctionComponent<IPostModal> = ({
  isMyPost,
  shouldRenderVotingFinishedModal,
}) => (
  <>
    {isMyPost ? (
      // Render Moderation view
      <PostModalModeration />
    ) : shouldRenderVotingFinishedModal ? (
      // Render awaiting response or success view
      <PostModalAwaitingSuccess />
    ) : (
      // Render regular view
      <PostModalRegular />
    )}
  </>
);

PostModal.defaultProps = {};

export default PostModal;
