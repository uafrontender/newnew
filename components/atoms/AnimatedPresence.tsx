import React from 'react';
import { useInView } from 'react-intersection-observer';
import { motion, AnimatePresence as FMAnimatedPresence, Variants } from 'framer-motion';

export type TAnimation = 't-01' | 't-02' | 't-08' | 't-09' | 't-10' | 'trans-06' | 'trans-06-reverse';
interface IAnimatedWords {
  start?: boolean;
  delay?: number;
  animation: TAnimation;
  onAnimationEnd?: () => void;
  animateWhenInView?: boolean;
}

export const AnimatedPresence: React.FC<IAnimatedWords> = (props) => {
  const {
    start,
    delay,
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

  const variants: Variants = {
    't-01': {
      opacity: 1,
      transition: {
        delay: delay ?? 0.5,
      },
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
      transition: {
        ease: 'easeInOut',
        delay: delay ?? 0.5,
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
        delay: delay ?? 0.5,
      },
    },
    'trans-06_initial': {
      y: 120,
      opacity: 0,
    },
    'trans-06_exit': {
      y: 120,
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
  animateWhenInView: true,
  onAnimationEnd: () => {
  },
};
