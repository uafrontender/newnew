/* eslint-disable no-nested-ternary */
import { newnewapi } from 'newnew-api';
import React, { useState } from 'react';
import styled from 'styled-components';
import Headline from '../../../../atoms/Headline';

interface IAcOptionTitle {
  option: newnewapi.Auction.Option;
}

const AcOptionTitle: React.FunctionComponent<IAcOptionTitle> = ({ option }) => {
  const [isEllipsed, setIsEllipsed] = useState(true);

  return (
    <>
      <SHeadline
        variant={5}
        ellipsed={isEllipsed}
        onClick={() => setIsEllipsed((c) => !c)}
      >
        {!isEllipsed
          ? option.title
          : (option.title as string).length > 100
          ? `${(option.title as string).slice(0, 100)}...`
          : option.title}
      </SHeadline>
    </>
  );
};

export default AcOptionTitle;

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
