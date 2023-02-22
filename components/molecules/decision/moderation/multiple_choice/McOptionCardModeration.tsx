/* eslint-disable no-nested-ternary */
/* eslint-disable quotes */
/* eslint-disable react/jsx-indent */
/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable arrow-body-style */
import React, { useCallback, useMemo, useRef, useState } from 'react';
import styled, { css, useTheme } from 'styled-components';
import { motion } from 'framer-motion';
import { newnewapi } from 'newnew-api';
import { useTranslation } from 'next-i18next';

import { TMcOptionWithHighestField } from '../../../../../utils/hooks/useMcOptions';

import Text from '../../../../atoms/Text';
import Button from '../../../../atoms/Button';

import { formatNumber } from '../../../../../utils/format';

// Icons
import VoteIconLight from '../../../../../public/images/decision/vote-icon-light.png';
import VoteIconDark from '../../../../../public/images/decision/vote-icon-dark.png';
import MoreIconFilled from '../../../../../public/images/svg/icons/filled/More.svg';
import InlineSvg from '../../../../atoms/InlineSVG';
import McOptionCardModerationEllipseMenu from './McOptionCardModerationEllipseMenu';
import McConfirmDeleteOptionModal from './McConfirmDeleteOptionModal';
import { deleteMcOption } from '../../../../../api/endpoints/multiple_choice';
import McOptionCardModerationEllipseModal from './McOptionCardModerationEllipseModal';
import getDisplayname from '../../../../../utils/getDisplayname';
import BlockUserModalPost from '../../common/BlockUserModalPost';
import ReportModal, { ReportData } from '../../../direct-messages/ReportModal';
import { reportSuperpollOption } from '../../../../../api/endpoints/report';
import { RenderSupportersInfo } from '../../regular/multiple_choice/McOptionCard';
import useErrorToasts from '../../../../../utils/hooks/useErrorToasts';
import { useGetBlockedUsers } from '../../../../../contexts/blockedUsersContext';
import { Mixpanel } from '../../../../../utils/mixpanel';
import { useAppState } from '../../../../../contexts/appStateContext';

interface IMcOptionCardModeration {
  option: TMcOptionWithHighestField;
  creator: newnewapi.IUser;
  index: number;
  canBeDeleted: boolean;
  isCreatorsBid: boolean;
  isWinner?: boolean;
  handleRemoveOption?: () => void;
  handleSetScrollBlocked?: () => void;
  handleUnsetScrollBlocked?: () => void;
}

const McOptionCardModeration: React.FunctionComponent<
  IMcOptionCardModeration
