import React from 'react';
import styled from 'styled-components';

import AnimatedPresence, { TWordsAnimation } from './AnimatedPresence';

interface IHeadline {
  id?: string;
  variant?: 1 | 2 | 3 | 4 | 5 | 6;
  children: React.ReactNode;
  animation?: TWordsAnimation;
  animateWhenInView?: boolean;
  onClick?: () => void;
}

const Headline: React.FC<IHeadline> = (props) => {
  const { variant, children, animation, animateWhenInView, ...rest } = props;

  const components = {
    1: SH1,
    2: SH2,
    3: SH3,
    4: SH4,
    5: SH5,
    6: SH6,
  };
  const Component = components[variant ?? 1];

  if (animation) {
    return (
      <Component {...rest}>
        <AnimatedPresence
          animation={animation}
          animateWhenInView={animateWhenInView}
        >
          {children as string}
        </AnimatedPresence>
      </Component>
    );
  }

  return <Component {...rest}>{children}</Component>;
};

Headline.defaultProps = {
  variant: 1,
  animation: undefined,
  animateWhenInView: true,
  onClick: () => {},
};

export default Headline;

interface ISH {
  animation?: 't01' | undefined;
}

const SH1 = styled.h1<ISH>`
  color: ${(props) => props.theme.colorsThemed.text.primary};
  font-weight: bold;

  font-size: 32px;
  line-height: 40px;

  ${({ theme }) => theme.media.tablet} {
    font-size: 40px;
    line-height: 48px;
  }

  ${({ theme }) => theme.media.laptop} {
    font-size: 56px;
    line-height: 64px;
  }
`;

const SH2 = styled.h2<ISH>`
  color: ${(props) => props.theme.colorsThemed.text.primary};
  font-weight: bold;

  font-size: 28px;
  line-height: 36px;

  ${({ theme }) => theme.media.tablet} {
    font-size: 36px;
    line-height: 44px;
  }

  ${({ theme }) => theme.media.laptop} {
    font-size: 48px;
    line-height: 56px;
  }
`;

const SH3 = styled.h3<ISH>`
  color: ${(props) => props.theme.colorsThemed.text.primary};
  font-weight: bold;

  font-size: 24px;
  line-height: 32px;

  ${({ theme }) => theme.media.tablet} {
    font-size: 32px;
    line-height: 40px;
  }

  ${({ theme }) => theme.media.laptop} {
    font-size: 40px;
    line-height: 48px;
  }
`;

const SH4 = styled.h4<ISH>`
  color: ${(props) => props.theme.colorsThemed.text.primary};
  font-weight: bold;

  font-size: 22px;
  line-height: 30px;

  ${({ theme }) => theme.media.tablet} {
    font-size: 28px;
    line-height: 36px;
  }

  ${({ theme }) => theme.media.laptop} {
    font-size: 32px;
    line-height: 40px;
  }
`;

const SH5 = styled.h5<ISH>`
  color: ${(props) => props.theme.colorsThemed.text.primary};
  font-weight: bold;

  font-size: 20px;
  line-height: 28px;

  ${({ theme }) => theme.media.tablet} {
    font-size: 24px;
    line-height: 32px;
  }

  ${({ theme }) => theme.media.laptop} {
    font-size: 24px;
    line-height: 32px;
  }
`;

const SH6 = styled.h6<ISH>`
  color: ${(props) => props.theme.colorsThemed.text.primary};
  font-weight: bold;

  font-size: 18px;
  line-height: 26px;

  ${({ theme }) => theme.media.tablet} {
    font-size: 20px;
    line-height: 28px;
  }

  ${({ theme }) => theme.media.laptop} {
    font-size: 20px;
    line-height: 28px;
  }
`;
