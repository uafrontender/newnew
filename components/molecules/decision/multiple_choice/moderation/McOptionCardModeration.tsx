/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-nested-ternary */
/* eslint-disable quotes */
/* eslint-disable react/jsx-indent */
/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable arrow-body-style */
import React, {
  useMemo, useState,
} from 'react';
import styled, { useTheme } from 'styled-components';
import { motion } from 'framer-motion';
import { newnewapi } from 'newnew-api';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';

import { useAppSelector } from '../../../../../redux-store/store';
import { TMcOptionWithHighestField } from '../../../../organisms/decision/PostViewMC';

import Text from '../../../../atoms/Text';
import Button from '../../../../atoms/Button';

import { formatNumber } from '../../../../../utils/format';

// Icons
import McSymbolIcon from '../../../../../public/images/decision/mc-option-mock.png';
import MoreIconFilled from '../../../../../public/images/svg/icons/filled/More.svg';
import InlineSvg from '../../../../atoms/InlineSVG';
import McOptionCardModerationEllipseMenu from './McOptionCardModerationEllipseMenu';
import McConfirmDeleteOption from './McConfirmDeleteOption';
import { deleteMcOption } from '../../../../../api/endpoints/multiple_choice';
import McOptionCardModerationEllipseModal from './McOptionCardModerationEllipseModal';

interface IMcOptionCardModeration {
  option: TMcOptionWithHighestField;
  creator: newnewapi.IUser,
  postId: string;
  index: number;
}

const McOptionCardModeration: React.FunctionComponent<IMcOptionCardModeration> = ({
  option,
  creator,
  postId,
  index,
}) => {
  const router = useRouter();
  const theme = useTheme();
  const { t } = useTranslation('decision');
  const { resizeMode } = useAppSelector((state) => state.ui);
  const user = useAppSelector((state) => state.user);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);

  const isCreatorsBid = useMemo(() => {
    if (!option.creator) return true;
    return false;
  }, [option.creator]);
  const supporterCountSubstracted = useMemo(() => {
    if (isCreatorsBid) return option.supporterCount;
    return  option.supporterCount - 1;
  }, [option.supporterCount, isCreatorsBid]);

  const [isEllipseMenuOpen, setIsEllipseMenuOpen] = useState(false);

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Redirect to user's page
  const handleRedirectToOptionCreator = () => {
    window?.history.replaceState({
      fromPost: true,
    }, '', '');
    router.push(`/${creator?.username}`);
  }

  const handleConfirmDelete = async () => {
    try {
      const payload = new newnewapi.DeleteMcOptionRequest({
        optionId: option.id,
      });

      const res = await deleteMcOption(payload);

      console.log(res);

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
        layout="position"
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
          layout="position"
          transition={{
            type: 'spring',
            damping: 20,
            stiffness: 300,
          }}
        >
          <SBidDetails>
            <SBidAmount>
              <SOptionSymbolImg
                src={McSymbolIcon.src}
              />
              <div>
                {
                  option.voteCount && option.voteCount > 0
                  ? `${formatNumber(option?.voteCount, true)}`
                  : t('McPost.OptionsTab.OptionCard.noVotes')
                }
              </div>
            </SBidAmount>
            <SOptionInfo
              variant={3}
            >
              {option.text}
            </SOptionInfo>
            <SBiddersInfo
              variant={3}
            >
              {isCreatorsBid ? (
                <>
                  {supporterCountSubstracted > 0 ? (
                    <>
                      <SSpanBiddersHighlighted>
                        {formatNumber(
                          supporterCountSubstracted,
                          true,
                        )}
                        { ' ' }
                        { t('McPost.OptionsTab.OptionCard.voters') }
                      </SSpanBiddersHighlighted>
                      {' '}
                      <SSpanBiddersRegular>
                        {t('McPost.OptionsTab.OptionCard.voted')}
                      </SSpanBiddersRegular>
                    </>
                  ) : null}
                </>
              ) : (
                <>
                  <SSpanBiddersHighlighted
                    onClick={() => {
                      handleRedirectToOptionCreator()
                    }}
                    style={{
                      color: theme.name === 'dark' ? theme.colorsThemed.accent.yellow : theme.colors.dark,
                      cursor: 'pointer',
                    }}
                  >
                    {t('McPost.OptionsTab.OptionCard.subscriber_suggestion',
                      {
                        nickname: option.creator?.nickname ?? option.creator?.username
                      },
                    )}
                  </SSpanBiddersHighlighted>
                  {supporterCountSubstracted > 0 ? (
                    <>
                      { ', ' }
                      <SSpanBiddersHighlighted>
                        {formatNumber(
                          supporterCountSubstracted,
                          true,
                        )}
                        { ' ' }
                        {t('McPost.OptionsTab.OptionCard.voters')}
                      </SSpanBiddersHighlighted>
                      {' '}
                      <SSpanBiddersRegular>
                        {t('McPost.OptionsTab.OptionCard.voted')}
                      </SSpanBiddersRegular>
                    </>
                  ) : null}
                </>
              )
              }
            </SBiddersInfo>
          </SBidDetails>
          {!isMobile ? (
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
              { t('McPost.OptionsTab.OptionCard.moreBtn') }
            </SEllipseButtonMobile>
          )}
          {!isMobile && (
            <McOptionCardModerationEllipseMenu
              isVisible={isEllipseMenuOpen}
              isBySubscriber={!isCreatorsBid}
              handleClose={() => setIsEllipseMenuOpen(false)}
              handleOpenReportOptionModal={() => setIsReportModalOpen(true)}
              handleOpenBlockUserModal={() => setIsBlockModalOpen(true)}
              handleOpenRemoveOptionModal={() => setIsDeleteModalOpen(true)}
            />
          )}
        </SContainer>
      </motion.div>
      {/* Modals */}
      {/* Delete option */}
      <McConfirmDeleteOption
        isVisible={isDeleteModalOpen}
        closeModal={() => setIsDeleteModalOpen(false)}
        handleConfirmDelete={handleConfirmDelete}
      />
      {/* Ellipse modal */}
      {isMobile && (
        <McOptionCardModerationEllipseModal
          isOpen={isEllipseMenuOpen}
          zIndex={16}
          onClose={() => setIsEllipseMenuOpen(false)}
          handleOpenDeletePostModal={() => setIsDeleteModalOpen(true)}
        />
      )}
    </>
  );
};

McOptionCardModeration.defaultProps = {};

export default McOptionCardModeration;

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
    /* width: 80%; */
    flex-direction: row;
    justify-content: space-between;
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

const SOptionSymbolImg = styled.img`
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