> = ({
  option,
  creator,
  index,
  canBeDeleted,
  isCreatorsBid,
  isWinner,
  handleRemoveOption,
  handleSetScrollBlocked,
  handleUnsetScrollBlocked,
}) => {
  const theme = useTheme();
  const { t } = useTranslation('page-Post');
  const { resizeMode } = useAppState();
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );
  const { showErrorToastPredefined } = useErrorToasts();

  const { usersIBlocked, changeUserBlockedStatus } = useGetBlockedUsers();

  const isUserBlocked = useMemo(
    () => usersIBlocked.includes(option.creator?.uuid ?? ''),
    [option.creator?.uuid, usersIBlocked]
  );

  const supporterCountSubstracted = useMemo(() => {
    if (option.supporterCount === 0) {
      return 0;
    }
    return option.supporterCount - 1;
  }, [option.supporterCount]);

  // Ellipse menu
  const [isEllipseMenuOpen, setIsEllipseMenuOpen] = useState(false);

  const handleOpenEllipseMenuBlockScroll = useCallback(() => {
    Mixpanel.track('Open Ellipse Menu Block Scroll', {
      _stage: 'Post',
      _optionId: option?.id,
      _component: 'McOptionCardModeration',
    });
    setIsEllipseMenuOpen(true);
    handleSetScrollBlocked?.();
  }, [handleSetScrollBlocked, option?.id]);

  const handleOpenEllipseMenu = useCallback(() => {
    Mixpanel.track('Open Ellipse Menu', {
      _stage: 'Post',
      _optionId: option?.id,
      _component: 'McOptionCardModeration',
    });
    setIsEllipseMenuOpen(true);
  }, [option?.id]);

  const handleCloseEllipseMenuUnblockScroll = useCallback(() => {
    Mixpanel.track('Close Ellipse Menu Unblock Scroll', {
      _stage: 'Post',
      _optionId: option?.id,
      _component: 'McOptionCardModeration',
    });
    setIsEllipseMenuOpen(false);
    handleUnsetScrollBlocked?.();
  }, [handleUnsetScrollBlocked, option?.id]);

  const handleCloseEllipseMenu = useCallback(() => {
    Mixpanel.track('Close Ellipse Menu', {
      _stage: 'Post',
      _optionId: option?.id,
      _component: 'McOptionCardModeration',
    });
    setIsEllipseMenuOpen(false);
  }, [option?.id]);

  // Block user
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);

  const handleOpenBlockModal = useCallback(() => {
    Mixpanel.track('Open Block Modal', {
      _stage: 'Post',
      _optionId: option?.id,
      _component: 'McOptionCardModeration',
    });
    setIsBlockModalOpen(true);
  }, [option?.id]);

  const handleCloseBlockModal = useCallback(() => {
    Mixpanel.track('Close Block Modal', {
      _stage: 'Post',
      _optionId: option?.id,
      _component: 'McOptionCardModeration',
    });
    setIsBlockModalOpen(false);
  }, [option?.id]);

  // Delete option
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleOpenDeleteModal = useCallback(() => {
    Mixpanel.track('Open delete option modal', {
      _stage: 'Post',
      _optionId: option?.id,
      _component: 'McOptionCardModeration',
    });
    setIsDeleteModalOpen(true);
  }, [option?.id]);

  const handleCloseDeleteModal = useCallback(() => {
    Mixpanel.track('Close delete option modal', {
      _stage: 'Post',
      _optionId: option?.id,
      _component: 'McOptionCardModeration',
    });
    setIsDeleteModalOpen(false);
  }, [option?.id]);

  const handleConfirmDelete = useCallback(async () => {
    Mixpanel.track('Confirm delete option', {
      _stage: 'Post',
      _optionId: option?.id,
      _component: 'McOptionCardModeration',
    });

    try {
      const payload = new newnewapi.DeleteMcOptionRequest({
        optionId: option.id,
      });

      const res = await deleteMcOption(payload);

      if (!res.error) {
        setIsDeleteModalOpen(false);
        handleRemoveOption?.();
      }
    } catch (err) {
      console.error(err);
      showErrorToastPredefined(undefined);
    }
  }, [handleRemoveOption, option.id, showErrorToastPredefined]);

  // Report option
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const handleReportSubmit = useCallback(
    async ({ reasons, message }: ReportData) => {
      Mixpanel.track('Submit report option', {
        _stage: 'Post',
        _optionId: option?.id,
        _component: 'McOptionCardModeration',
      });
      await reportSuperpollOption(option.id, reasons, message);
    },
    [option.id]
  );

  const handleReportOpen = useCallback(() => {
    Mixpanel.track('Open Report Modal', {
      _stage: 'Post',
      _optionId: option?.id,
      _component: 'McOptionCardModeration',
    });
    setIsReportModalOpen(true);
  }, [option?.id]);

  const handleReportClose = useCallback(() => {
    Mixpanel.track('Close Report Modal', {
      _stage: 'Post',
      _optionId: option?.id,
      _component: 'McOptionCardModeration',
    });
    setIsReportModalOpen(false);
  }, [option?.id]);

  const ellipseMenuButton: any = useRef();

  return (
    <>
      <motion.div
        key={index}
        layout='position'
        transition={{
          type: 'spring',
          damping: 20,
          stiffness: 300,
        }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          marginBottom: '16px',
        }}
      >
        <SContainer
          layout='position'
          transition={{
            type: 'spring',
            damping: 20,
            stiffness: 300,
          }}
          $isBlue={!!isWinner}
        >
          <SBidDetails isBlue={!!isWinner}>
            <SBidAmount isWhite={!!isWinner}>
              <OptionActionIcon
                src={
                  theme.name === 'light' ? VoteIconLight.src : VoteIconDark.src
                }
              />
              <div>
                {option.voteCount && option.voteCount > 0
                  ? `${formatNumber(option?.voteCount, true)} ${
                      option.voteCount === 1
                        ? t('mcPost.optionsTab.optionCard.vote')
                        : t('mcPost.optionsTab.optionCard.votes')
                    }`
                  : t('mcPost.optionsTab.optionCard.noVotes')}
              </div>
            </SBidAmount>
            <SOptionInfo isWhite={!!isWinner} variant={3}>
              {option.text}
            </SOptionInfo>
            <SBiddersInfo variant={3}>
              <RenderSupportersInfo
                isBlue={!!isWinner}
                isCreatorsBid
                isSuggestedByMe={false}
                isSupportedByMe={false}
                optionCreator={option.creator || undefined}
                firstVoter={option.firstVoter || undefined}
                whiteListedSupporter={option.whitelistSupporter || undefined}
                supporterCount={option.supporterCount}
                supporterCountSubtracted={supporterCountSubstracted}
              />
            </SBiddersInfo>
          </SBidDetails>
          {!isMobile ? (
            <SEllipseButton
              onClick={handleOpenEllipseMenuBlockScroll}
              ref={ellipseMenuButton}
            >
              <InlineSvg
                svg={MoreIconFilled}
                fill={theme.colorsThemed.text.secondary}
                width='20px'
                height='20px'
              />
            </SEllipseButton>
          ) : (
            <SEllipseButtonMobile
              ref={ellipseMenuButton}
              isWhite={!!isWinner}
              onClick={handleOpenEllipseMenu}
            >
              {t('mcPost.optionsTab.optionCard.moreButton')}
            </SEllipseButtonMobile>
          )}
          {!isMobile && (
            <McOptionCardModerationEllipseMenu
              isVisible={isEllipseMenuOpen}
              isBySubscriber={!isCreatorsBid}
              canDeleteOptionInitial={canBeDeleted && !isWinner}
              optionId={option.id as number}
              isUserBlocked={isUserBlocked}
              handleClose={handleCloseEllipseMenuUnblockScroll}
              handleOpenReportOptionModal={handleReportOpen}
              handleOpenBlockUserModal={handleOpenBlockModal}
              handleOpenRemoveOptionModal={handleOpenDeleteModal}
              handleUnblockUser={() =>
                changeUserBlockedStatus(option.creator?.uuid, false)
              }
              anchorElement={ellipseMenuButton.current}
            />
          )}
        </SContainer>
      </motion.div>
      {/* Modals */}
      {/* Delete option */}
      <McConfirmDeleteOptionModal
        isVisible={isDeleteModalOpen}
        closeModal={handleCloseDeleteModal}
        handleConfirmDelete={handleConfirmDelete}
      />
      {/* Ellipse modal */}
      {isMobile && (
        <McOptionCardModerationEllipseModal
          isOpen={isEllipseMenuOpen}
          zIndex={16}
          onClose={handleCloseEllipseMenu}
          isBySubscriber={!isCreatorsBid}
          isUserBlocked={isUserBlocked}
          canDeleteOptionInitial={canBeDeleted && !isWinner}
          optionId={option.id as number}
          handleOpenReportOptionModal={handleReportOpen}
          handleOpenBlockUserModal={handleOpenBlockModal}
          handleOpenRemoveOptionModal={handleOpenDeleteModal}
          handleUnblockUser={() =>
            changeUserBlockedStatus(option.creator?.uuid, false)
          }
        />
      )}
      {/* Confirm block user modal */}
      {!isCreatorsBid && (
        <BlockUserModalPost
          confirmBlockUser={isBlockModalOpen}
          user={option.creator!!}
          closeModal={handleCloseBlockModal}
        />
      )}
      {/* Report modal */}
      {option.isCreatedBySubscriber && option.creator && (
        <ReportModal
          show={isReportModalOpen}
          reportedDisplayname={getDisplayname(option.creator)}
          onSubmit={handleReportSubmit}
          onClose={handleReportClose}
        />
      )}
    </>
  );
};

