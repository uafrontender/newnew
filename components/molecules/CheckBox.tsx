import React, { useCallback, useEffect, useRef } from 'react';
import styled from 'styled-components';

import Text from '../atoms/Text';
import Lottie from '../atoms/Lottie';

import checkBoxAnim from '../../public/animations/checkbox.json';

interface ICheckBox {
  id?: string;
  label: string;
  selected?: boolean;
  handleChange: (e: React.MouseEvent, id?: string) => void;
}

const CheckBox: React.FC<ICheckBox> = (props) => {
  const { id, label, selected, handleChange, ...rest } = props;
  const ref: any = useRef();

  const onClick = useCallback(
    (e: React.MouseEvent) => {
      handleChange(e, id);
    },
    [id, handleChange]
  );

  useEffect(() => {
    ref.current.anim.stop();

    if (selected) {
      ref.current.anim.setSegment(0, 23);
    } else {
      ref.current.anim.setSegment(1, 1);
    }
    ref.current.anim.play();
  }, [ref, selected]);

  return (
    <SWrapper onClick={onClick} {...rest}>
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
  id: '',
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
