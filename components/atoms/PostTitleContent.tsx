import React from 'react';
import styled from 'styled-components';
import getChunks from '../../utils/getChunks/getChunks';

interface PostTitleContentI {
  children: string;
}

const PostTitleContent: React.FC<PostTitleContentI> = ({ children }) => (
  <>
    {getChunks(children).map((chunk) => {
      if (chunk.type === 'text') {
        return chunk.text;
      }

      if (chunk.type === 'hashtag') {
        return (
          <Hashtag href={`/search?query=${chunk.text}&type=hashtags&tab=posts`}>
            #{chunk.text}
          </Hashtag>
        );
      }

      // TODO: Add assertNever
      throw new Error('Unexpected chunk');
    })}
  </>
);

export default PostTitleContent;

const Hashtag = styled.a`
  color: ${(props) => props.theme.colorsThemed.accent.blue};
  font-weight: 600;
`;
