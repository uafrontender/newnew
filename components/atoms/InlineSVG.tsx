import React from 'react';
import styled, { css } from 'styled-components';

interface IInlineSvg {
  id?: string;
  svg: string;
  fill?: string;
  width?: string;
  height?: string;
  onClick?: () => any;
  hoverFill?: string | undefined;
  clickable?: boolean;
  scaleOnClick?: boolean;
}

export const InlineSvg: React.FC<IInlineSvg> = (props) => {
  const { svg, ...rest } = props;

  return <SSvgHolder {...rest} dangerouslySetInnerHTML={{ __html: svg }} {...props} />;
};

InlineSvg.defaultProps = {
  id: '',
  fill: 'white',
  width: '100%',
  height: '100%',
  onClick: () => {},
  clickable: false,
  hoverFill: undefined,
  scaleOnClick: false,
};

export default InlineSvg;

const SSvgHolder = styled.div<IInlineSvg>`
  width: ${(props) => props.width};
  height: ${(props) => props.height};
  display: flex;
  align-items: center;
  justify-content: center;

  ${(props) =>
    !!props.clickable &&
    css`
      cursor: pointer;
    `}
  ${(props) =>
    !!props.scaleOnClick &&
    css`
      transition: 0.2s linear;

      &:active {
        transform: scale(0.8);
      }
    `}
  svg {
    fill: ${(props) => props.fill};
    width: 100%;
    height: auto;
    transition: fill ease 0.5s;

    &:hover {
      ${(props) => !!props.hoverFill && `fill: ${props.hoverFill};`}
    }
  }
`;
