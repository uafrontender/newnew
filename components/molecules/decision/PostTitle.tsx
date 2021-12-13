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
        (children as string).length > 10
          ? (
            `${(children as string).slice(0, 10)}...`
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
`;
