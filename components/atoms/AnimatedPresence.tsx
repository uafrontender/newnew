/* eslint-disable react/no-array-index-key */
import React from 'react';
import { motion, AnimatePresence as FMAnimatedPresence } from 'framer-motion';

interface IAnimatedWords {
  start?: boolean;
  animation: 't-01' | 't-02' | 't-08';
  onAnimationEnd?: () => void;
}

export const AnimatedPresence: React.FC<IAnimatedWords> = (props) => {
  const {
    start,
    animation,
    onAnimationEnd,
  } = props;
  let { children } = props;

  const variants = {
    't-01': {
      opacity: 1,
      transition: { delay: 0.5 },
    },
    't-01_initial': {
      opacity: 0,
    },
    't-01_exit': {
      opacity: 0,
    },
    't-02': {
      y: 0,
      opacity: 1,
      transition: { delay: 0.5 },
    },
    't-02_initial': {
      y: 100,
      opacity: 0,
    },
    't-02_exit': {
      y: 100,
      opacity: 0,
    },
    't-08': {
      opacity: 1,
      transition: {
        staggerChildren: 0.5,
      },
    },
    't-08_initial': {
      opacity: 0,
    },
    't-08_exit': {
      opacity: 0,
    },
  };

  if (animation === 't-08') {
    const variantsChild = {
      't-08': {
        opacity: 1,
      },
      't-08_initial': {
        opacity: 0,
      },
      't-08_exit': {
        opacity: 0,
      },
    };

    // @ts-ignore
    children = children.split(' ')
      .map((word: string) => (
        <motion.span key={`${children}-${word}`} variants={variantsChild}>
          {`${word} `}
        </motion.span>
      ));
  }

  return (
    <FMAnimatedPresence>
      <motion.div
        exit={`${animation}_exit`}
        style={{ overflow: 'hidden' }}
        animate={start && animation}
        initial={`${animation}_initial`}
        variants={variants}
        onAnimationComplete={onAnimationEnd}
      >
        {children}
      </motion.div>
    </FMAnimatedPresence>
  );
};

export default AnimatedPresence;

AnimatedPresence.defaultProps = {
  start: true,
  onAnimationEnd: () => {
  },
};
