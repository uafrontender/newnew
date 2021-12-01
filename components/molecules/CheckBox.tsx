import React, { useEffect, useRef } from 'react';
import Lottie from 'react-lottie';
import styled from 'styled-components';

import Text from '../atoms/Text';

import checkBoxAnim from '../../public/animations/checkbox.json';

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
    ...rest
  } = props;
  const ref: any = useRef();

  useEffect(() => {
    ref.current.anim.stop();

    if (selected) {
      ref.current.anim.setSegment(0, 23);
      ref.current.anim.play();
    } else {
      ref.current.anim.setSegment(1, 1);
    }
  }, [ref, selected]);

  return (
    <SWrapper onClick={handleChange} {...rest}>
      <SAnimation>
        <Lottie
          ref={ref}
          width={24}
          height={24}
          options={{
            loop: false,
            autoplay: false,
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
  cursor: pointer;
  display: flex;
  align-items: center;
  flex-direction: row;
  justify-content: flex-start;
`;

const SAnimation = styled.div`
  margin-right: 11px;
`;

const SLabel = styled(Text)``;
