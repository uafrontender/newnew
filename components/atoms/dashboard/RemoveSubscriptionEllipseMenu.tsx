import { AnimatePresence, motion } from 'framer-motion';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';
import { newnewapi } from 'newnew-api';

import useOnClickEsc from '../../../utils/hooks/useOnClickEsc';
import useOnClickOutside from '../../../utils/hooks/useOnClickOutside';
import Button from '../Button';
import { setMySubscriptionProduct } from '../../../api/endpoints/subscription';
import { setUserData } from '../../../redux-store/slices/userStateSlice';
import { useAppDispatch, useAppSelector } from '../../../redux-store/store';
import RemoveSubModal from './RemoveSubModal';

interface IRemoveSubscriptionEllipseMenu {
  isVisible: boolean;
  handleClose: () => void;
}

const RemoveSubscriptionEllipseMenu: React.FC<IRemoveSubscriptionEllipseMenu> =
  ({ isVisible, handleClose }) => {
    const { t } = useTranslation('common');
    const dispatch = useAppDispatch();
    const user = useAppSelector((state) => state.user);
    const containerRef = useRef<HTMLDivElement>();
    const [confirmSubEnable, setConfirmSubEnable] = useState<boolean>(false);

    useOnClickEsc(containerRef, handleClose);
    useOnClickOutside(containerRef, handleClose);

    const handlerConfirmEnable = () => {
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
      <AnimatePresence>
        {isVisible && (
          <SContainer
            ref={(el) => {
              containerRef.current = el!!;
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <SButton view='danger' onClick={() => handlerConfirmEnable()}>
              {t('ellipse.removeSubscription')}
            </SButton>
            <RemoveSubModal
              confirmEnableSub={confirmSubEnable}
              closeModal={() => setConfirmSubEnable(false)}
              subDisabled={removeMyProduct}
            />
          </SContainer>
        )}
      </AnimatePresence>
    );
  };

export default RemoveSubscriptionEllipseMenu;

const SContainer = styled(motion.div)`
  position: absolute;
  top: 60px;
  z-index: 10;
  right: 0;
`;

const SButton = styled(Button)`
  position: absolute;
  right: 0;
  top: -25px;
  font-size: 14px;
  line-height: 20px;
  padding: 14px 16px;
  box-shadow: 0px 0px 35px 20px rgba(0, 0, 0, 0.25);
`;
