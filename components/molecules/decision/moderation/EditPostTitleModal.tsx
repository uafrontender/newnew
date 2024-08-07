import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'next-i18next';
import styled, { useTheme } from 'styled-components';
import { newnewapi } from 'newnew-api';

import Button from '../../../atoms/Button';
import Modal, { ModalType } from '../../../organisms/Modal';
import Headline from '../../../atoms/Headline';
import { usePostInnerState } from '../../../../contexts/postInnerContext';

import InlineSvg from '../../../atoms/InlineSVG';
import CloseIcon from '../../../../public/images/svg/icons/outlined/Close.svg';
import EditPostTitleTextArea from '../../../atoms/moderation/EditPostTitleTextArea';
import { validateText } from '../../../../api/endpoints/infrastructure';
import {
  CREATION_TITLE_MAX,
  CREATION_TITLE_MIN,
} from '../../../../constants/general';
import { useAppState } from '../../../../contexts/appStateContext';

interface IEditPostTitleModal {
  show: boolean;
  modalType?: ModalType;
  closeModal: () => void;
}

const EditPostTitleModal: React.FC<IEditPostTitleModal> = ({
  show,
  modalType,
  closeModal,
}) => {
  const theme = useTheme();
  const { t: tCommon } = useTranslation();
  const { t } = useTranslation('modal-EditPostTitle');
  const { resizeMode } = useAppState();
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );

  const [isLoading, setIsLoading] = useState(false);

  const { handleUpdatePostTitle, isUpdateTitleLoading, postParsed } =
    usePostInnerState();

  const [titleInEdit, setTitleInEdit] = useState(postParsed?.title || '');
  const [isTitleValid, setIsTitleValid] = useState(true);
  const [titleValidationError, setTitleValidationError] = useState('');
  const [isAPIValidateLoading, setIsAPIValidateLoading] = useState(false);

  const isTitleSame = useMemo(
    () => titleInEdit?.trim() === postParsed?.title?.trim(),
    [postParsed?.title, titleInEdit]
  );

  const isDisabled = useMemo(
    () =>
      !titleInEdit ||
      !isTitleValid ||
      isUpdateTitleLoading ||
      isAPIValidateLoading ||
      isTitleSame,
    [
      isAPIValidateLoading,
      isTitleSame,
      isTitleValid,
      isUpdateTitleLoading,
      titleInEdit,
    ]
  );

  const validateUsernameAbortControllerRef = useRef<
    AbortController | undefined
  >();
  const validateTitleViaAPI = useCallback(
    async (text: string) => {
      let result = false;
      if (validateUsernameAbortControllerRef.current) {
        validateUsernameAbortControllerRef.current?.abort();
      }
      validateUsernameAbortControllerRef.current = new AbortController();
      setIsAPIValidateLoading(true);
      try {
        const payload = new newnewapi.ValidateTextRequest({
          kind: newnewapi.ValidateTextRequest.Kind.POST_TITLE,
          text,
        });

        const res = await validateText(
          payload,
          validateUsernameAbortControllerRef.current?.signal
        );

        if (!res?.data?.status) {
          throw new Error('An error occurred');
        }

        switch (res.data.status) {
          case newnewapi.ValidateTextResponse.Status.TOO_SHORT: {
            setIsTitleValid(false);
            setTitleValidationError(
              tCommon('error.text.min', { value: CREATION_TITLE_MIN })
            );
            break;
          }
          case newnewapi.ValidateTextResponse.Status.TOO_LONG: {
            setIsTitleValid(false);
            setTitleValidationError(
              tCommon('error.text.max', { value: CREATION_TITLE_MAX })
            );
            break;
          }
          case newnewapi.ValidateTextResponse.Status.INAPPROPRIATE: {
            setIsTitleValid(false);
            setTitleValidationError(tCommon('error.text.badWords'));
            break;
          }
          case newnewapi.ValidateTextResponse.Status.ATTEMPT_AT_REDIRECTION: {
            setIsTitleValid(false);
            setTitleValidationError(tCommon('error.text.containsLinks'));
            break;
          }
          case newnewapi.ValidateTextResponse.Status.OK: {
            setIsTitleValid(true);
            setTitleValidationError('');
            result = true;
            break;
          }
          default:
            break;
        }

        setIsAPIValidateLoading(false);
      } catch (err) {
        result = true;
        console.error(err);
      } finally {
        setIsAPIValidateLoading(false);
      }

      return result;
    },
    [tCommon]
  );

  const handleUpdateNewTitleText = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setIsTitleValid(true);
      setTitleValidationError('');

      setTitleInEdit(e.target.value);
    },
    []
  );

  const handleConfirmNewPostTitle = useCallback(async () => {
    if (isAPIValidateLoading || isUpdateTitleLoading) {
      return;
    }

    try {
      setIsLoading(true);
      const validationResult = await validateTitleViaAPI(titleInEdit);
      if (!validationResult) {
        return;
      }
      await handleUpdatePostTitle(titleInEdit);
      closeModal();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [
    closeModal,
    handleUpdatePostTitle,
    isAPIValidateLoading,
    isUpdateTitleLoading,
    titleInEdit,
    validateTitleViaAPI,
  ]);

  return (
    <Modal
      show={show}
      modalType={modalType}
      additionalz={12}
      onClose={closeModal}
      onEnterKeyUp={
        !isMobile && !isDisabled ? handleConfirmNewPostTitle : undefined
      }
    >
      {isMobile ? (
        <SWrapperMobile>
          <SContainer>
            <SCloseButton onClick={() => closeModal()}>
              <InlineSvg
                svg={CloseIcon}
                fill={theme.colorsThemed.text.primary}
                width='24px'
                height='24px'
              />
            </SCloseButton>
            <SHeadline variant={5}>{t('title')}</SHeadline>
            <EditPostTitleTextArea
              id='edit-title-input'
              value={titleInEdit}
              autofocus={show}
              placeholder={t('placeholder')}
              maxChars={CREATION_TITLE_MAX}
              isValid={isTitleValid}
              errorCaption={titleValidationError}
              onChange={handleUpdateNewTitleText}
            />
            <SDoneButton
              id='edit-title-submit'
              size='sm'
              view='primaryGrad'
              disabled={isDisabled}
              onClick={handleConfirmNewPostTitle}
            >
              {t('saveBtn')}
            </SDoneButton>
          </SContainer>
        </SWrapperMobile>
      ) : (
        <SContainer>
          <SCloseButton onClick={() => closeModal()}>
            <InlineSvg
              svg={CloseIcon}
              fill={theme.colorsThemed.text.primary}
              width='24px'
              height='24px'
            />
          </SCloseButton>
          <SHeadline variant={5}>{t('title')}</SHeadline>
          <EditPostTitleTextArea
            id='edit-title-input'
            value={titleInEdit}
            autofocus={show}
            placeholder={t('placeholder')}
            maxChars={CREATION_TITLE_MAX}
            isValid={isTitleValid}
            errorCaption={titleValidationError}
            onChange={handleUpdateNewTitleText}
            disabled={isLoading}
          />
          <SControlsDiv>
            <SCancelButton
              view='modalSecondarySelected'
              disabled={isUpdateTitleLoading}
              onClick={() => closeModal()}
            >
              {t('cancelBtn')}
            </SCancelButton>
            <SDoneButton
              id='edit-title-submit'
              view='primaryGrad'
              size='sm'
              disabled={isDisabled}
              loading={isLoading}
              onClick={handleConfirmNewPostTitle}
            >
              {t('saveBtn')}
            </SDoneButton>
          </SControlsDiv>
        </SContainer>
      )}
    </Modal>
  );
};

export default EditPostTitleModal;

const SCloseButton = styled.div`
  position: absolute;
  top: 24px;
  right: 24px;
  cursor: pointer;
`;

const SHeadline = styled(Headline)`
  text-align: left;
  margin-bottom: 18px;
`;

const SControlsDiv = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const SDoneButton = styled(Button)`
  padding: 12px 24px;
`;

const SCancelButton = styled(Button)`
  padding: 12px 24px;
  line-height: 24px;
  font-size: 14px;
`;

const SWrapperMobile = styled.div`
  position: absolute;
  bottom: 0;

  width: 100%;
  max-height: calc(100% - 116px);

  background-color: ${({ theme }) => theme.colorsThemed.background.secondary};

  border-top-left-radius: ${({ theme }) => theme.borderRadius.medium};
  border-top-right-radius: ${({ theme }) => theme.borderRadius.medium};
`;

const SContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;

  padding: 24px;

  textarea {
    width: 100%;
  }

  ${({ theme }) => theme.media.tablet} {
    position: absolute;
    top: calc(50% - 160px);
    left: calc(50% - 240px);
    width: 480px;
    box-shadow: ${({ theme }) => theme.shadows.lightBlue};

    background-color: ${({ theme }) => theme.colorsThemed.background.primary};
    border-radius: ${({ theme }) => theme.borderRadius.medium};
  }
`;
