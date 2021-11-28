import React from 'react';
import { motion, Transition, SVGMotionProps } from 'framer-motion';

interface Props extends SVGMotionProps<any> {
  color?: string;
  isOpen?: boolean;
  lineProps?: any;
  transition?: Transition;
  strokeWidth?: string | number;
}

export const SortIconAnimated: React.FC<Props> = (props) => {
  const {
    width,
    color,
    isOpen,
    height,
    lineProps,
    transition,
    strokeWidth,
    ...rest
  } = props;
  const variant = isOpen ? 'opened' : 'closed';
  const top = {
    closed: {
      rotate: 0,
      translateY: 0,
    },
    opened: {
      rotate: 45,
      translateY: 1.5,
    },
  };
  const center = {
    closed: {
      opacity: 1,
    },
    opened: {
      opacity: 0,
    },
  };
  const bottom = {
    closed: {
      rotate: 0,
      translateY: 0,
    },
    opened: {
      rotate: -45,
      translateY: -1.5,
    },
  };
  const linePropsCustom = {
    transition,
    stroke: color,
    animate: variant,
    initial: 'closed',
    strokeWidth: strokeWidth as number,
    vectorEffect: 'non-scaling-stroke',
    strokeLinecap: 'round',
    ...lineProps,
  };
  const unitHeight = 3;
  const unitWidth = (unitHeight * (width as number)) / (height as number);

  return (
    <motion.svg
      width={width}
      height={height}
      viewBox={`0 0 ${unitWidth} ${unitHeight}`}
      overflow="visible"
      preserveAspectRatio="none"
      {...rest}
    >
      <motion.line
        x1="0"
        x2={unitWidth}
        y1="0"
        y2="0"
        variants={top}
        {...linePropsCustom}
      />
      <motion.line
        x1={isOpen ? 0 : unitWidth * 0.2}
        x2={isOpen ? unitWidth : unitWidth * 0.8}
        y1="1.5"
        y2="1.5"
        variants={center}
        {...linePropsCustom}
      />
      <motion.line
        x1={isOpen ? 0 : unitWidth * 0.4}
        x2={isOpen ? unitWidth : unitWidth * 0.6}
        y1={3}
        y2={3}
        variants={bottom}
        {...linePropsCustom}
      />
    </motion.svg>
  );
};

export default SortIconAnimated;

SortIconAnimated.defaultProps = {
  color: '#000',
  width: 24,
  isOpen: false,
  height: 24,
  lineProps: null,
  transition: undefined,
  strokeWidth: 1,
};
