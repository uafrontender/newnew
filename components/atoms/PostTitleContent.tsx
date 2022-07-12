import { useRouter } from 'next/router';
import React from 'react';
import styled from 'styled-components';
import getChunks from '../../utils/getChunks/getChunks';

interface PostTitleContentI {
  children: string;
  target?: '_blank' | '_parent' | '_self' | '+top' | 'router';
}

const PostTitleContent: React.FC<PostTitleContentI> = ({
  children,
  target,
}) => {
  const router = useRouter();
  return (
    <>
      {getChunks(children).map((chunk) => {
        if (chunk.type === 'text') {
          return chunk.text;
        }

        if (chunk.type === 'hashtag') {
          if (target === 'router') {
            return (
              <HashtagInert
                onClick={() =>
                  router.push(
                    `/search?query=${chunk.text}&type=hashtags&tab=posts`
                  )
                }
              >
                #{chunk.text}
              </HashtagInert>
            );
          }

          return (
            <Hashtag
              onClick={() =>
                console.log(
                  `/search?query=${chunk.text}&type=hashtags&tab=posts`
                )
              }
              href={`/search?query=${chunk.text}&type=hashtags&tab=posts`}
              target={target}
            >
              #{chunk.text}
            </Hashtag>
          );
        }

        // TODO: Add assertNever
        throw new Error('Unexpected chunk');
      })}
    </>
  );
};

PostTitleContent.defaultProps = {
  target: '_self',
};

export default PostTitleContent;

const Hashtag = styled.a`
  color: ${(props) => props.theme.colorsThemed.accent.blue};
  font-weight: 600;

  :hover {
    filter: brightness(120%);
  }
`;

const HashtagInert = styled.span`
  color: ${(props) => props.theme.colorsThemed.accent.blue};
  font-weight: 600;
  cursor: pointer;

  :hover {
    filter: brightness(120%);
  }
`;
