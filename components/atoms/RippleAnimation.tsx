import { keyframes } from 'styled-components';

const RippleAnimation = keyframes`
  0% {
    transform: scale(0);
    opacity: .4;
  }
  80% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0;
  }
`;

export default RippleAnimation;
