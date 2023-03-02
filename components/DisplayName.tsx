import React, { useState, useRef, useLayoutEffect, useMemo } from 'react';
import styled from 'styled-components';
import { newnewapi } from 'newnew-api';
import Link from 'next/link';

import getDisplayname from '../utils/getDisplayname';
import InlineSvg from './atoms/InlineSVG';
import VerificationCheckmark from '../public/images/svg/icons/filled/Verification.svg';
import { TUserData } from '../redux-store/slices/userStateSlice';

interface IDisplayName {
  className?: string;
  user: newnewapi.IUser | newnewapi.ITinyUser | TUserData | null | undefined;
  altName?: string;
  suffix?: string;
  href?: string;
  onClick?: () => void;
}

const DisplayName: React.FC<IDisplayName> = ({
  className,
  user,
  altName,
  suffix,
  href,
  onClick,
}) => {
  const spanRef = useRef<HTMLSpanElement>(null);
  const [size, setSize] = useState<number>(0);

  const isVerified: boolean = useMemo(() => {
    if (!user) {
      return false;
    }

    // Tiny user
    if ('isVerified' in user) {
      return user.isVerified ?? false;
    }

    // newnewapi.IUser | TUserData
    if ('options' in user) {
      return user.options?.isVerified ?? false;
    }

    return false;
  }, [user]);
  const gap = useMemo(() => Math.round(size / 10), [size]);

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
            {altName ?? getDisplayname(user)}
            {suffix}
          </SName>
        </Link>
        {isVerified && (
          // Need to make icon to be the same size as span. No better way found.
          <SInlineSvg
            gap={gap}
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
        {altName ?? getDisplayname(user)}
        {suffix}
      </SName>
      {isVerified && (
        // Need to make icon to be the same size as span. No better way found.
        <SInlineSvg
          gap={gap}
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

const SInlineSvg = styled(InlineSvg)<{ gap: number }>`
  flex-shrink: 0;
  margin-left: ${({ gap }) => `${gap}px`};

  svg {
    height: 100%;
    width: 100%;
  }
`;
