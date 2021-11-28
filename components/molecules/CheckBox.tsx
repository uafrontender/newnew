import React from 'react';
import Lottie from 'react-lottie';
import styled from 'styled-components';

import Text from '../atoms/Text';

import checkBoxAnim from '../../public/animations/mobile_logo_animation.json';

interface ICheckBox {
  label: string;
  selected?: boolean;
  handleChange: (e: any) => void;
}

export const CheckBox: React.FC<ICheckBox> = (props) => {
  const {
    label,
    selected,
    handleChange,
  } = props;

  return (
    <SWrapper onClick={handleChange}>
      <SAnimation>
        <Lottie
          width={24}
          height={24}
          direction={selected ? 1 : -1}
          options={{
            loop: false,
            autoplay: true,
            animationData: checkBoxAnim,
          }}
        />
      </SAnimation>
      <SLabel variant={3} weight={600}>
        {label}
      </SLabel>
    </SWrapper>
  );
};

export default CheckBox;

CheckBox.defaultProps = {
  selected: false,
};

const SWrapper = styled.div`
  display: flex;
  align-items: center;
  flex-direction: row;
  justify-content: flex-start;
`;

const SAnimation = styled.div`
  margin-right: 8px;
`;

const SLabel = styled(Text)``;