McOptionCardModeration.defaultProps = {};

export default McOptionCardModeration;

const SContainer = styled(motion.div)<{
  $isBlue: boolean;
}>`
  position: relative;

  display: flex;
  flex-direction: column;
  gap: 12px;

  width: 100%;

  padding: 16px;

  background-color: ${({ theme, $isBlue }) =>
    $isBlue
      ? theme.colorsThemed.accent.blue
      : theme.colorsThemed.background.tertiary};
  border-radius: ${({ theme }) => theme.borderRadius.medium};

  ${({ theme }) => theme.media.tablet} {
    /* width: 80%; */
    flex-direction: row;
    justify-content: space-between;
    gap: 16px;

    padding: initial;
    background-color: initial;
    border-radius: initial;
  }
`;

const SBidDetails = styled.div<{
  isBlue: boolean;
}>`
  position: relative;

  display: grid;
  grid-template-areas:
    'amount amount'
    'optionInfo optionInfo'
    'bidders bidders';
  grid-template-columns: 7fr 1fr;

  width: 100%;

  ${({ isBlue }) =>
    isBlue
      ? css`
          .spanRegular {
            color: #ffffff;
            opacity: 0.6;
          }
          .spanHighlighted {
            color: #ffffff;
          }
        `
      : null}

  ${({ theme }) => theme.media.tablet} {
    grid-template-areas:
      'amount bidders'
      'optionInfo optionInfo';
    grid-template-columns: 3fr 7fr;

    background-color: ${({ theme, isBlue }) =>
      isBlue
        ? theme.colorsThemed.accent.blue
        : theme.colorsThemed.background.tertiary};
    border-radius: ${({ theme }) => theme.borderRadius.medium};

    padding: 14px;
  }
`;

