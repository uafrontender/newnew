/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable no-nested-ternary */
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { newnewapi } from 'newnew-api';
import { useTranslation } from 'next-i18next';
import styled, { useTheme } from 'styled-components';

import { useAppSelector } from '../../../../../redux-store/store';
import { TPostStatusStringified } from '../../../../../utils/switchPostStatus';
import { TAcOptionWithHighestField } from '../../../../organisms/decision/PostViewAC';

import Text from '../../../../atoms/Text';
import Button from '../../../../atoms/Button';
import InlineSvg from '../../../../atoms/InlineSVG';
import AcConfirmDeleteOption from './AcConfirmDeleteOption';
import AcPickWinningOptionModal from './AcPickWinningOptionModal';
import AcOptionCardModerationEllipseMenu from './AcOptionCardModerationEllipseMenu';

import { formatNumber } from '../../../../../utils/format';
import { deleteAcOption } from '../../../../../api/endpoints/auction';

// Icons
import CoinIcon from '../../../../../public/images/decision/coin-mock.png';
import MoreIconFilled from '../../../../../public/images/svg/icons/filled/More.svg';
import ChevronDown from '../../../../../public/images/svg/icons/outlined/ChevronDown.svg';
import AcOptionCardModerationEllipseModal from './AcOptionCardModerationEllipseModal';

interface IAcOptionCardModeration {
  index: number;
  option: TAcOptionWithHighestField;
  postStatus: TPostStatusStringified;
  handleConfirmWinningOption: () => void;
}

const AcOptionCardModeration: React.FunctionComponent<IAcOptionCardModeration> = ({
  index,
  option,
  postStatus,
  handleConfirmWinningOption,
}) => {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation('decision');
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);

  const [isEllipseMenuOpen, setIsEllipseMenuOpen] = useState(false);


  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPickOptionModalOpen, setIsPickOptionModalOpen] = useState(false);

  // Redirect to user's page
  const handleRedirectToOptionCreator = () => router.push(`/u/${option.creator?.username}`);

  const handleConfirmDelete = async () => {
    try {
      const payload = new newnewapi.DeleteAcOptionRequest({
        optionId: option.id,
      });

      const res = await deleteAcOption(payload);

      if (!res.error) {
        console.log('deleted');
      }
    } catch (err) {
      console.error(err);
    }
  };

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
        <SContainer>
        <SBidDetails>
            <SBidAmount>
              <SCoinImg
                src={CoinIcon.src}
              />
              <div>
                {option.totalAmount?.usdCents ? `$${formatNumber(option?.totalAmount?.usdCents / 100 ?? 0, true)}` : '$0'}
              </div>
            </SBidAmount>
            <SOptionInfo
              variant={3}
            >
              {option.title}
            </SOptionInfo>
            <SBiddersInfo
              variant={3}
            >
              <SSpanBiddersHighlighted
                className="spanHighlighted"
                onClick={() => handleRedirectToOptionCreator()}
                style={{
                  ...(option.isCreatedBySubscriber ? {
                    color: theme.colorsThemed.accent.yellow,
                    cursor: 'pointer',
                  } : {}),
                }}
              >
                {option.creator?.nickname ?? option.creator?.username}
              </SSpanBiddersHighlighted>
              {option.supporterCount > 1 ? (
                <>
                  <SSpanBiddersRegular
                    className="spanRegular"
                  >
                    {` & `}
                  </SSpanBiddersRegular>
                  <SSpanBiddersHighlighted
                    className="spanHighlighted"
                  >
                    {formatNumber(
                      option.supporterCount - 1,
                      true,
                    )}
                    { ' ' }
                    {t('AcPost.OptionsTab.OptionCard.others')}
                  </SSpanBiddersHighlighted>
                </>
              ) : null}
              {' '}
              <SSpanBiddersRegular
                className="spanRegular"
              >
                {t('AcPost.OptionsTab.OptionCard.bid')}
              </SSpanBiddersRegular>
            </SBiddersInfo>
          </SBidDetails>
          {postStatus === 'wating_for_decision' ? (
            !isMobile ? (
              <SSelectOptionWidget>
                <SPickOptionButton
                  onClick={() => setIsPickOptionModalOpen(true)}
                >
                  {t('AcPostModeration.OptionsTab.OptionCard.pickBtn')}
                </SPickOptionButton>
                <SDropdownButton
                  onClick={() => setIsEllipseMenuOpen(true)}
                >
                  <InlineSvg
                    svg={ChevronDown}
                    fill={theme.colorsThemed.text.primary}
                    width="20px"
                    height="20px"
                  />
                </SDropdownButton>
              </SSelectOptionWidget>
            ) : (
              <>
                <SPickOptionButtonMobile
                  onClick={() => setIsPickOptionModalOpen(true)}
                >
                  {t('AcPostModeration.OptionsTab.OptionCard.pickBtn')}
                </SPickOptionButtonMobile>
                <SEllipseButton
                  onClick={() => setIsEllipseMenuOpen(true)}
                >
                  <InlineSvg
                    svg={MoreIconFilled}
                    fill={theme.colorsThemed.text.secondary}
                    width="20px"
                    height="20px"
                  />
                </SEllipseButton>
              </>
            )
          ) : (
            !isMobile ? (
              <SEllipseButton
                onClick={() => setIsEllipseMenuOpen(true)}
              >
                <InlineSvg
                  svg={MoreIconFilled}
                  fill={theme.colorsThemed.text.secondary}
                  width="20px"
                  height="20px"
                />
              </SEllipseButton>
            ) : (
              <SEllipseButtonMobile
                onClick={() => setIsEllipseMenuOpen(true)}
              >
                { t('AcPost.OptionsTab.OptionCard.moreBtn') }
              </SEllipseButtonMobile>
            )
          )}
          {!isMobile && (
            <AcOptionCardModerationEllipseMenu
              isVisible={isEllipseMenuOpen}
              handleClose={() => setIsEllipseMenuOpen(false)}
              handleOpenReportOptionModal={() => setIsReportModalOpen(true)}
              handleOpenBlockUserModal={() => setIsBlockModalOpen(true)}
              handleOpenRemoveOptionModal={() => setIsDeleteModalOpen(true)}
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
            <SCoinImg
              src={CoinIcon.src}
            />
            <div>
              {option.totalAmount?.usdCents ? `$${formatNumber(option?.totalAmount?.usdCents / 100 ?? 0, true)}` : '$0'}
            </div>
          </SBidAmount>
          <SOptionInfo
            variant={3}
          >
            {option.title}
          </SOptionInfo>
          <SBiddersInfo
            variant={3}
          >
            <SSpanBiddersHighlighted
              className="spanHighlighted"
              onClick={() => handleRedirectToOptionCreator()}
              style={{
                ...(option.isCreatedBySubscriber ? {
                  color: theme.colorsThemed.accent.yellow,
                  cursor: 'pointer',
                } : {}),
              }}
            >
              {option.creator?.nickname ?? option.creator?.username}
            </SSpanBiddersHighlighted>
            {option.supporterCount > 1 ? (
              <>
                <SSpanBiddersRegular
                  className="spanRegular"
                >
                  {` & `}
                </SSpanBiddersRegular>
                <SSpanBiddersHighlighted
                  className="spanHighlighted"
                >
                  {formatNumber(
                    option.supporterCount - 1,
                    true,
                  )}
                  { ' ' }
                  {t('AcPost.OptionsTab.OptionCard.others')}
                </SSpanBiddersHighlighted>
              </>
            ) : null}
            {' '}
            <SSpanBiddersRegular
              className="spanRegular"
            >
              {t('AcPost.OptionsTab.OptionCard.bid')}
            </SSpanBiddersRegular>
          </SBiddersInfo>
        </SBidDetailsModal>
      </AcPickWinningOptionModal>
      {/* Delete option */}
      <AcConfirmDeleteOption
        isVisible={isDeleteModalOpen}
        closeModal={() => setIsDeleteModalOpen(false)}
        handleConfirmDelete={handleConfirmDelete}
      />
      {/* Ellipse modal */}
      <AcOptionCardModerationEllipseModal
        isOpen={isEllipseMenuOpen}
        zIndex={16}
        onClose={() => setIsEllipseMenuOpen(false)}
        handleOpenDeletePostModal={() => setIsDeleteModalOpen(true)}
      />
    </>
  );
};

