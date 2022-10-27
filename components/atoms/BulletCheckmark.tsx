/* eslint-disable no-nested-ternary */
/* eslint-disable react/destructuring-assignment */
import React from 'react';
import styled from 'styled-components';
import InlineSvg from './InlineSVG';
import CheckmarkIcon from '../../public/images/svg/icons/outlined/CheckmarkWIthoutFill.svg';

interface IBulletCheckmark {
  fill?: string;
  fillCheckmark?: string;
  width?: string;
  height?: string;
  widthCheckmark?: string;
  heightCheckmark?: string;
  margin?: string;
}

export const BulletCheckmark: React.FC<IBulletCheckmark> = (props) => (
  <SBulletCheckmark {...props}>
    <SInlineSVG
      svg={CheckmarkIcon}
      width={props.widthCheckmark}
      height={props.heightCheckmark}
      fill={props.fillCheckmark}
    />
  </SBulletCheckmark>
);

const SInlineSVG = styled(InlineSvg)<IBulletCheckmark>`
  width: ${(props) => props.widthCheckmark};
  height: ${(props) => props.heightCheckmark};
`;

const SBulletCheckmark = styled.div<IBulletCheckmark>`
  border-radius: 50%;
  background: ${(props) => props.fill};
  width: ${(props) => props.width};
  height: ${(props) => props.height};
  margin: ${(props) => props.margin};
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
`;

BulletCheckmark.defaultProps = {
  fill: 'white',
  fillCheckmark: 'black',
  width: '12px',
  height: '12px',
  widthCheckmark: '6px',
  heightCheckmark: '6px',
  margin: '4px 8px 0 0',
};

export default BulletCheckmark;
