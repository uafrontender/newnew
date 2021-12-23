/* eslint-disable no-nested-ternary */
/* eslint-disable jsx-a11y/media-has-caption */
import React, { useState } from 'react';
import styled from 'styled-components';
import Headline from '../../atoms/Headline';

const PostTitle: React.FunctionComponent = ({
  children,
}) => {
  const [isEllipsed, setIsEllipsed] = useState(true);

  return (
    <SHeadline
      variant={5}
      ellipsed={isEllipsed}
      onClick={() => setIsEllipsed((c) => !c)}
    >
      { !isEllipsed ? (
        children
      ) : (
        (children as string).length > 100
          ? (
            `${(children as string).slice(0, 100)}...`
          ) : children
      ) }
    </SHeadline>
  );
};

export default PostTitle;

const SHeadline = styled(Headline)<{
  ellipsed: boolean;
}>`
  grid-area: title;

  /* height: fit-content; */

  margin-top: 24px;
  margin-bottom: 12px;

  ${({ theme }) => theme.media.laptop} {
    margin-bottom: 16px;
  }
`;
