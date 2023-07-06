import React, {
  Reducer,
  useCallback,
  useMemo,
  useReducer,
  useState,
} from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';
import { newnewapi } from 'newnew-api';

import preventParentClick from '../../../utils/preventParentClick';

import Modal from '../../organisms/Modal';
import ModalPaper from '../../organisms/ModalPaper';
import Button from '../../atoms/Button';
import CheckMark from '../CheckMark';
import { Mixpanel } from '../../../utils/mixpanel';
import { useAppState } from '../../../contexts/appStateContext';
import DisplayName from '../../atoms/DisplayName';
import AnimatedPresence from '../../atoms/AnimatedPresence';
import InlineSvg from '../../atoms/InlineSVG';
import AlertIcon from '../../../public/images/svg/icons/filled/Alert.svg';

export interface ReportData {
  reasons: newnewapi.ReportingReason[];
  message: string;
}

interface IReportModal {
  show: boolean;
  reportedUser: newnewapi.IUser;
  onSubmit: (reportData: ReportData) => Promise<void>;
  onClose: () => void;
}

const MIN_REPORT_MESSAGE_LENGTH = 15;
const MAX_REPORT_MESSAGE_LENGTH = 150;

// Accept user object, use JSX.element in ModalPaperTitle, use DisplayName component to add verification icon
const ReportModal: React.FC<IReportModal> = React.memo(
  ({ show, reportedUser, onClose, onSubmit }) => {
    const { t } = useTranslation('common');
    const { resizeMode } = useAppState();
    const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
      resizeMode
    );

    const [message, setMessage] = useState('');
    const [messageErrorVisible, setMessageErrorVisible] = useState(false);
    const [reportSent, setReportSent] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    type ReportAction =
      | { type: 'clear' }
      | {
          type: 'add' | 'remove';
          value: newnewapi.ReportingReason;
        };

    // This is not a pretties but the most stable state management I can think of
    function reasonsReducer(
      state: Map<newnewapi.ReportingReason, boolean>,
      action: ReportAction
    ) {
      if (action.type === 'clear') {
        return new Map();
      }

      const newState = new Map(state);

      if (action.type === 'add') {
        newState.set(action.value, true);
      }

      if (action.type === 'remove') {
        newState.set(action.value, false);
      }

      return newState;
    }

    const [reasons, dispatch] = useReducer<
      Reducer<Map<newnewapi.ReportingReason, boolean>, ReportAction>
    >(reasonsReducer, new Map());

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

    const submitReport = async () => {
      const reasonsList = Array.from(reasons.entries())
        .filter(([key, value]) => value)
        .map(([key, value]) => key);

      Mixpanel.track('Submit Report Form', {
        _stage: 'Direct Messages',
        _component: 'ReportModal',
        _reasons: reasonsList,
        _message: message,
      });

      if (
        reasonsList.length > 0 &&
        message.length >= MIN_REPORT_MESSAGE_LENGTH
      ) {
        setIsSubmitting(true);
        await onSubmit({
          reasons: reasonsList,
          message,
        });
        setReportSent(true);
        setIsSubmitting(false);
      }
    };

    const handleClose = () => {
      Mixpanel.track('Close Report Modal', {
        _stage: 'Direct Messages',
        _component: 'ReportModal',
      });

      dispatch({ type: 'clear' });
      setMessage('');
      setReportSent(false);
      onClose();
    };

    const handleMessageChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const onlySpacesRegex = /^\s+$/;
        if (onlySpacesRegex.test(e.target.value)) {
          setMessage('');
        } else {
          const newMessage = e.target.value
            .replaceAll('  ', ' ')
            .replaceAll(/\n\n/g, '\n');
          if (newMessage.length <= MAX_REPORT_MESSAGE_LENGTH) {
            setMessage(newMessage);
          }
        }
      },
      []
    );

    const validateMessage = useCallback((newMessage: string) => {
      if (
        newMessage.length > 0 &&
        newMessage.length < MIN_REPORT_MESSAGE_LENGTH
      ) {
        setMessageErrorVisible(true);
      }
    }, []);

    const disabled =
      Array.from(reasons.entries()).filter(([key, value]) => value).length ===
        0 || message.length < MIN_REPORT_MESSAGE_LENGTH;

    return (
      <>
        <Modal show={show} onClose={handleClose} additionalz={1000}>
          <ModalPaper
            title={
              <SModalTitle>
                {t('modal.reportUser.title')}
                <DisplayName user={reportedUser} />
              </SModalTitle>
            }
            onClose={handleClose}
            isMobileFullScreen
            onClick={preventParentClick()}
            data-body-scroll-lock-ignore
          >
            <SModalMessage>{t('modal.reportUser.subtitle')}</SModalMessage>
            <SCheckBoxList>
              {reportTypes.map((item) => (
                <SCheckBoxWrapper
                  key={item.id}
                  onClick={() => {
                    if (reasons.get(item.id)) {
                      dispatch({ type: 'remove', value: item.id });
                    } else {
                      dispatch({ type: 'add', value: item.id });
                    }
                  }}
                >
                  <SCheckMark
                    id={item.id.toString()}
                    label={item.title}
                    selected={reasons.get(item.id)}
                  />
                </SCheckBoxWrapper>
              ))}
            </SCheckBoxList>
            <STextAreaWrapper>
              <STextAreaTitle>
                <span>
                  {message ? message.length : 0}/{MAX_REPORT_MESSAGE_LENGTH}
                </span>
              </STextAreaTitle>
              <STextArea
                id='report-additional-info'
                maxLength={MAX_REPORT_MESSAGE_LENGTH}
                value={message}
                onChange={handleMessageChange}
                onBlur={() => validateMessage(message)}
                onFocus={() => setMessageErrorVisible(false)}
                placeholder={`${t(
                  'modal.reportUser.additionalInfo.placeholder'
                )}`}
              />
              {messageErrorVisible ? (
                <AnimatedPresence animation='t-09'>
                  <SErrorDiv>
                    <InlineSvg svg={AlertIcon} width='16px' height='16px' />
                    {t('modal.reportUser.additionalInfo.tooShort')}
                  </SErrorDiv>
                </AnimatedPresence>
              ) : null}
            </STextAreaWrapper>
            <SModalButtons>
              {!isMobile && (
                <SCancelButton
                  view='modalSecondarySelected'
                  onClick={handleClose}
                >
                  {t('modal.reportUser.button.cancel')}
                </SCancelButton>
              )}
              <SConfirmButton
                view='primaryGrad'
                disabled={disabled}
                onClick={submitReport}
                loading={isSubmitting}
              >
                {t('modal.reportUser.button.report')}
              </SConfirmButton>
            </SModalButtons>
          </ModalPaper>
        </Modal>
        <Modal show={reportSent} onClose={handleClose} additionalz={1001}>
          <SConformationModal
            onClose={handleClose}
            isCloseButton
            onClick={preventParentClick()}
          >
            <SConformationTitle>
              {t('modal.reportSent.title')}
            </SConformationTitle>
            <SConformationText>
              {t('modal.reportSent.subtitle')}
            </SConformationText>
            <SAcknowledgementButton view='primaryGrad' onClick={handleClose}>
              {t('modal.reportSent.button')}
            </SAcknowledgementButton>
          </SConformationModal>
        </Modal>
      </>
    );
  }
);

export default ReportModal;

const SModalTitle = styled.div`
  display: flex;
  flex-direction: row;
  white-space: pre;
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
  margin-top: 10px;
  padding: 5px;
  margin-bottom: 10px;
  overflow: hidden;
  cursor: pointer;
`;

const SCheckMark = styled(CheckMark)`
  pointer-events: none;
`;

const SErrorDiv = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;

  margin-top: 6px;

  text-align: center;
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;

  color: ${({ theme }) => theme.colorsThemed.accent.error};

  & > div {
    margin-right: 4px;
  }
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

const SConformationModal = styled(ModalPaper)`
  position: relative;
  padding: 32px 40px 40px 40px;
  margin: auto 16px;
  height: auto;
  max-width: 350px;
  width: 100%;

  & > div {
    display: flex;
    flex-direction: column;
    align-items: center;

    ${(props) => props.theme.media.tablet} {
      font-size: 16px;
    }
  }

  ${(props) => props.theme.media.tablet} {
    max-width: 480px;
  }
`;

const SConformationTitle = styled.strong`
  margin-bottom: 16px;

  font-weight: 700;
  font-size: 20px;
  line-height: 28px;

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
