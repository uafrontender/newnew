/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable no-nested-ternary */
import { motion } from 'framer-motion';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import React from 'react';
import styled, { useTheme } from 'styled-components';

import { TAcOptionWithHighestField } from '../../../../organisms/decision/PostViewAC';

import Text from '../../../../atoms/Text';
import Button from '../../../../atoms/Button';

import { formatNumber } from '../../../../../utils/format';

// Icons
import CoinIcon from '../../../../../public/images/decision/coin-mock.png';
import MoreIconFilled from '../../../../../public/images/svg/icons/filled/More.svg';
import InlineSvg from '../../../../atoms/InlineSVG';

interface IAcOptionCardModeration {
  option: TAcOptionWithHighestField;
  index: number;
}

const AcOptionCardModeration: React.FunctionComponent<IAcOptionCardModeration> = ({
  option,
  index,
}) => {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation('decision');

  // Redirect to user's page
  const handleRedirectToOptionCreator = () => router.push(`/u/${option.creator?.username}`);

  return (
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
        <SSupportButton>
          <InlineSvg
            svg={MoreIconFilled}
            fill={theme.colorsThemed.text.secondary}
            width="20px"
            height="20px"
          />
        </SSupportButton>
      </SContainer>
    </motion.div>
  );
};

AcOptionCardModeration.defaultProps = {
};

export default AcOptionCardModeration;


const SContainer = styled(motion.div)`
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

const SSupportButton = styled(Button)`
  width: 100%;

  span {
    display: flex;
    align-items: center;
    justify-content: center;

    gap: 8px;
  }

  ${({ theme }) => theme.media.tablet} {
    width: auto;

    padding: 0px 12px;
    margin-right: 16px;

    color: ${({ theme }) => theme.colorsThemed.text.secondary};
    background: none;

    &:hover:enabled,
    &:focus:enabled {
      background: none;
      color: ${({ theme }) => theme.colorsThemed.text.primary};
    }
  }
`;
