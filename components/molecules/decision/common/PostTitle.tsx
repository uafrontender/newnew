/* eslint-disable no-nested-ternary */
/* eslint-disable jsx-a11y/media-has-caption */
import React, { useState } from 'react';
import styled, { css } from 'styled-components';

import Headline from '../../../atoms/Headline';

interface IPostTitle {
  shrink?: boolean;
  children: string;
}

const PostTitle: React.FunctionComponent<IPostTitle> = ({
  shrink,
  children,
}) => {
  const [isEllipsed, setIsEllipsed] = useState(true);

  return (
    <SHeadline
      variant={5}
      ellipsed={isEllipsed}
      shrink={shrink ?? false}
      onClick={() => setIsEllipsed((c) => !c)}
    >
      {!isEllipsed && !shrink
        ? children
        : (children as string).length > 100
        ? `${(children as string).slice(0, 100)}...`
        : children}
    </SHeadline>
  );
};

PostTitle.defaultProps = {
  shrink: undefined,
};

export default PostTitle;

const SHeadline = styled(Headline)<{
  ellipsed: boolean;
  shrink: boolean;
}>`
  margin-top: 24px;
  margin-bottom: 12px;

  transition: font-size linear 0.2s;

  ${({ theme }) => theme.media.laptop} {
    margin-bottom: 16px;
  }

  ${({ shrink }) =>
    shrink
      ? css`
          font-weight: 600;
          font-size: 12px;
          line-height: 16px;
          color: ${({ theme }) => theme.colorsThemed.text.tertiary};
          margin-bottom: 8px;

          ${({ theme }) => theme.media.laptop} {
            margin-bottom: 8px;
          }
        `
      : null};
`;
