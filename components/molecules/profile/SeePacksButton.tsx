import React, { useState, useEffect, useCallback } from 'react';
import { newnewapi } from 'newnew-api';
import styled from 'styled-components';
import { toast } from 'react-toastify';

import { useTranslation } from 'next-i18next';
import BuyPackModal from '../packs/BuyPackModal';
import { getOfferedPacks } from '../../../api/endpoints/pack';

const OFFERED_PACKS: newnewapi.PackOffer[] = [
  new newnewapi.PackOffer({
    packUuid: '1',
    price: new newnewapi.MoneyAmount({ usdCents: 500 }),
    votesAmount: 500,
    accessDurationInSeconds: 60 * 60 * 24 * 30,
  }),
  new newnewapi.PackOffer({
    packUuid: '2',
    price: new newnewapi.MoneyAmount({ usdCents: 2500 }),
    votesAmount: 500,
    accessDurationInSeconds: 60 * 60 * 24 * 30 * 2,
  }),
  new newnewapi.PackOffer({
    packUuid: '3',
    price: new newnewapi.MoneyAmount({ usdCents: 5000 }),
    votesAmount: 500,
    accessDurationInSeconds: 60 * 60 * 24 * 30 * 3,
  }),

  new newnewapi.PackOffer({
    packUuid: '4',
    price: new newnewapi.MoneyAmount({ usdCents: 7500 }),
    votesAmount: 500,
    accessDurationInSeconds: 60 * 60 * 24 * 30 * 4,
  }),
];

interface ISeePacksButton {
  className?: string;
  creator: newnewapi.IUser;
}

const SeePacksButton: React.FC<ISeePacksButton> = ({ className, creator }) => {
  const { t } = useTranslation('page-Profile');
  const [offeredPacks, setOfferedPacks] = useState<newnewapi.IPackOffer[]>([]);
  const [buyPackModalOpen, setBuyPackModalOpen] = useState(false);

  const loadPackOffers = useCallback(async () => {
    const payload = new newnewapi.EmptyRequest({});
    const res = await getOfferedPacks(payload);

    if (!res.data || res.error) {
      toast.error('toastErrors.generic');
      throw new Error(res.error?.message ?? 'Request failed');
    }

    setOfferedPacks(res.data.packOffers);
  }, []);

  useEffect(() => {
    // loadPackOffers();
    setOfferedPacks(OFFERED_PACKS);
  }, [loadPackOffers]);

  return (
    <>
      <SButton
        className={className}
        onClick={() => {
          setBuyPackModalOpen(true);
        }}
      >
        {t('profileLayout.buttons.viewPacks')}
      </SButton>
      <BuyPackModal
        show={buyPackModalOpen}
        creator={creator}
        offeredPacks={offeredPacks}
        onClose={() => {
          setBuyPackModalOpen(false);
        }}
      />
    </>
  );
};

export default SeePacksButton;

const SButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;

  white-space: nowrap;

  font-size: 14px;
  line-height: 24px;
  font-weight: bold;

  padding: 12px 16px;

  color: ${({ theme }) => theme.colors.darkGray};
  background: ${({ theme }) => theme.colorsThemed.accent.yellow};
  border-radius: ${(props) => props.theme.borderRadius.medium};
  border: transparent;

  cursor: pointer;

  /* No select */
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
`;
