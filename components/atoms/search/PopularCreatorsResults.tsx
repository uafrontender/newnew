/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { newnewapi } from 'newnew-api';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import React from 'react';
import styled from 'styled-components';
import UserAvatar from '../../molecules/UserAvatar';
import InlineSvg from '../InlineSVG';
import VerificationCheckmark from '../../../public/images/svg/icons/filled/Verification.svg';
import getDisplayname from '../../../utils/getDisplayname';
import { Mixpanel } from '../../../utils/mixpanel';

interface IFunction {
  creators: newnewapi.IUser[];
}

const PopularCreatorsResults: React.FC<IFunction> = ({ creators }) => {
  const { t } = useTranslation('common');
  return (
    <SContainer>
      <SBlockTitle>{t('search.popularCreators')}</SBlockTitle>
      {creators.map((creator) => (
        <Link href={`/${creator.username}`} key={creator.uuid}>
          <a>
            <SPost
              onClick={() => {
                Mixpanel.track('Search Result Creator Clicked', {
                  _creatorUsername: creator.username,
                });
              }}
            >
              <SLeftSide>
                <SUserAvatar>
                  <UserAvatar avatarUrl={creator.avatarUrl ?? ''} />
                </SUserAvatar>
                <SPostData>
                  <CreatorData>
                    <SCreatorUsername>
                      {getDisplayname(creator)}
                    </SCreatorUsername>
                    {creator.options?.isVerified && (
                      <SInlineSVG
                        svg={VerificationCheckmark}
                        width='16px'
                        height='16px'
                        fill='none'
                      />
                    )}
                  </CreatorData>
                  <SLink>{t('search.creatorSubtitle')}</SLink>
                </SPostData>
              </SLeftSide>
            </SPost>
          </a>
        </Link>
      ))}
    </SContainer>
  );
};

export default PopularCreatorsResults;

const SContainer = styled.div`
  padding-bottom: 20px;
`;

const SBlockTitle = styled.strong`
  display: block;
  color: #646e81;
  font-size: 16px;
  font-weight: 700;
  line-height: 24px;
  margin-bottom: 16px;
`;

const SPost = styled.div`
  /* margin-bottom: 16px; */
  display: flex;
  font-size: 14px;
  line-height: 20px;
  font-weight: 600;
  padding: 8px 16px;
  margin: 0 -16px;
  cursor: pointer;
  &:hover {
    background: ${({ theme }) => theme.colorsThemed.background.secondary};
  }
`;

const SLeftSide = styled.div`
  display: flex;
`;

const SPostData = styled.div`
  display: flex;
  flex-direction: column;
`;

const CreatorData = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  overflow: hidden;
`;

const SUserAvatar = styled.div`
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 6px;
  & > * {
    width: 100%;
    height: 100%;
    min-width: 100%;
    min-height: 100%;
  }
`;

const SCreatorUsername = styled.span`
  color: ${({ theme }) => theme.colorsThemed.text.primary};
`;

const SInlineSVG = styled(InlineSvg)`
  min-width: 24px;
  min-height: 24px;
  margin-right: 14px;
`;

const SLink = styled.span`
  color: ${({ theme }) => theme.colorsThemed.text.secondary};
`;
