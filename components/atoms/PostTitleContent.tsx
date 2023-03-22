/* eslint-disable react/no-array-index-key */
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { Fragment } from 'react';
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
      {getChunks(children).map((chunk, index) => {
        if (chunk.type === 'text') {
          return <Fragment key={`text-chunk-${index}`}>{chunk.text}</Fragment>;
        }

        if (chunk.type === 'hashtag') {
          if (target === 'router') {
            return (
              <SHashtag
                key={`text-chunk-${index}`}
                onClick={() =>
                  router.push(
                    `/search?query=${chunk.text}&type=hashtags&tab=posts`
                  )
                }
              >
                #{chunk.text}
              </SHashtag>
            );
          }

          return (
            <Link
              key={`text-chunk-${index}`}
              href={`/search?query=${chunk.text}&type=hashtags&tab=posts`}
              target={target}
            >
              <SHashtag>{`#${chunk.text}`}</SHashtag>
            </Link>
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

const SHashtag = styled.span`
  display: inline;
  word-spacing: normal;
  overflow-wrap: break-word;
  color: ${(props) => props.theme.colorsThemed.accent.blue};
  font-weight: 600;
  cursor: pointer;

  :hover {
    filter: brightness(120%);
  }
`;
