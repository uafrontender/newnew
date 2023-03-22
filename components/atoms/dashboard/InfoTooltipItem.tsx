import React, { useRef } from 'react';
import Image from 'next/image';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';
import useOnClickOutside from '../../../utils/hooks/useOnClickOutside';
import coin from '../../../public/images/dashboard/coin.png';

interface IInfoTooltipItem {
  contributions: string;
  money: string;
  closeTooltip: () => void;
}

const InfoTooltipItem: React.FC<IInfoTooltipItem> = ({
  contributions,
  money,
  closeTooltip,
}) => {
  const { t } = useTranslation('page-Creator');
  const ref: any = useRef();

  useOnClickOutside(ref, () => {
    closeTooltip();
  });

  return (
    <SInfoTooltip ref={ref}>
      <SInfoTooltipItem>
        <Image
          src={coin}
          // alt={t('dashboard.expirationPosts.table.header.contributions')}
          alt=''
          width={22}
          height={24}
        />
        <SInfoTooltipText>
          <>
            {/* {t('dashboard.ex÷pirationPosts.table.header.contributions')}:{' '} */}
            {contributions}
          </>
        </SInfoTooltipText>
      </SInfoTooltipItem>
      <SInfoTooltipItem>
        <Image
          src={coin}
          alt={t('dashboard.expirationPosts.table.header.total')}
          width={22}
          height={24}
        />
        <SInfoTooltipText>
          {t('dashboard.expirationPosts.table.header.total')}: {money}
        </SInfoTooltipText>
      </SInfoTooltipItem>
    </SInfoTooltip>
  );
};

export default InfoTooltipItem;

const SInfoTooltip = styled.div`
  background: ${(props) => props.theme.colorsThemed.background.primary};
  color: ${(props) => props.theme.colorsThemed.text.primary};
  font-size: 14px;
  font-weight: 600;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  position: absolute;
  right: 0;
  bottom: 40px;
  width: 230px;
  padding: 16px;
`;

const SInfoTooltipItem = styled.div`
  width: 100%;
  text-align: left;
  margin-top: 10px;
  display: flex;
  align-items: center;
  &:first-child {
    margin-top: 0;
  }
`;
const SInfoTooltipText = styled.span`
  margin-left: 8px;
`;
