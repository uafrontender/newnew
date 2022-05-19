import React, { useRef, useState } from 'react';
import styled, { useTheme } from 'styled-components';
import assets from '../../../constants/assets';

interface QuestionMarkVisualI {
  alt: string;
}

const QUESTION_MARK_INTRO_DURATION = 2800;
const QuestionMarkVisual: React.FC<QuestionMarkVisualI> = ({ alt }) => {
  const theme = useTheme();
  const [currentState, setCurrentState] = useState<'intro' | 'hold'>('intro');
  const timer = useRef<NodeJS.Timeout | undefined>();

  function scheduleHold() {
    if (currentState === 'hold') {
      return;
    }

    if (timer.current) {
      clearTimeout(timer.current);
    }

    const newTimer = setTimeout(() => {
      setCurrentState('hold');
    }, QUESTION_MARK_INTRO_DURATION);

    timer.current = newTimer;
  }

  return (
    <Container>
      <Image
        src={
          theme.name === 'light'
            ? assets.info.lightQuestionMarkStatic
            : assets.info.darkQuestionMarkStatic
        }
        alt={alt}
        style={{ opacity: currentState === 'hold' ? 1 : 0 }}
      />
      <Animation
        key='video-desktop'
        loop
        muted
        autoPlay
        playsInline
        poster={
          theme.name === 'light'
            ? assets.info.lightQuestionMarkStatic
            : assets.info.darkQuestionMarkStatic
        }
        style={{ opacity: currentState === 'intro' ? 1 : 0 }}
        onLoadedData={() => {
          scheduleHold();
        }}
      >
        <source
          src={
            theme.name === 'light'
              ? assets.info.lightQuestionMarkAnimated
              : assets.info.darkQuestionMarkAnimated
          }
          type='video/mp4'
        />
      </Animation>
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

const Animation = styled('video')`
  display: flex;
  position: absolute;
  object-fit: contain;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`;
