import { keyframes } from 'styled-components';

const RippleAnimation = keyframes`
  0% {
    transform: scale(0);
  }
  60% {
    transform: scale(.3);
  }
  70% {
    transform: scale(.45);
  }
  80% {
    transform: scale(.65);
  }
  100% {
    transform: scale(1);
  }
`;

export default RippleAnimation;
