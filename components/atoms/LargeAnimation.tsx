import React, { useState } from 'react';
import styled from 'styled-components';
import isSafari from '../../utils/isSafari';

/**
 * This component makes sure large animations displayed well on following Platforms
 * And collects all the related bugfixes
 * It cant use .webp, .gif and .apng as these files are huge
 * Windows Chrome - can use video tag with mp4 and webm
 * Android Chrome - can use video tag with mp4 and webm
 * MacOS Safari -  can use img + mp4 (test), can't use webm/webp as it skips frames (test)
 * iOS Safari - can use img + mp4 (test), can't use webm/webp as it skips frames (test)
 */

interface LargeAnimationI {
  className?: string;
  placeholderSrc: string;
  videoSrc: string;
}

const LargeAnimation: React.FC<LargeAnimationI> = ({
  className,
  placeholderSrc,
  videoSrc,
}) => {
  const [loaded, setLoaded] = useState(false);

  if (isSafari()) {
    return (
      <Container className={className}>
        <Placeholder src={placeholderSrc} />
        <Animation
          src={videoSrc}
          visible={loaded}
          onLoad={() => {
            setLoaded(true);
          }}
        />
      </Container>
    );
  }

  return (
    <Container className={className}>
      <Video
        loop
        muted
        autoPlay
        playsInline
        poster={placeholderSrc}
        onLoad={() => {
          setLoaded(true);
        }}
      >
        <source src={videoSrc} type='video/webm' />
      </Video>
    </Container>
  );
};

LargeAnimation.defaultProps = {
  className: undefined,
};

export default LargeAnimation;

const Container = styled.div`
  position: relative;
`;

const Placeholder = styled.img`
  width: 100%;
  height: 100%;
`;

const Animation = styled.img<{ visible: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: ${({ visible }) => (visible ? 1 : 0)};
`;

const Video = styled.video`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  @media screen and (-webkit-min-device-pixel-ratio: 0) {
    -webkit-filter: brightness(108.5%);
  }
`;
