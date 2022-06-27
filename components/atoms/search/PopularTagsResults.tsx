import React from 'react';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import styled from 'styled-components';
import { newnewapi } from 'newnew-api';
import hashtagIcon from '../../../public/images/svg/icons/outlined/Hashtag.svg';
import InlineSvg from '../InlineSVG';

interface IHashtagsResults {
  hashtags: newnewapi.IHashtag[];
}

const PopularTagsResults: React.FC<IHashtagsResults> = ({ hashtags }) => {
  const { t } = useTranslation('common');

  return (
    <SContainer>
      <SBlockTitle>{t('search.popularTags')}</SBlockTitle>
      {hashtags.map((hashtag) => (
        <Link href={`/${hashtag.text}`} key={hashtag.text}>
          <a>
            <SPost>
              <SLeftSide>
                <HashtagIcon>
                  <InlineSvg
                    svg={hashtagIcon}
                    fill='#FFFFFF'
                    width='20px'
                    height='20px'
                  />
                </HashtagIcon>
                <STagData>
                  <SCreatorUsername>{hashtag.text}</SCreatorUsername>
                </STagData>
              </SLeftSide>
            </SPost>
          </a>
        </Link>
      ))}
    </SContainer>
  );
};

export default PopularTagsResults;

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

const STagData = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const HashtagIcon = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border-radius: 6px;
  overflow: hidden;
  margin-right: 16px;
  background: ${(props) =>
    props.theme.colorsThemed.button.background.quaternary};
`;

const SCreatorUsername = styled.span`
  color: ${({ theme }) => theme.colorsThemed.text.primary};
`;
