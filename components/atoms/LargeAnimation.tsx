import React from 'react';
import styled from 'styled-components';

/**
 * This component makes sure large animations displayed well on following Platforms
 * And collects all the related bugfixes
 * It cant use .webp, .gif and .apng as these files are huge
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
}) => (
  <Container className={className}>
    <Video
      key={videoSrc}
      loop
      muted
      autoPlay
      playsInline
      poster={placeholderSrc}
    >
      <source src={videoSrc} type='video/mp4' />
    </Video>
    {/* On safari video posted disappears too soon, we need to have image below */}
    <Placeholder src={placeholderSrc} />
  </Container>
);

LargeAnimation.defaultProps = {
  className: undefined,
};

export default LargeAnimation;

const Container = styled.div`
  position: relative;
`;

const Placeholder = styled.img`
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;
`;

const Video = styled.video`
  width: 100%;
  height: 100%;
  z-index: 1;

  // Chrome can't show white background, needs brightness fix
  @media screen and (-webkit-min-device-pixel-ratio: 0) {
    -webkit-filter: brightness(101%);
  }
`;
