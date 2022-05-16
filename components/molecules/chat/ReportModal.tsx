import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';
import { newnewapi } from 'newnew-api';
import dynamic from 'next/dynamic';
import preventParentClick from '../../../utils/preventParentClick';
import Modal from '../../organisms/Modal';
import Button from '../../atoms/Button';
import { useAppSelector } from '../../../redux-store/store';
import CheckMark from '../CheckMark';

const GoBackButton = dynamic(() => import('../GoBackButton'));

export interface ReportData {
  reasons: newnewapi.ReportingReason[];
  message: string;
}

interface IReportModal {
  show: boolean;
  reportedDisplayname: string;
  onSubmit: (reportData: ReportData) => void;
  onClose: () => void;
}

const ReportModal: React.FC<IReportModal> = React.memo(
  ({ show, reportedDisplayname, onClose, onSubmit }) => {
    const { t } = useTranslation('common');
    const { resizeMode } = useAppSelector((state) => state.ui);
    const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
      resizeMode
    );

    const [reasons, setReasons] = useState<newnewapi.ReportingReason[]>([]);
    const [message, setMessage] = useState('');

    const disabled = reasons.length === 0 || message.length < 15;

    const reportTypes = useMemo(
      () => [
        {
          id: newnewapi.ReportingReason.SPAM,
          title: t('modal.report-user.options.spam'),
        },
        {
          id: newnewapi.ReportingReason.HARMFUL,
          title: t('modal.report-user.options.abuse'),
        },
        {
          id: newnewapi.ReportingReason.SUICIDE,
          title: t('modal.report-user.options.suicide'),
        },
        {
          id: newnewapi.ReportingReason.HATE,
          title: t('modal.report-user.options.hate-speech'),
        },
        {
          id: newnewapi.ReportingReason.HARASSMENT,
          title: t('modal.report-user.options.harassment'),
        },
        {
          id: newnewapi.ReportingReason.COPYRIGHT,
          title: t('modal.report-user.options.copyright'),
        },
        {
          id: newnewapi.ReportingReason.OTHER,
          title: t('modal.report-user.options.other'),
        },
      ],
      [t]
    );

    const reportMaxLength = 150;

    const submitReport = () => {
      if (reasons.length > 0 && message.length >= 15) {
        onSubmit({
          reasons,
          message,
        });
        setReasons([]);
        setMessage('');
      }
    };

    const handleMessageChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(e.target.value);
      },
      []
    );

    const handleTypeChange = useCallback(
      (id: newnewapi.ReportingReason | undefined) => {
        if (id) {
          setReasons((current) => {
            const alreadySelectedIndex = current.indexOf(id);

            if (alreadySelectedIndex > -1) {
              const newReasons = current.slice();
              newReasons.splice(alreadySelectedIndex, 1);
              return newReasons;
            }

            return [...current, id];
          });
        }
      },
      []
    );

    return (
      <Modal show={show} onClose={onClose}>
        <SContainer>
          <SModal onClick={preventParentClick()}>
            <SModalHeader>
              {isMobile && <GoBackButton onClick={onClose} />}
              <SModalTitle>
                {t('modal.report-user.title')} {reportedDisplayname}
              </SModalTitle>
            </SModalHeader>
            <SModalMessage>{t('modal.report-user.subtitle')}</SModalMessage>
            <SCheckBoxList>
              {reportTypes.map((item) => (
                <SCheckBoxWrapper key={item.id}>
                  <CheckMark
                    id={item.id.toString()}
                    label={item.title}
                    selected={reasons.includes(item.id)}
                    handleChange={() => handleTypeChange(item.id)}
                  />
                </SCheckBoxWrapper>
              ))}
            </SCheckBoxList>
            <STextAreaWrapper>
              <STextAreaTitle>
                <span>
                  {message ? message.length : 0}/{reportMaxLength}
                </span>
              </STextAreaTitle>
              <STextArea
                id='report-additional-info'
                maxLength={reportMaxLength}
                value={message}
                onChange={handleMessageChange}
                placeholder={`${t(
                  'modal.report-user.additional-info.placeholder'
                )}`}
              />
            </STextAreaWrapper>
            <SModalButtons>
              {!isMobile && (
                <SCancelButton onClick={onClose}>
                  {t('modal.report-user.button-cancel')}
                </SCancelButton>
              )}
              <SConfirmButton
                view='primaryGrad'
                disabled={disabled}
                onClick={submitReport}
              >
                Report
              </SConfirmButton>
            </SModalButtons>
          </SModal>
        </SContainer>
      </Modal>
    );
  }
);

