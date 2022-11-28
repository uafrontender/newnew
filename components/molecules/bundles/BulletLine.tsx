import React from 'react';
import styled from 'styled-components';
import InlineSvg from '../../atoms/InlineSVG';
import RadioIcon from '../../../public/images/svg/icons/filled/Radio.svg';

interface IBulletLine {
  className?: string;
  children: string;
}

const BulletLine: React.FC<IBulletLine> = ({ className, children }) => (
  <SDescriptionLine className={className}>
    <SBullet>
      <InlineSvg svg={RadioIcon} width='6px' height='6px' fill='#000' />
    </SBullet>
    <SDescriptionText>{children}</SDescriptionText>
  </SDescriptionLine>
);

export default BulletLine;

const SDescriptionLine = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  width: 100%;

  overflow: hidden;
`;

const SBullet = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
  border-radius: 50%;
  width: 12px;
  height: 12px;
  margin-top: 4px;
  margin-right: 8px;
  background: ${({ theme }) => theme.colorsThemed.accent.yellow};
`;

const SDescriptionText = styled.p`
  font-weight: 600;
  color: ${({ theme }) => theme.colorsThemed.text.primary};

  font-size: 14px;
  line-height: 20px;

  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
`;
