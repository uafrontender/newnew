import { useTranslation } from 'next-i18next';
import React, { useContext, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { ModalNotificationsContext } from '../../contexts/modalNotificationsProvider';
import Button from '../atoms/Button';
import Modal from '../organisms/Modal';

// TODO: Finalize styling
const ModalNotifications: React.FC = React.memo(() => {
  const { t } = useTranslation('common');
  const { currentNotification, close } = useContext(ModalNotificationsContext);
  const [delayed, setDelayed] = useState(false);
  const delayTimer = useRef<NodeJS.Timer | null>(null);

  const handleClose = () => {
    setDelayed(true);
    close();
    delayTimer.current = setTimeout(() => {
      setDelayed(false);
    }, 500);
  };

  useEffect(
    () => () => {
      if (delayTimer.current) {
        clearTimeout(delayTimer.current);
      }
    },
    []
  );

  return (
    <Modal
      show={!delayed && !!currentNotification}
      overlaydim
      additionalz={1000}
    >
      {currentNotification && (
        <Container>
          <Content>
            <NotificationImage src={currentNotification.image} />
            <Title>{t(currentNotification.titleKey)}</Title>
            <Description>{t(currentNotification.descriptionKey)}</Description>
            <Button onClick={handleClose}>
              {t(currentNotification.buttonTextKey)}
            </Button>
          </Content>
        </Container>
      )}
    </Modal>
  );
});

export default ModalNotifications;

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
`;

const Content = styled.div`
  width: 100%;
  height: 100%;

  ${({ theme }) => theme.media.tablet} {
    width: 500px;
    height: auto;
  }

  ${({ theme }) => theme.media.laptop} {
    width: 100px;
    height: 100px;
  }
`;

const NotificationImage = styled.img`
  width: 200px;
  height: 200px;
  object-fit: cover;
`;

const Title = styled.div`
  color: ${(props) => props.theme.colorsThemed.text.primary};
  font-weight: 700;

  font-size: 32px;
  line-height: 40px;

  ${({ theme }) => theme.media.tablet} {
    font-size: 32px;
    line-height: 40px;
  }

  ${({ theme }) => theme.media.laptop} {
    font-size: 40px;
    line-height: 48px;
  }
`;

const Description = styled.div`
  color: ${(props) => props.theme.colorsThemed.text.secondary};
  font-weight: 600;

  font-size: 16px;
  line-height: 20px;
`;
