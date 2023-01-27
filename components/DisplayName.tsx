import React, { useState, useRef, useLayoutEffect } from 'react';
import styled from 'styled-components';
import { newnewapi } from 'newnew-api';
import getDisplayname from '../utils/getDisplayname';
import InlineSvg from './atoms/InlineSVG';
import VerificationCheckmark from '../public/images/svg/icons/filled/Verification.svg';

interface IDisplayName {
  user?: newnewapi.IUser | null;
}

// TODO: Probably needs to cover "me", "I", "my" cases as well
const DisplayName: React.FC<IDisplayName> = ({ user }) => {
  const spanRef = useRef<HTMLSpanElement>(null);
  const [size, setSize] = useState<number>(0);

  useLayoutEffect(() => {
    if (spanRef.current) {
      setSize(spanRef.current?.offsetHeight);
    }
  }, []);

  if (!user) {
    return null;
  }

  return (
    <>
      <SName ref={spanRef}>{getDisplayname(user)}</SName>
      {user.options?.isVerified && (
        // Need to make icon to be the same size as span. No better way found.
        <SInlineSvg
          height={`${size}px`}
          width='auto'
          svg={VerificationCheckmark}
          fill='none'
        />
      )}
    </>
  );
};

export default DisplayName;

const SName = styled.span`
  white-space: pre;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const SInlineSvg = styled(InlineSvg)`
  flex-shrink: 0;
  // Should it depend on the size and be 1/10 of it?
  margin-left: 4px;

  svg {
    height: 100%;
    width: 100%;
  }
`;