export default ReportModal;

const SContainer = styled.div`
  display: flex;
  height: 100%;
  justify-content: center;
  align-items: center;
`;

const SModal = styled.div`
  width: 100%;
  background: ${(props) =>
    props.theme.name === 'light'
      ? props.theme.colors.white
      : props.theme.colorsThemed.background.secondary};
  color: ${(props) =>
    props.theme.name === 'light'
      ? props.theme.colorsThemed.text.primary
      : props.theme.colors.white};
  padding: 0 16px 16px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  line-height: 24px;
  height: 100%;
  overflow: auto;
  z-index: 1;

  ${(props) => props.theme.media.tablet} {
    height: auto;
    padding: 24px;
    max-width: 480px;
    border-radius: ${(props) => props.theme.borderRadius.medium};
  }
`;

const SModalHeader = styled.div`
  display: flex;
  height: 58px;
  align-items: center;
  margin-bottom: 16px;
  flex-shrink: 0;
  ${(props) => props.theme.media.tablet} {
    display: block;
    height: auto;
    margin: 0 0 24px;
  }
`;

const SModalTitle = styled.strong`
  font-size: 14px;
  margin: 0;
  font-weight: 600;
  ${(props) => props.theme.media.tablet} {
    font-size: 20px;
    margin-bottom: 16px;
  }
`;

const SModalMessage = styled.p`
  font-size: 14px;
  margin-bottom: 24px;
  ${(props) => props.theme.media.tablet} {
    font-size: 16px;
  }
`;

const SModalButtons = styled.div`
  margin-top: auto;
  ${(props) => props.theme.media.tablet} {
    margin: 0;
    display: flex;
  }
`;

const SCancelButton = styled(Button)`
  padding: 12px 24px;
  line-height: 24px;
  font-size: 14px;
  margin-right: auto;
  flex-shrink: 0;
  color: ${(props) =>
    props.theme.name === 'light'
      ? props.theme.colorsThemed.text.primary
      : props.theme.colors.white};
  background: ${(props) => props.theme.colorsThemed.background.quaternary};
  &:hover {
    background: ${(props) =>
      props.theme.name === 'light'
        ? props.theme.colors.dark
        : props.theme.colorsThemed.background.quaternary};
    color: ${(props) => props.theme.colors.white};
    background: ${(props) => props.theme.colorsThemed.background.quaternary};
  }
`;

const SConfirmButton = styled(Button)`
  padding: 16px 10px;
  line-height: 24px;
  font-size: 14px;
  width: 100%;

  &:disabled {
    cursor: default;
    opacity: 1;
    outline: none;

    :after {
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      content: '';
      opacity: 1;
      z-index: 6;
      position: absolute;
      background: ${(props) => props.theme.colorsThemed.button.disabled};
    }
  }
  ${(props) => props.theme.media.tablet} {
    width: auto;
    margin-left: auto;
    flex-shrink: 0;
    padding: 12px 24px;
  }
`;

const SCheckBoxList = styled.div`
  display: flex;
  flex-direction: column;
`;

const SCheckBoxWrapper = styled.div`
  margin-bottom: 22px;
`;

const STextAreaWrapper = styled.div`
  margin-bottom: 22px;
`;

const STextAreaTitle = styled.div`
  margin-bottom: 10px;
  display: flex;
  justify-content: end;
  color: ${(props) => props.theme.colorsThemed.text.tertiary};
  font-size: 12px;
  font-weight: 600;
  line-height: 16px;
`;

const STextArea = styled.textarea`
  padding: 10.5px 18.5px 6.5px 18.5px;
  position: relative;
  background: ${(props) => props.theme.colorsThemed.background.tertiary};
  border-radius: 16px;

  border-width: 1.5px;
  border-style: solid;
  border-color: transparent;
  color: ${(props) => props.theme.colorsThemed.text.primary};

  width: 100%;
  border: none;
  resize: none;
  outline: none;
  font-weight: 500;
  height: 120px;

  font-size: 14px;
  line-height: 20px;

  ${({ theme }) => theme.media.tablet} {
    font-size: 16px;
    line-height: 24px;
  }

  ::placeholder {
    color: ${(props) => props.theme.colorsThemed.text.quaternary};
  }
`;
