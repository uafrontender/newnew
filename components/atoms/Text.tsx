import React from 'react';
import styled from 'styled-components';

interface IText {
  className?: string;
  id?: string;
  weight?: 500 | 600 | 700;
  variant?: 1 | 2 | 3 | 4 | 5 | 'subtitle';
  onClick?: (e: any) => void;
  tone?: 'neutral' | 'error';
  children: React.ReactNode;
}

const Text: React.FC<IText> = React.memo((props) => {
  const { variant, children, ...rest } = props;

  const components = {
    1: SText1,
    2: SText2,
    3: SText3,
    4: SText4,
    5: SText5,
    subtitle: STextSubtitle,
  };
  const Component = components[variant ?? 1];

  return <Component {...rest}>{children}</Component>;
});

Text.defaultProps = {
  weight: 500,
  variant: 1,
  onClick: () => {},
  tone: 'neutral',
};

export default Text;

const SText = styled.div<IText>`
  color: ${(props) =>
    props.tone === 'error'
      ? props.theme.colorsThemed.accent.error
      : props.theme.colorsThemed.text.primary};
  font-weight: ${(props) => props.weight};
`;

const SText1 = styled(SText)`
  font-size: 16px;
  line-height: 24px;

  ${({ theme }) => theme.media.tablet} {
    font-size: 16px;
    line-height: 20px;
  }

  ${({ theme }) => theme.media.laptop} {
    font-size: 24px;
    line-height: 32px;
  }
`;

const SText2 = styled(SText)`
  font-size: 14px;
  line-height: 20px;

  ${({ theme }) => theme.media.tablet} {
    font-size: 16px;
    line-height: 24px;
  }

  ${({ theme }) => theme.media.laptop} {
    font-size: 16px;
    line-height: 24px;
  }
`;

const SText3 = styled(SText)`
  font-size: 14px;
  line-height: 20px;

  ${({ theme }) => theme.media.tablet} {
    font-size: 14px;
    line-height: 18px;
  }

  ${({ theme }) => theme.media.laptop} {
    font-size: 14px;
    line-height: 20px;
  }
`;

const SText4 = styled(SText)`
  font-size: 14px;
  line-height: 20px;

  ${({ theme }) => theme.media.tablet} {
    font-size: 16px;
    line-height: 20px;
  }

  ${({ theme }) => theme.media.laptop} {
    font-size: 24px;
    line-height: 32px;
  }
`;

const SText5 = styled(SText)`
  font-size: 16px;
  line-height: 24px;

  ${({ theme }) => theme.media.tablet} {
    font-size: 16px;
    line-height: 20px;
  }

  ${({ theme }) => theme.media.laptop} {
    font-size: 20px;
    line-height: 28px;
  }
`;

const STextSubtitle = styled(SText)`
  font-size: 12px;
  line-height: 16px;
  font-weight: ${(props) => props.weight || 600};
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};
`;
