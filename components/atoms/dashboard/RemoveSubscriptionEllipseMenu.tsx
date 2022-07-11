import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';
import { newnewapi } from 'newnew-api';

import EllipseMenu from '../EllipseMenu';
import Button from '../Button';
import { setMySubscriptionProduct } from '../../../api/endpoints/subscription';
import { setUserData } from '../../../redux-store/slices/userStateSlice';
import { useAppDispatch, useAppSelector } from '../../../redux-store/store';
import RemoveSubModal from './RemoveSubModal';

interface IRemoveSubscriptionEllipseMenu {
  isVisible: boolean;
  handleClose: () => void;
  anchorElement?: HTMLElement;
}

const RemoveSubscriptionEllipseMenu: React.FC<
  IRemoveSubscriptionEllipseMenu
> = ({ isVisible, handleClose, anchorElement }) => {
  const { t } = useTranslation('common');
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  const [confirmSubEnable, setConfirmSubEnable] = useState<boolean>(false);

  const handlerConfirmEnable = () => {
    handleClose();
    setConfirmSubEnable(true);
  };

  const removeMyProduct = async () => {
    try {
      const payload = new newnewapi.SetMySubscriptionProductRequest({
        productId: null,
      });
      const res = await setMySubscriptionProduct(payload);

      if (res.error) throw new Error(res.error?.message ?? 'Request failed');
      setConfirmSubEnable(false);
      dispatch(
        setUserData({
          options: {
            ...user.userData?.options,
            isOfferingSubscription: false,
          },
        })
      );
    } catch (err) {
      console.error(err);
      setConfirmSubEnable(false);
    }
  };

  return (
    <>
      <EllipseMenu
        isOpen={isVisible}
        onClose={handleClose}
        anchorElement={anchorElement}
        withoutContainer
      >
        <SButton view='danger' onClick={() => handlerConfirmEnable()}>
          {t('ellipse.removeSubscription')}
        </SButton>
      </EllipseMenu>

      <RemoveSubModal
        confirmEnableSub={confirmSubEnable}
        closeModal={() => setConfirmSubEnable(false)}
        subDisabled={removeMyProduct}
      />
    </>
  );
};

export default RemoveSubscriptionEllipseMenu;

const SButton = styled(Button)`
  font-size: 14px;
  line-height: 20px;
  padding: 14px 16px;
  box-shadow: 0px 0px 35px 20px rgba(0, 0, 0, 0.25);
`;
