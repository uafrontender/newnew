/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable no-nested-ternary */
import { motion } from 'framer-motion';
import React, { useCallback, useRef, useState } from 'react';
import { newnewapi } from 'newnew-api';
import { useTranslation } from 'next-i18next';
import styled, { css, useTheme } from 'styled-components';
import Link from 'next/link';

import { useAppSelector } from '../../../../../redux-store/store';
import { TPostStatusStringified } from '../../../../../utils/switchPostStatus';
import { TAcOptionWithHighestField } from '../../../../organisms/decision/regular/PostViewAC';

import Text from '../../../../atoms/Text';
import Button from '../../../../atoms/Button';
import InlineSvg from '../../../../atoms/InlineSVG';
import AcConfirmDeleteOptionModal from './AcConfirmDeleteOptionModal';
import AcPickWinningOptionModal from './AcPickWinningOptionModal';
import BlockUserModalPost from '../../common/BlockUserModalPost';
import ReportModal, { ReportData } from '../../../chat/ReportModal';
import AcOptionCardModerationEllipseMenu from './AcOptionCardModerationEllipseMenu';
import AcOptionCardModerationEllipseModal from './AcOptionCardModerationEllipseModal';

import { formatNumber } from '../../../../../utils/format';
import { deleteAcOption } from '../../../../../api/endpoints/auction';
import { reportEventOption } from '../../../../../api/endpoints/report';
import getDisplayname from '../../../../../utils/getDisplayname';

// Icons
import BidIconLight from '../../../../../public/images/decision/bid-icon-light.png';
import BidIconDark from '../../../../../public/images/decision/bid-icon-dark.png';
import MoreIconFilled from '../../../../../public/images/svg/icons/filled/More.svg';
import ChevronDown from '../../../../../public/images/svg/icons/outlined/ChevronDown.svg';
import VerificationCheckmark from '../../../../../public/images/svg/icons/filled/Verification.svg';
import VerificationCheckmarkInverted from '../../../../../public/images/svg/icons/filled/VerificationInverted.svg';
import useErrorToasts from '../../../../../utils/hooks/useErrorToasts';

interface IAcOptionCardModeration {
  index: number;
  option: TAcOptionWithHighestField;
  postStatus: TPostStatusStringified;
  isWinner?: boolean;
  handleConfirmWinningOption: () => void;
  handleRemoveOption: (optionToDelete: newnewapi.Auction.Option) => void;
  handleSetScrollBlocked?: () => void;
  handleUnsetScrollBlocked?: () => void;
}

const AcOptionCardModeration: React.FunctionComponent<
  IAcOptionCardModeration
