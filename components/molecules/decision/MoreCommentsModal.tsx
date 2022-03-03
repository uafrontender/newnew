import React, { useRef } from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';
import preventParentClick from '../../../utils/preventParentClick';
import Modal from '../../organisms/Modal';
import GoBackButton from '../GoBackButton';
import useScrollGradients from '../../../utils/hooks/useScrollGradients';
import randomID from '../../../utils/randomIdGenerator';
import GradientMask from '../../atoms/GradientMask';
import Comment from '../../atoms/decision/Comment';

interface IMoreCommentsModal {
  confirmMoreComments: boolean;
  comments: any[];
  closeMoreCommentsModal: () => void;
}

const MoreCommentsModal: React.FC<IMoreCommentsModal> = ({ confirmMoreComments, comments, closeMoreCommentsModal }) => {
  const scrollRef: any = useRef();
  const { showTopGradient, showBottomGradient } = useScrollGradients(scrollRef, true);
  const { t } = useTranslation('decision');

  return (
    <Modal show={confirmMoreComments} onClose={closeMoreCommentsModal}>
      <SContainer>
        <SModal onClick={preventParentClick()}>
          <SModalHeader>
            <GoBackButton
              onClick={closeMoreCommentsModal}
            >
              <SModalTitle>{t('comments.comments')}</SModalTitle>
            </GoBackButton>
          </SModalHeader>
          <SWrapper ref={scrollRef}>
            <SActionSection>
              <SCommentsWrapper>
                {comments.map((item, index) => (
                  <Comment key={randomID()} lastChild={index === comments.length - 1} comment={item} />
                ))}
              </SCommentsWrapper>
            </SActionSection>
            <GradientMask positionTop active={showTopGradient} />
            <GradientMask active={showBottomGradient} />
          </SWrapper>
        </SModal>
      </SContainer>
    </Modal>
  );
};

export default MoreCommentsModal;

const SContainer = styled.div`
  display: flex;
  height: 100%;
  justify-content: center;
  align-items: center;
`;

const SModal = styled.div`
  width: 100%;
  background: ${(props) =>
    props.theme.name === 'light' ? props.theme.colors.white : props.theme.colorsThemed.background.primary};
  color: ${(props) =>
    props.theme.name === 'light' ? props.theme.colorsThemed.text.primary : props.theme.colors.white};
  padding: 0 16px 16px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  line-height: 24px;
  height: 100%;
  overflow: auto;

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
  color: ${({ theme }) => theme.colorsThemed.text.primary};
  ${(props) => props.theme.media.tablet} {
    font-size: 20px;
    margin-bottom: 16px;
  }
`;

const SWrapper = styled.div``;

const SActionSection = styled.div`
  padding-right: 0;
  height: 100%;
  overflow: hidden;
  &:hover {
    overflow-y: auto;
  }
  ${(props) => props.theme.media.desktop} {
    padding-right: 24px;
  }
`;

const SCommentsWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;
