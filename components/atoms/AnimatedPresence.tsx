import React from 'react';
import { useInView } from 'react-intersection-observer';
import { motion, AnimatePresence as FMAnimatedPresence } from 'framer-motion';

export type TAnimation =
  | 't-01'
  | 't-01-reverse'
  | 't-02'
  | 't-08'
  | 't-09'
  | 't-10'
  | 'trans-06'
  | 'trans-06-reverse'
  | 'o-02'
  | 'o-11'
  | 'o-11-reverse'
  | 'o-12'
  | 'o-12-reverse';

interface IAnimatedWords {
  start?: boolean;
  delay?: number;
  duration?: number;
  animation: TAnimation;
  onAnimationEnd?: () => void;
  animateWhenInView?: boolean;
}

export const AnimatedPresence: React.FC<IAnimatedWords> = (props) => {
  const {
    start,
    delay,
    duration,
    animation,
    animateWhenInView,
    onAnimationEnd,
  } = props;
  let { children } = props;
  const { ref, inView } = useInView();

  let startAnimation = start;

  if (animateWhenInView) {
    startAnimation = start && inView;
  }

  const variants: any = {
    't-01': {
      opacity: 1,
      transition: {
        delay: delay ?? 0.5,
        duration: duration ?? 1,
      },
    },
    't-01_initial': {
      opacity: 0,
    },
    't-01_exit': {
      opacity: 0,
    },
    't-01-reverse': {
      opacity: 0,
      transition: {
        delay: delay ?? 0.5,
        duration: duration ?? 1,
      },
    },
    't-01_initial-reverse': {
      opacity: 1,
    },
    't-01_exit-reverse': {
      opacity: 1,
    },
    't-02': {
      y: 0,
      opacity: 1,
      transition: {
        ease: 'easeInOut',
        type: 'spring',
        delay: delay ?? 0.5,
        bounce: 0,
      },
    },
    't-02_initial': {
      y: 50,
      opacity: 0,
    },
    't-02_exit': {
      y: 50,
      opacity: 0,
    },
    't-08': {
      opacity: 1,
      transition: {
        staggerChildren: delay ?? 0.5,
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
        x: {
          type: 'spring',
          stiffness: 1000,
        },
        default: { duration: 2 },
      },
    },
    't-09_initial': {
      x: -10,
    },
    't-09_exit': {
      opacity: 0,
    },
    't-10': {
      x: 5,
      transition: {
        delay: delay ?? 0.5,
        repeat: Infinity,
        bounce: 0,
        duration: 0.5,
        repeatType: 'reverse',
        repeatDelay: 0.5,
      },
    },
    't-10_initial': {
      x: 0,
    },
    't-10_exit': {
      x: 0,
    },
    'trans-06': {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        delay: delay ?? 0.5,
        bounce: 0.5,
      },
    },
    'trans-06_initial': {
      y: 20,
      opacity: 0,
    },
    'trans-06_exit': {
      y: 20,
      opacity: 0,
    },
    'trans-06-reverse': {
      y: 120,
      opacity: 0,
      transition: {},
    },
    'trans-06_initial-reverse': {
      y: 0,
      opacity: 1,
    },
    'trans-06_exit-reverse': {
      y: 0,
      opacity: 1,
    },
    'o-02': {
      x: 0,
      opacity: 1,
      transition: {
        delay: delay ?? 0.1,
        bounce: 0,
        duration: duration ?? 1,
      },
    },
    'o-02_initial': {
      x: 10,
      opacity: 0,
    },
    'o-02_exit': {
      x: 10,
      opacity: 0,
    },
    'o-11': {
      y: -5,
      opacity: 1,
      transition: {
        delay: delay ?? 0.1,
        bounce: 0,
      },
    },
    'o-11_initial': {
      y: 0,
      opacity: 1,
    },
    'o-11_exit': {
      y: 0,
      opacity: 1,
    },
    'o-11-reverse': {
      y: 0,
      opacity: 1,
      transition: {
        delay: delay ?? 0.1,
        bounce: 0,
      },
    },
    'o-11_initial-reverse': {
      y: -5,
      opacity: 1,
    },
    'o-11_exit-reverse': {
      y: -5,
      opacity: 1,
    },
    'o-12': {
      height: 'auto',
      visibility: 'visible',
      opacity: 1,
      transition: {
        delay: delay ?? 0.1,
        bounce: 0,
      },
    },
    'o-12_initial': {
      height: 0,
      visibility: 'hidden',
      opacity: 0,
      transition: {
        opacity: {
          duration: 0,
        },
      },
    },
    'o-12_exit': {
      height: 0,
      visibility: 'hidden',
      opacity: 0,
      transition: {
        opacity: {
          duration: 0,
        },
      },
    },
    'o-12-reverse': {
      height: 0,
      visibility: 'hidden',
      opacity: 0,
      transition: {
        opacity: {
          duration: 0,
        },
      },
    },
    'o-12_initial-reverse': {
      height: 'auto',
      visibility: 'visible',
      opacity: 1,
      transition: {
        delay: delay ?? 0.1,
        bounce: 0,
      },
    },
    'o-12_exit-reverse': {
      height: 0,
      visibility: 'hidden',
      opacity: 0,
      transition: {
        opacity: {
          duration: 0,
        },
      },
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
    children = children.split(' ').map((word: string) => (
      <motion.span key={`${children}-${word}`} variants={variantsChild}>
        {`${word} `}
      </motion.span>
    ));
  }

  return (
    <FMAnimatedPresence>
      <motion.div
        ref={ref}
        exit={`${animation}_exit`}
        animate={startAnimation && animation}
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
  duration: undefined,
  animateWhenInView: true,
  onAnimationEnd: () => {},
};
