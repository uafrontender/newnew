import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';
import { newnewapi } from 'newnew-api';

import { useAppSelector } from '../../../redux-store/store';

import Modal from '../../organisms/Modal';
import ModalPaper from '../../organisms/ModalPaper';
import Button from '../../atoms/Button';
import CheckMark from '../CheckMark';
import InlineSvg from '../../atoms/InlineSVG';

import CloseIcon from '../../../public/images/svg/icons/outlined/Close.svg';

export interface ReportData {
  reasons: newnewapi.ReportingReason[];
  message: string;
}

interface IReportModal {
  show: boolean;
  reportedDisplayname: string;
  onSubmit: (reportData: ReportData) => Promise<void>;
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
    const [reportSent, setReportSent] = useState(false);

    const disabled = reasons.length === 0 || message.length < 15;

    const reportTypes = useMemo(
      () => [
        {
          id: newnewapi.ReportingReason.SPAM,
          title: t('modal.reportUser.options.spam'),
        },
        {
          id: newnewapi.ReportingReason.HARMFUL,
          title: t('modal.reportUser.options.abuse'),
        },
        {
          id: newnewapi.ReportingReason.SUICIDE,
          title: t('modal.reportUser.options.suicide'),
        },
        {
          id: newnewapi.ReportingReason.HATE,
          title: t('modal.reportUser.options.hateSpeech'),
        },
        {
          id: newnewapi.ReportingReason.HARASSMENT,
          title: t('modal.reportUser.options.harassment'),
        },
        {
          id: newnewapi.ReportingReason.COPYRIGHT,
          title: t('modal.reportUser.options.copyright'),
        },
        {
          id: newnewapi.ReportingReason.OTHER,
          title: t('modal.reportUser.options.other'),
        },
      ],
      [t]
    );

    const reportMaxLength = 150;

    const submitReport = async () => {
      if (reasons.length > 0 && message.length >= 15) {
        await onSubmit({
          reasons,
          message,
        });
        setReportSent(true);
      }
    };

    const handleClose = () => {
      setReasons([]);
      setMessage('');
      setReportSent(false);
      onClose();
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
      <>
        <Modal show={show} onClose={handleClose}>
          <ModalPaper
            title={`${t('modal.reportUser.title')} ${reportedDisplayname}`}
            onClose={handleClose}
            isMobileFullScreen
          >
            <SModalMessage>{t('modal.reportUser.subtitle')}</SModalMessage>
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
                  'modal.reportUser.additionalInfo.placeholder'
                )}`}
              />
            </STextAreaWrapper>
            <SModalButtons>
              {!isMobile && (
                <SCancelButton onClick={handleClose}>
                  {t('modal.reportUser.button.cancel')}
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
          </ModalPaper>
        </Modal>
        <Modal show={reportSent} onClose={handleClose}>
          <ConformationContainer onClose={handleClose} isCloseButton>
            <CloseButton onClick={handleClose}>
              <InlineSvg svg={CloseIcon} />
            </CloseButton>
            <SConformationTitle>
              {t('modal.reportSent.title')}
            </SConformationTitle>
            <SConformationText>
              {t('modal.reportSent.subtitle')}
            </SConformationText>
            <SAcknowledgementButton view='primaryGrad' onClick={handleClose}>
              {t('modal.reportSent.button')}
            </SAcknowledgementButton>
          </ConformationContainer>
        </Modal>
      </>
    );
  }
);

export default ReportModal;

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

const ConformationContainer = styled(ModalPaper)`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 72px 40px 40px 40px;
  margin: auto 16px;
  height: auto;
  max-width: 350px;

  ${(props) => props.theme.media.tablet} {
    font-size: 16px;
    max-width: 480px;
  }
`;

const CloseButton = styled.div`
  position: absolute;
  top: 24px;
  right: 24px;
  color: white;
  cursor: pointer;
`;

const SConformationTitle = styled.strong`
  font-weight: 700;
  font-size: 20px;
  line-height: 28px;
  margin-bottom: 16px;

  ${(props) => props.theme.media.tablet} {
    font-size: 24px;
    line-height: 32px;
  }
`;

const SConformationText = styled.p`
  font-size: 14px;
  line-height: 20px;
  margin-bottom: 24px;
  text-align: center;
  color: ${(props) => props.theme.colorsThemed.text.secondary};

  ${(props) => props.theme.media.tablet} {
    font-size: 16px;
    line-height: 24px;
  }
`;

const SAcknowledgementButton = styled(Button)`
  width: auto;
  flex-shrink: 0;
  padding: 12px 24px;
  line-height: 24px;
  font-size: 14px;

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
`;
