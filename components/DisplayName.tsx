import React, { useState, useRef, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { newnewapi } from 'newnew-api';
import Link from 'next/link';

import getDisplayname from '../utils/getDisplayname';
import InlineSvg from './atoms/InlineSVG';
import VerificationCheckmark from '../public/images/svg/icons/filled/Verification.svg';
import VerificationCheckmarkInverted from '../public/images/svg/icons/filled/VerificationInverted.svg';
import { TUserData } from '../redux-store/slices/userStateSlice';

interface IDisplayName {
  className?: string;
  user: newnewapi.IUser | newnewapi.ITinyUser | TUserData | null | undefined;
  altName?: string;
  suffix?: string;
  href?: string;
  inverted?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

const DisplayName: React.FC<IDisplayName> = ({
  className,
  user,
  altName,
  suffix,
  href,
  inverted,
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

  // Might not re-calculate size on parent size changed
  // useEffect => verified icon delayed
  // useLayoutEffect => warning about it doing nothing on ssr
  // useLayoutEffect + Component delayed => same as just useEffect
  useEffect(() => {
    if (!isVerified) {
      return;
    }

    if (spanRef.current) {
      const spanSize = spanRef.current?.offsetHeight;
      setSize(spanSize);
    }
  }, [isVerified]);

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
            width={`${size}px`}
            svg={
              inverted ? VerificationCheckmarkInverted : VerificationCheckmark
            }
            fill='none'
            wrapperType='span'
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
          width={`${size}px`}
          svg={inverted ? VerificationCheckmarkInverted : VerificationCheckmark}
          fill='none'
          wrapperType='span'
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
