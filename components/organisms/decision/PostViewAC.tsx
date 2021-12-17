/* eslint-disable arrow-body-style */
import React, { useState } from 'react';
import styled from 'styled-components';
import { newnewapi } from 'newnew-api';

import PostVideo from '../../molecules/decision/PostVideo';
import PostTitle from '../../molecules/decision/PostTitle';
import PostTimer from '../../molecules/decision/PostTimer';

// Temp
const MockVideo = '/video/mock/mock_video_1.mp4';

interface IPostViewAC {
  post: newnewapi.Auction;
}

const PostViewAC: React.FunctionComponent<IPostViewAC> = ({
  post,
}) => {
  // NB! Will be moved to Redux
  const [muted, setMuted] = useState(true);
  return (
    <SWrapper>
      <SExpiresSection>
        <PostTimer
          timestampSeconds={
            Math.floor((new Date('2021-12-30').getTime() - Date.now()) / 1000)
            // Temp, because the date was old
            // new Date((post.expiresAt?.seconds as number) * 1000).getTime() - Date.now()
          }
        />
      </SExpiresSection>
      <PostVideo
        videoSrc={post.announcement?.videoUrl ?? MockVideo}
        isMuted={muted}
        handleToggleMuted={() => setMuted((curr) => !curr)}
      />
      <PostTitle>
        { post.title }
      </PostTitle>
    </SWrapper>
  );
};

export default PostViewAC;

const SWrapper = styled.div`
  display: grid;

  grid-template-areas:
    'expires'
    'video'
    'title'
    'activites'
  ;

  margin-bottom: 32px;

  ${({ theme }) => theme.media.tablet} {
      grid-template-areas:
      'expires expires'
      'title title'
      'video activites'
    ;
  }

  ${({ theme }) => theme.media.laptop} {
      grid-template-areas:
      'video expires'
      'video title'
      'video activites'
    ;

    grid-template-columns: 1fr 1fr;
  }
`;

const SExpiresSection = styled.div`
  grid-area: expires;

`;
