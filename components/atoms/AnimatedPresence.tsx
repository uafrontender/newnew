/* eslint-disable react/no-array-index-key */
import React from 'react';
import { motion, AnimatePresence as FMAnimatedPresence, Variants } from 'framer-motion';

interface IAnimatedWords {
  start?: boolean;
  delay?: number;
  animation: 't-01' | 't-02' | 't-08' | 't-09';
  onAnimationEnd?: () => void;
}

export const AnimatedPresence: React.FC<IAnimatedWords> = (props) => {
  const {
    start,
    delay,
    animation,
    onAnimationEnd,
  } = props;
  let { children } = props;

  const variants: Variants = {
    't-01': {
      opacity: 1,
      transition: { delay: delay ?? 0.5 },
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
      transition: { delay: 0.5, bounce: 0 },
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
    't-09': {
      opacity: 1,
      x: 0,
      transition: {
        x: { type: 'spring', stiffness: 1000 },
        default: { duration: 2 },
      },
    },
    't-09_initial': {
      x: -10,
    },
    't-09_exit': {
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
  delay: undefined,
  onAnimationEnd: () => {
  },
};
