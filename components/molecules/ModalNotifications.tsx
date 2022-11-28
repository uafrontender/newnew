import { useTranslation } from 'next-i18next';
import React, { useContext, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import assets from '../../constants/assets';
import { ModalNotificationsContext } from '../../contexts/modalNotificationsContext';
import Button from '../atoms/Button';
import Modal from '../organisms/Modal';

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
      onClose={handleClose}
    >
      {currentNotification && (
        <Container>
          <Content>
            <DataContainer>
              <NotificationImage src={assets.common.goldBig} />
              <Title>
                {t(
                  currentNotification.titleKey as any,
                  currentNotification.titleProps
                )}
              </Title>
              <Description>
                {t(
                  currentNotification.descriptionKey as any,
                  currentNotification.descriptionProps
                )}
              </Description>
            </DataContainer>
            <SButton onClick={handleClose}>
              {t(currentNotification.buttonTextKey as any)}
            </SButton>
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
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
  background: ${(props) => props.theme.colorsThemed.background.primary};
  padding: 16px;

  ${({ theme }) => theme.media.tablet} {
    width: 500px;
    height: auto;
    background: ${(props) => props.theme.colorsThemed.background.tertiary};
    padding: 24px 40px 40px;
    border-radius: 24px;
  }

  ${({ theme }) => theme.media.laptop} {
  }
`;

const DataContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-grow: 1;
  margin-bottom: 24px;
`;

const NotificationImage = styled.img`
  width: 200px;
  height: 200px;
  object-fit: cover;
  margin-bottom: 24px;
`;

const Title = styled.div`
  color: ${(props) => props.theme.colorsThemed.text.primary};
  font-weight: 700;
  margin-bottom: 4px;

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

const SButton = styled(Button)`
  width: 100%;

  ${({ theme }) => theme.media.tablet} {
    width: auto;
    min-width: 92px;
  }
`;
