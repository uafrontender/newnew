import React, { useState, useRef, useLayoutEffect } from 'react';
import styled from 'styled-components';
import { newnewapi } from 'newnew-api';
import Link from 'next/link';

import getDisplayname from '../utils/getDisplayname';
import InlineSvg from './atoms/InlineSVG';
import VerificationCheckmark from '../public/images/svg/icons/filled/Verification.svg';

interface IDisplayName {
  className?: string;
  user?: newnewapi.IUser | null;
  href?: string;
  onClick?: () => void;
}

// TODO: Probably needs to cover "me", "I", "my" cases as well
const DisplayName: React.FC<IDisplayName> = ({
  className,
  user,
  href,
  onClick,
}) => {
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

  if (href) {
    return (
      <>
        <Link href={href}>
          <SName ref={spanRef} className={className} onClick={onClick}>
            {getDisplayname(user)}
          </SName>
        </Link>
        {user.options?.isVerified && (
          // Need to make icon to be the same size as span. No better way found.
          <SInlineSvg
            height={`${size}px`}
            width='auto'
            svg={VerificationCheckmark}
            fill='none'
            onClick={onClick}
          />
        )}
      </>
    );
  }

  return (
    <>
      <SName ref={spanRef} className={className} onClick={onClick}>
        {getDisplayname(user)}
      </SName>
      {user.options?.isVerified && (
        // Need to make icon to be the same size as span. No better way found.
        <SInlineSvg
          height={`${size}px`}
          width='auto'
          svg={VerificationCheckmark}
          fill='none'
          onClick={onClick}
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
