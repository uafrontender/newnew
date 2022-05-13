import React, { useEffect, useMemo, useState } from 'react';
import styled, { useTheme } from 'styled-components';
import assets from '../../constants/assets';
import useImageLoaded from '../../utils/hooks/useImageLoaded';
import isSafari from '../../utils/isSafari';

interface QuestionMarkVisualI {
  alt: string;
}

const QuestionMarkVisual: React.FC<QuestionMarkVisualI> = ({ alt }) => {
  const theme = useTheme();
  const shouldUseCssFade = useMemo(() => isSafari(), []);
  const [currentState, setCurrentState] = useState<'intro' | 'hold'>(
    shouldUseCssFade ? 'hold' : 'intro'
  );

  const {
    ref: introRef,
    loaded: introLoaded,
    onLoad: onIntroLoaded,
  } = useImageLoaded();

  useEffect(() => {
    if (introLoaded) {
      setTimeout(() => {
        setCurrentState('hold');
      }, 1750);
    }
  }, [introLoaded]);

  return (
    <Container>
      <Image
        src={
          theme.name === 'light'
            ? assets.info.lightQuestionMarkStatic
            : assets.info.darkQuestionMarkStatic
        }
        alt={alt}
        style={{ opacity: introLoaded && currentState === 'hold' ? 1 : 0 }}
      />
      <Animation
        ref={(el) => {
          introRef.current = el!!;
        }}
        src={
          theme.name === 'light'
            ? assets.info.lightQuestionMarkAnimated
            : assets.info.darkQuestionMarkAnimated
        }
        alt={alt}
        style={{ opacity: introLoaded && currentState === 'intro' ? 1 : 0 }}
        onLoad={onIntroLoaded}
      />
    </Container>
  );
};
export default QuestionMarkVisual;

const Container = styled('div')`
  position: relative;
  display: flex;
`;

const Image = styled('img')`
  display: flex;
  width: 100%;
  object-fit: contain;
`;

const Animation = styled('img')`
  display: flex;
  position: absolute;
  object-fit: contain;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`;