> = ({
  index,
  option,
  postStatus,
  isWinner,
  handleConfirmWinningOption,
  handleRemoveOption,
  handleSetScrollBlocked,
  handleUnsetScrollBlocked,
}) => {
  const theme = useTheme();
  const { t } = useTranslation('page-Post');
  const { showErrorToastPredefined } = useErrorToasts();
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );

  const [isEllipseMenuOpen, setIsEllipseMenuOpen] = useState(false);

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPickOptionModalOpen, setIsPickOptionModalOpen] = useState(false);

  const handleConfirmDelete = async () => {
    try {
      const payload = new newnewapi.DeleteAcOptionRequest({
        optionId: option.id,
      });

      const res = await deleteAcOption(payload);

      if (!res.error) {
        handleRemoveOption(option);
      }
    } catch (err) {
      console.error(err);
      showErrorToastPredefined(undefined);
    }
  };

  const handleReportSubmit = useCallback(
    async ({ reasons, message }: ReportData) => {
      await reportEventOption(option.id, reasons, message);
    },
    [option.id]
  );

  const handleReportClose = useCallback(() => {
    setIsReportModalOpen(false);
  }, []);

  const ellipseButtonRef: any = useRef();

  return (
    <>
      <motion.div
        key={index}
        style={{
          display: 'flex',
          flexDirection: 'column',
          marginBottom: '16px',
        }}
      >
        <SContainer $isBlue={!!isWinner}>
          <SBidDetails isBlue={!!isWinner}>
            <SBidAmount isWhite={!!isWinner}>
              <OptionActionIcon
                src={
                  theme.name === 'light' ? BidIconLight.src : BidIconDark.src
                }
              />
              <div>
                {option.totalAmount?.usdCents
                  ? `$${formatNumber(
                      option?.totalAmount?.usdCents / 100 ?? 0,
                      false
                    )}`
                  : '$0'}
              </div>
            </SBidAmount>
            <SOptionInfo isWhite={!!isWinner} variant={3}>
              {option.title}
            </SOptionInfo>
            <SBiddersInfo variant={3}>
              {!option.whitelistSupporter ? (
                option.creator?.username ? (
                  <Link href={`/${option.creator?.username}`}>
                    <SSpanBiddersHighlighted
                      className='spanHighlighted'
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        cursor: 'pointer',
                      }}
                    >
                      {getDisplayname(option.creator!!)}
                      {option.creator.options?.isVerified && (
                        <SInlineSvgVerificationIcon
                          svg={
                            !isWinner
                              ? VerificationCheckmark
                              : VerificationCheckmarkInverted
                          }
                          width='14px'
                          height='14px'
                          fill='none'
                        />
                      )}
                    </SSpanBiddersHighlighted>
                  </Link>
                ) : (
                  <SSpanBiddersHighlighted
                    className='spanHighlighted'
                    onClick={(e) => e.stopPropagation()}
                  >
                    {getDisplayname(option.creator!!)}
                    {option.creator?.options?.isVerified && (
                      <SInlineSvgVerificationIcon
                        svg={
                          !isWinner
                            ? VerificationCheckmark
                            : VerificationCheckmarkInverted
                        }
                        width='14px'
                        height='14px'
                        fill='none'
                      />
                    )}
                  </SSpanBiddersHighlighted>
                )
              ) : (
                <Link href={`/${option.whitelistSupporter?.username}`}>
                  <SSpanBiddersHighlighted
                    className='spanHighlighted'
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      cursor: 'pointer',
                    }}
                  >
                    {getDisplayname(option.whitelistSupporter!!)}
                    {option.whitelistSupporter.options?.isVerified && (
                      <SInlineSvgVerificationIcon
                        svg={
                          !isWinner
                            ? VerificationCheckmark
                            : VerificationCheckmarkInverted
                        }
                        width='14px'
                        height='14px'
                        fill='none'
                      />
                    )}
                  </SSpanBiddersHighlighted>
                </Link>
              )}
              {option.supporterCount > 1 ? (
                <>
                  <SSpanBiddersRegular className='spanRegular'>
                    {` & `}
                  </SSpanBiddersRegular>
                  <SSpanBiddersHighlighted className='spanHighlighted'>
                    {formatNumber(option.supporterCount - 1, true)}{' '}
                    {t('acPost.optionsTab.optionCard.others')}
                  </SSpanBiddersHighlighted>
                </>
              ) : null}{' '}
              <SSpanBiddersRegular className='spanRegular'>
                {t('acPost.optionsTab.optionCard.bid')}
              </SSpanBiddersRegular>
            </SBiddersInfo>
          </SBidDetails>
          {postStatus === 'waiting_for_decision' || isWinner ? (
            !isMobile ? (
              <SSelectOptionWidget>
                <SPickOptionButton
                  winner={!!isWinner}
                  onClick={() => {
                    if (isWinner) return;
                    setIsPickOptionModalOpen(true);
                  }}
                >
                  {isWinner
                    ? t('acPostModeration.optionsTab.optionCard.pickedButton')
                    : t('acPostModeration.optionsTab.optionCard.pickButton')}
                </SPickOptionButton>
                <SDropdownButton
                  onClick={() => {
                    setIsEllipseMenuOpen(true);
                    handleSetScrollBlocked?.();
                  }}
                  ref={ellipseButtonRef}
                >
                  <InlineSvg
                    svg={ChevronDown}
                    fill={theme.colorsThemed.text.primary}
                    width='20px'
                    height='20px'
                  />
                </SDropdownButton>
              </SSelectOptionWidget>
            ) : (
              <>
                <SPickOptionButtonMobile
                  winner={!!isWinner}
                  onClick={() => {
                    if (isWinner) return;
                    setIsPickOptionModalOpen(true);
                  }}
                >
                  {isWinner
                    ? t('acPostModeration.optionsTab.optionCard.pickedButton')
                    : t('acPostModeration.optionsTab.optionCard.pickButton')}
                </SPickOptionButtonMobile>
                <SEllipseButton onClick={() => setIsEllipseMenuOpen(true)}>
                  <InlineSvg
                    svg={MoreIconFilled}
                    fill={theme.colorsThemed.text.secondary}
                    width='20px'
                    height='20px'
                  />
                </SEllipseButton>
              </>
            )
          ) : !isMobile ? (
            <SEllipseButton
              onClick={() => {
                setIsEllipseMenuOpen(true);
                handleSetScrollBlocked?.();
              }}
              ref={ellipseButtonRef}
            >
              <InlineSvg
                svg={MoreIconFilled}
                fill={theme.colorsThemed.text.secondary}
                width='20px'
                height='20px'
              />
            </SEllipseButton>
          ) : (
            <SEllipseButtonMobile onClick={() => setIsEllipseMenuOpen(true)}>
              {t('acPost.optionsTab.optionCard.moreButton')}
            </SEllipseButtonMobile>
          )}
          {!isMobile && (
            <AcOptionCardModerationEllipseMenu
              isVisible={isEllipseMenuOpen}
              optionId={option.id as number}
              canDeleteOptionInitial={!isWinner}
              handleClose={() => {
                setIsEllipseMenuOpen(false);
                handleUnsetScrollBlocked?.();
              }}
              handleOpenReportOptionModal={() => setIsReportModalOpen(true)}
              handleOpenBlockUserModal={() => setIsBlockModalOpen(true)}
              handleOpenRemoveOptionModal={() => setIsDeleteModalOpen(true)}
              anchorElement={ellipseButtonRef.current as HTMLElement}
            />
          )}
        </SContainer>
      </motion.div>
      {/* Modals */}
      {/* Pick winning option */}
      <AcPickWinningOptionModal
        isVisible={isPickOptionModalOpen}
        closeModal={() => setIsPickOptionModalOpen(false)}
        handleConfirm={() => {
          setIsPickOptionModalOpen(false);
          handleConfirmWinningOption();
        }}
      >
        <SBidDetailsModal>
          <SBidAmount>
            <OptionActionIcon
              src={theme.name === 'light' ? BidIconLight.src : BidIconDark.src}
            />
            <div>
              {option.totalAmount?.usdCents
                ? `$${formatNumber(
                    option?.totalAmount?.usdCents / 100 ?? 0,
                    false
                  )}`
                : '$0'}
            </div>
          </SBidAmount>
          <SOptionInfo variant={3}>{option.title}</SOptionInfo>
          <SBiddersInfo variant={3}>
            {option.creator?.username ? (
              <Link href={`/${option.creator?.username}`}>
                <SSpanBiddersHighlighted
                  className='spanHighlighted'
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    cursor: 'pointer',
                  }}
                >
                  {getDisplayname(option.creator)}
                </SSpanBiddersHighlighted>
              </Link>
            ) : (
              <SSpanBiddersHighlighted
                className='spanHighlighted'
                onClick={(e) => e.stopPropagation()}
              >
                {getDisplayname(option.creator)}
              </SSpanBiddersHighlighted>
            )}
            {option.supporterCount > 1 ? (
              <>
                <SSpanBiddersRegular className='spanRegular'>
                  {` & `}
                </SSpanBiddersRegular>
                <SSpanBiddersHighlighted className='spanHighlighted'>
                  {formatNumber(option.supporterCount - 1, true)}{' '}
                  {t('acPost.optionsTab.optionCard.others')}
                </SSpanBiddersHighlighted>
              </>
            ) : null}{' '}
            <SSpanBiddersRegular className='spanRegular'>
              {t('acPost.optionsTab.optionCard.bid')}
            </SSpanBiddersRegular>
          </SBiddersInfo>
        </SBidDetailsModal>
      </AcPickWinningOptionModal>
      {/* Delete option */}
      <AcConfirmDeleteOptionModal
        isVisible={isDeleteModalOpen}
        closeModal={() => setIsDeleteModalOpen(false)}
        handleConfirmDelete={handleConfirmDelete}
      />
      {/* Ellipse modal */}
      {isMobile && (
        <AcOptionCardModerationEllipseModal
          isOpen={isEllipseMenuOpen}
          zIndex={16}
          optionId={option.id as number}
          canDeleteOptionInitial={!isWinner}
          onClose={() => setIsEllipseMenuOpen(false)}
          handleOpenReportOptionModal={() => setIsReportModalOpen(true)}
          handleOpenBlockUserModal={() => setIsBlockModalOpen(true)}
          handleOpenRemoveOptionModal={() => setIsDeleteModalOpen(true)}
        />
      )}
      {option.creator && (
        <>
          {/* Confirm block user modal */}
          <BlockUserModalPost
            confirmBlockUser={isBlockModalOpen}
            user={option.creator}
            closeModal={() => setIsBlockModalOpen(false)}
          />
          {/* Report modal */}
          <ReportModal
            show={isReportModalOpen}
            reportedDisplayname={getDisplayname(option.creator)}
            onSubmit={handleReportSubmit}
            onClose={handleReportClose}
          />
        </>
      )}
    </>
  );
};

