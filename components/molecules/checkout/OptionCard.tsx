/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';

import Lottie from '../../atoms/Lottie';
import Text from '../../atoms/Text';

import checkBoxAnim from '../../../public/animations/checkbox.json';

interface IOptionCard {
  id?: string;
  selected?: boolean;
  handleClick: () => void;
  label: string;
}

const OptionCard: React.FunctionComponent<IOptionCard> = ({
  id,
  selected,
  handleClick,
  label,
}) => {
  const ref: any = useRef();
  const prevSelected = useRef(selected);
  const isStoppedRef = useRef(true);

  useEffect(() => {
    if (prevSelected.current !== selected) {
      prevSelected.current = selected;
      ref.current.anim.stop();
      isStoppedRef.current = false;

      if (selected) {
        ref.current.anim.setSegment(0, 23);
      } else {
        ref.current.anim.setSegment(1, 1);
      }
      ref.current.anim.play();
    }
  }, [ref, selected, prevSelected]);

  return (
    <SOptionCard
      id={id}
      selected={selected ?? false}
      onClick={handleClick}
      type='button'
    >
      <SAnimation>
        <Lottie
          ref={ref}
          width={20}
          height={20}
          options={{
            loop: false,
            autoplay: false,
            animationData: checkBoxAnim,
          }}
          isStopped={isStoppedRef.current}
        />
      </SAnimation>
      <SLabelContent>
        <Text variant={3} weight={600}>
          {label}
        </Text>
        {/* <SFeesText
          variant={2}
        >
          { t('options.card.fees') }
        </SFeesText> */}
      </SLabelContent>
    </SOptionCard>
  );
};

OptionCard.defaultProps = {
  selected: undefined,
};

export default OptionCard;

const SOptionCard = styled.button<{
  selected: boolean;
}>`
  display: flex;
  align-items: center;

  border-style: solid;
  border-width: 2px;
  border-radius: ${({ theme }) => theme.borderRadius.medium};

  border-color: ${({ theme, selected }) =>
    selected ? theme.colorsThemed.accent.blue : 'transparent'};

  width: 100%;

  background: ${({ selected, theme }) =>
    selected
      ? 'linear-gradient(0deg, rgba(29, 106, 255, 0.2), rgba(29, 106, 255, 0.2))'
      : theme.colorsThemed.background.tertiary};

  padding: 16px;
  margin-top: 12px;

  cursor: pointer;
  transition: 0.2s linear;
`;

const SAnimation = styled.div`
  margin-right: 11px;
`;

const SLabelContent = styled.div`
  width: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;

  padding-left: 3px;
`;

const SFeesText = styled(Text)`
  justify-self: flex-end;
`;
