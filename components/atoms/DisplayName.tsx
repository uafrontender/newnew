import React, { useState, useRef, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { newnewapi } from 'newnew-api';
import Link from 'next/link';

import getDisplayname from '../../utils/getDisplayname';
import InlineSvg from './InlineSVG';
import VerificationCheckmark from '../../public/images/svg/icons/filled/Verification.svg';
import VerificationCheckmarkInverted from '../../public/images/svg/icons/filled/VerificationInverted.svg';
import { TUserData } from '../../redux-store/slices/userStateSlice';

export interface IDisplayName {
  className?: string;
  user: newnewapi.IUser | newnewapi.ITinyUser | TUserData | null | undefined;
  altName?: string;
  suffix?: string;
  href?: string;
  inverted?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

// TODO: go through the uses and clear external wrappers as this component has own wrapper now
const DisplayName: React.FC<IDisplayName> = ({
  className,
  user,
  altName,
  suffix,
  href,
  inverted,
  onClick,
}) => {
  const nameRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<number>(0);
  const [iconVisible, setIconVisible] = useState(false);

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

  const shift = useMemo(() => -(size >= 20 ? 1 : 0), [size]);
  const padding = useMemo(() => Math.max(Math.floor(size / 10) - 1, 0), [size]);
  const gap = useMemo(() => Math.round(size / 10), [size]);
  const displayName = useMemo(() => getDisplayname(user), [user]);
  const name = useMemo(() => altName ?? displayName, [altName, displayName]);

  // Might not re-calculate size on parent size changed
  // useEffect => verified icon delayed
  // useLayoutEffect => warning about it doing nothing on ssr
  // useLayoutEffect + Component delayed => same as just useEffect
  useEffect(() => {
    if (!isVerified) {
      return;
    }

    if (nameRef.current) {
      const spanSize = nameRef.current?.offsetHeight;
      setSize(spanSize);
    }
  }, [isVerified]);

  // Delay showing verified icon, to avoid glitches dues to UI instability on first render
  useEffect(() => {
    if (size > 0) {
      setIconVisible(true);
    }
  }, [size]);

  if (!user) {
    return null;
  }

  if (href) {
    return (
      <Wrapper className={className}>
        <Link href={href}>
          <SName ref={nameRef} onClick={onClick}>
            {name}
            {suffix}
          </SName>
        </Link>
        {isVerified && iconVisible && (
          // Need to make icon to be the same size as span. No better way found.
          <SInlineSvg
            shift={shift}
            padding={padding}
            gap={gap}
            height={`${size - 2}px`}
            width={`${size - 2}px`}
            svg={
              inverted ? VerificationCheckmarkInverted : VerificationCheckmark
            }
            fill='none'
            wrapperType='span'
            onClick={onClick}
          />
        )}
      </Wrapper>
    );
  }

  return (
    <Wrapper className={className}>
      <SName ref={nameRef} onClick={onClick}>
        {name}
        {suffix}
      </SName>
      {isVerified && (
        // Need to make icon to be the same size as span. No better way found.
        <SInlineSvg
          shift={shift}
          padding={padding}
          gap={gap}
          height={`${size}px`}
          width={`${size}px`}
          svg={inverted ? VerificationCheckmarkInverted : VerificationCheckmark}
          fill='none'
          wrapperType='span'
          onClick={onClick}
        />
      )}
    </Wrapper>
  );
};

export default DisplayName;

const Wrapper = styled.div`
  display: inline-flex;
  align-items: center;
  overflow: hidden;
`;

const SName = styled.div`
  flex-shrink: 1;
  white-space: pre;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const SInlineSvg = styled(InlineSvg)<{
  shift: number;
  padding: number;
  gap: number;
}>`
  position: relative;
  flex-shrink: 0;
  top: ${({ shift }) => `${shift}px`};
  padding: ${({ padding }) => `${padding}px`};
  margin-left: ${({ gap }) => `${gap}px`};

  svg {
    height: 100%;
    width: 100%;
  }
`;
