/* eslint-disable no-nested-ternary */
/* eslint-disable jsx-a11y/media-has-caption */
import { newnewapi } from 'newnew-api';
import React, { useState } from 'react';
import styled from 'styled-components';
import Headline from '../../../atoms/Headline';

interface ISuggestionTitle {
  suggestion: newnewapi.Auction.Option;
}

const SuggestionTitle: React.FunctionComponent<ISuggestionTitle> = ({
  suggestion,
}) => {
  const [isEllipsed, setIsEllipsed] = useState(true);

  return (
    <>
      <SHeadline
        variant={5}
        ellipsed={isEllipsed}
        onClick={() => setIsEllipsed((c) => !c)}
      >
        { !isEllipsed ? (
          suggestion.title
        ) : (
          (suggestion.title as string).length > 100
            ? (
              `${(suggestion.title as string).slice(0, 100)}...`
            ) : suggestion.title
        ) }
      </SHeadline>
    </>
  );
};

export default SuggestionTitle;

const SHeadline = styled(Headline)<{
  ellipsed: boolean;
}>`
  grid-area: title;

  /* height: fit-content; */

  margin-top: 0px;
  margin-bottom: 12px;

  ${({ theme }) => theme.media.laptop} {
    margin-bottom: 16px;
  }
`;