AcOptionCardModeration.defaultProps = {};

export default AcOptionCardModeration;

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
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
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

  margin-bottom: 8px;

  ${({ isWhite }) =>
    isWhite
      ? css`
          color: #ffffff;
        `
      : null};

  font-weight: 700;
  font-size: 16px;
  line-height: 24px;
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

  ${({ theme }) => theme.media.tablet} {
    justify-self: flex-end;
  }
`;

const SSpanBiddersHighlighted = styled.span`
  color: ${({ theme }) => theme.colorsThemed.text.secondary};
`;

const SSpanBiddersRegular = styled.span`
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};
`;

const SEllipseButton = styled(Button)`
  position: absolute;
  right: 0px;
  top: 12px;

  padding: 0px 12px;

  width: 24px;

  color: ${({ theme }) => theme.colorsThemed.text.secondary};
  background: none;

  &:hover:enabled,
  &:focus:enabled {
    background: none;
    color: ${({ theme }) => theme.colorsThemed.text.primary};
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

// Select Option
const SSelectOptionWidget = styled.div`
  display: flex;
  flex-shrink: 0;

  border-radius: 12px;
  overflow: hidden;

  height: 40px;
`;

const SPickOptionButton = styled.button<{
  winner: boolean;
}>`
  font-weight: bold;
  font-size: 14px;
  line-height: 24px;
  color: ${({ theme }) => theme.colorsThemed.text.primary};

  padding: 0px 16px;

  background-color: ${({ theme }) => theme.colorsThemed.background.tertiary};

  border: transparent;

  cursor: pointer;
  transition: 0.2s linear;

  &:focus,
  &:hover {
    outline: none;
    background-color: ${({ theme }) => theme.colorsThemed.accent.blue};
  }

  ${({ winner }) =>
    winner
      ? css`
          cursor: default;
          color: #ffffff;
          background-color: ${({ theme }) => theme.colorsThemed.accent.blue};
        `
      : null}
`;

const SDropdownButton = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;

  background-color: ${({ theme }) =>
    theme.name === 'dark'
      ? theme.colorsThemed.background.primary
      : theme.colorsThemed.background.quaternary};

  border: transparent;

  padding: 0px 8px;

  cursor: pointer;
  transition: 0.2s linear;

  &:focus,
  &:hover {
    outline: none;
    background-color: ${({ theme }) => theme.colorsThemed.accent.blue};
  }
`;

const SPickOptionButtonMobile = styled.button<{
  winner: boolean;
}>`
  font-weight: bold;
  font-size: 14px;
  line-height: 24px;
  color: ${({ theme }) => theme.colorsThemed.text.primary};

  padding: 16px 16px;
  height: 56px;

  background-color: ${({ theme }) => theme.colorsThemed.background.quinary};

  border-radius: 16px;
  border: transparent;

  cursor: pointer;
  transition: 0.2s linear;

  &:focus,
  &:hover {
    outline: none;
    color: #ffffff;
    background-color: ${({ theme }) => theme.colorsThemed.accent.blue};
    filter: brightness(120%);
  }

  ${({ winner }) =>
    winner
      ? css`
          color: #ffffff;
          background-color: ${({ theme }) => theme.colorsThemed.accent.blue};
          filter: brightness(120%);
        `
      : null}
`;

const SEllipseButtonMobile = styled.button`
  font-weight: bold;
  font-size: 14px;
  line-height: 24px;
  color: ${({ theme }) => theme.colorsThemed.text.primary};

  padding: 16px 16px;
  height: 56px;

  background-color: ${({ theme }) => theme.colorsThemed.background.quinary};

  border-radius: 16px;
  border: transparent;

  cursor: pointer;
  transition: 0.2s linear;

  &:focus,
  &:hover {
    outline: none;
  }
`;

// Modal

const SBidDetailsModal = styled.div`
  position: relative;

  display: grid;
  grid-template-areas:
    'amount amount'
    'optionInfo optionInfo'
    'bidders bidders';
  grid-template-columns: 7fr 1fr;

  width: 100%;

  background-color: ${({ theme }) => theme.colorsThemed.background.tertiary};
  border-radius: ${({ theme }) => theme.borderRadius.medium};

  padding: 14px;

  ${({ theme }) => theme.media.tablet} {
    grid-template-areas:
      'amount bidders'
      'optionInfo optionInfo';
    grid-template-columns: 3fr 7fr;
  }
`;

const SInlineSvgVerificationIcon = styled(InlineSvg)`
  display: inline-flex;
  margin-left: 3px;

  position: relative;
  top: 3px;
`;