AcOptionCardModeration.defaultProps = {
};

export default AcOptionCardModeration;


const SContainer = styled(motion.div)`
  position: relative;

  display: flex;
  flex-direction: column;
  gap: 12px;

  width: 100%;

  padding: 16px;

  background-color: ${({ theme }) => theme.colorsThemed.background.tertiary};
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

const SBidDetails = styled.div`
  position: relative;

  display: grid;
  grid-template-areas:
    'amount amount'
    'optionInfo optionInfo'
    'bidders bidders';
  grid-template-columns: 7fr 1fr;

  width: 100%;

  ${({ theme }) => theme.media.tablet} {
    grid-template-areas:
    'amount bidders'
    'optionInfo optionInfo';
    grid-template-columns: 3fr 7fr;

    background-color: ${({ theme }) => theme.colorsThemed.background.tertiary};
    border-radius: ${({ theme }) => theme.borderRadius.medium};

    padding: 14px;
  }
`;

const SBidAmount = styled.div`
  grid-area: amount;

  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;

  margin-bottom: 6px;
`;

const SCoinImg = styled.img`
  height: 24px;
`;

const SOptionInfo = styled(Text)`
  grid-area: optionInfo;

  margin-bottom: 8px;

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

const SPickOptionButton = styled.button`
  font-weight: bold;
  font-size: 14px;
  line-height: 24px;
  color: ${({ theme }) => theme.colorsThemed.text.primary};

  padding: 0px 16px;

  background-color: ${({ theme }) => theme.colorsThemed.background.tertiary};

  border: transparent;

  cursor: pointer;
  transition: 0.2s linear;

  &:focus, &:hover {
    outline: none;
    background-color: ${({ theme }) => theme.colorsThemed.accent.blue};
  }
`;

const SDropdownButton = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;

  background-color: ${({ theme }) => theme.colorsThemed.background.primary};

  border: transparent;

  padding: 0px 8px;

  cursor: pointer;
  transition: 0.2s linear;

  &:focus, &:hover {
    outline: none;
    background-color: ${({ theme }) => theme.colorsThemed.accent.blue};
  }
`;

const SPickOptionButtonMobile = styled.button`
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

  &:focus, &:hover {
    outline: none;
    background-color: ${({ theme }) => theme.colorsThemed.accent.blue};
  }
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

  &:focus, &:hover {
    outline: none;
    background-color: ${({ theme }) => theme.colorsThemed.accent.blue};
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
