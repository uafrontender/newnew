import React, { useState, useRef, useEffect } from 'react';
import styled, { useTheme } from 'styled-components';
import GenericSkeleton from '../GenericSkeleton';

interface IProfileImage {
  src: string | undefined;
}

const ProfileImage: React.FunctionComponent<IProfileImage> = ({ src }) => {
  const theme = useTheme();

  const imageRef = useRef<HTMLImageElement>();
  const [loaded, setLoaded] = useState(false);

  // Covers a case when image is loaded right away (SSR)
  useEffect(() => {
    if (imageRef.current?.complete) {
      setLoaded(true);
    }
  }, []);

  return (
    <SProfileImage>
      <SGenericSkeleton
        visible={!loaded}
        bgColor={theme.colorsThemed.background.tertiary}
        highlightColor={theme.colorsThemed.background.quaternary}
      />
      <SImg
        ref={(e) => {
          if (e) {
            imageRef.current = e;
          }
        }}
        visible={loaded}
        src={src}
        alt='User avatar'
        width='100%'
        height='100%'
        draggable={false}
        onLoad={() => {
          setLoaded(true);
        }}
      />
    </SProfileImage>
  );
};

export default ProfileImage;

const SProfileImage = styled.div`
  position: absolute;
  left: calc(50% - 48px);
  top: 112px;
  overflow: hidden;

  z-index: 5;

  border-radius: 50%;

  box-shadow: 0px 0px 0px 16px
    ${({ theme }) => theme.colorsThemed.background.secondary};
  background: ${({ theme }) => theme.colorsThemed.background.secondary};

  width: 96px;
  height: 96px;

  /* No select */
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;

  ${(props) => props.theme.media.tablet} {
    top: 152px;
  }

  ${(props) => props.theme.media.laptop} {
    top: 192px;
  }
`;

const SGenericSkeleton = styled(GenericSkeleton)<{ visible: boolean }>`
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: ${({ visible }) => (visible ? 1 : 0)};
`;

const SImg = styled.img<{ visible: boolean }>`
  opacity: ${({ visible }) => (visible ? 1 : 0)};
`;