const SBidAmount = styled.div<{
  isWhite?: boolean;
}>`
  grid-area: amount;

  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;

  ${({ isWhite }) =>
    isWhite
      ? css`
          color: #ffffff;
        `
      : null};
  font-weight: 700;
  font-size: 16px;
  line-height: 24px;

  margin-bottom: 8px;
`;

const OptionActionIcon = styled.img`
  height: 24px;
  width: 24px;
`;

const SOptionInfo = styled(Text)<{
  isWhite?: boolean;
}>`
  grid-area: optionInfo;

  margin-bottom: 8px;

  ${({ isWhite }) =>
    isWhite
      ? css`
          color: #ffffff;
        `
      : null};

  ${({ theme }) => theme.media.tablet} {
    margin-bottom: initial;
  }
`;

const SBiddersInfo = styled(Text)`
  grid-area: bidders;

  font-weight: 700;
  font-size: 12px;
  line-height: 16px;

  ${({ theme }) => theme.media.tablet} {
    justify-self: flex-end;
    padding-top: 4px;

    text-align: right;
  }
`;

const SEllipseButton = styled(Button)`
  position: absolute;
  right: 0px;
  top: 12px;
  align-self: center;

  padding: 0px 12px;

  width: 24px;

  color: ${({ theme }) => theme.colorsThemed.text.secondary};
  background: none;

  &:hover:enabled,
  &:focus:enabled {
    background: none;
    color: ${({ theme }) => theme.colorsThemed.text.primary};
    box-shadow: none;
  }

  span {
    display: flex;
    align-items: center;
    justify-content: center;

    gap: 8px;
  }

  ${({ theme }) => theme.media.tablet} {
    position: initial;

    width: auto;
  }
`;

const SEllipseButtonMobile = styled.button<{
  isWhite?: boolean;
}>`
  font-weight: bold;
  font-size: 14px;
  line-height: 24px;
  color: ${({ theme, isWhite }) =>
    isWhite ? theme.colors.dark : theme.colorsThemed.text.primary};

  padding: 16px 16px;
  height: 56px;

  background-color: ${({ theme, isWhite }) =>
    isWhite ? '#FFFFFF' : theme.colorsThemed.background.quinary};

  border-radius: 16px;
  border: transparent;

  cursor: pointer;
  transition: 0.2s linear;

  &:focus,
  &:hover {
    outline: none;
  }
`;
