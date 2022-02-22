/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useContext, useEffect, useRef } from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';

import { WalletContext } from '../../../contexts/walletContext';

import Text from '../../atoms/Text';
import Lottie from '../../atoms/Lottie';
import InlineSvg from '../../atoms/InlineSVG';

import checkBoxAnim from '../../../public/animations/checkbox.json';
import NewnewLogoBlue from '../../../public/images/svg/auth/newnew-logo-blue.svg';

import { formatNumber } from '../../../utils/format';

interface IOptionWallet {
  selected?: boolean;
  handleClick: () => void;
}

const OptionWallet: React.FunctionComponent<IOptionWallet> = ({
  selected,
  handleClick,
}) => {
  const { t } = useTranslation('payment-modal');
  const ref: any = useRef();

  const { walletBalance } = useContext(WalletContext);

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
    <SOptionWallet
      selected={selected ?? false}
      onClick={handleClick}
    >
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
      <SLabelContent>
        <InlineSvg
          svg={NewnewLogoBlue}
          width="48px"
        />
        <div
          style={{
            marginLeft: '17px',
            justifySelf: 'flex-start',
            textAlign: 'left'
          }}
        >
          <SSubtitle
            variant={3}
          >
            { t('options.wallet.subtitle') }
          </SSubtitle>
          <Text
            variant={2}
          >
            { t('options.wallet.name') }
            {walletBalance && (
              ` ($${formatNumber((walletBalance.usdCents!! / 100) ?? 0, true)})`
            )}
          </Text>
        </div>
        {/* <SFeesText
          variant={2}
        >
          { t('options.wallet.fees') }
        </SFeesText> */}
      </SLabelContent>
    </SOptionWallet>
  );
}

OptionWallet.defaultProps = {
  selected: undefined,
};

export default OptionWallet;

const SOptionWallet = styled.button<{
  selected: boolean;
}>`
  display: flex;
  align-items: center;

  border-style: solid;
  border-width: 2px;
  border-radius: ${({ theme }) => theme.borderRadius.medium};

  border-color: ${({ theme, selected }) => (selected ? theme.colorsThemed.accent.blue : 'transparent')};

  width: 100%;

  background: ${({ selected, theme }) => (selected ?
    'linear-gradient(0deg, rgba(29, 106, 255, 0.2), rgba(29, 106, 255, 0.2))' : theme.colorsThemed.background.tertiary)};;

  padding: 22px 16px;
  margin-top: 12px;
  margin-bottom: 12px;

  cursor: pointer;
  transition: .2s linear;
`;

const SAnimation = styled.div`
  margin-right: 11px;
`;

const SLabelContent = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 48px 2fr 1fr;
  align-items: flex-end;
  justify-content: left;
`;

const SSubtitle = styled(Text)`
  color: ${({ theme }) => theme.colorsThemed.text.primary};
  opacity: 0.6;
`;

const SFeesText = styled(Text)`
  justify-self: flex-end;
`
