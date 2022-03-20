import React, { useCallback, useEffect, useState } from 'react';
import styled, { css, useTheme } from 'styled-components';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { newnewapi } from 'newnew-api';

import arrowDown from '../../../../public/images/svg/icons/filled/ArrowDown.svg';
import ChevronFirstPage from '../../../../public/images/svg/icons/outlined/ChevronFirstPage.svg';
import ChevronDown from '../../../../public/images/svg/icons/outlined/ChevronDown.svg';
import Button from '../../../atoms/Button';
import InlineSVG from '../../../atoms/InlineSVG';
import { getMySubscribers } from '../../../../api/endpoints/subscription';
import SubscriberRow from '../../../atoms/dashboard/SubscriberRow';
import randomID from '../../../../utils/randomIdGenerator';

export const SubscribersTable = () => {
  const { t } = useTranslation('creator');
  const theme = useTheme();

  const [isSortDirectionDesc, setIsSortDirectionDesc] = useState<boolean>(true);
  const [isMySubscribersIsLoading, setMySubscribersIsLoading] = useState(false);
  const [mySubscribers, setMySubscribers] = useState<newnewapi.ISubscriber[]>([]);
  const [mySubsNextPageToken, setMySubsNextPageToken] = useState<string | undefined | null>('');
  const [mySubsPrevPageToken, setMySubsPrevPageToken] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(0);

  const fetchMySubscribers = useCallback(
    async (pageToken?: string) => {
      if (isMySubscribersIsLoading) return;
      try {
        if (!pageToken) setMySubscribers([]);
        setMySubscribersIsLoading(true);
        const payload = new newnewapi.GetMySubscribersRequest({
          ...(pageToken
            ? {
                paging: {
                  pageToken,
                },
              }
            : {}),
        });
        const res = await getMySubscribers(payload);

        if (!res.data || res.error) throw new Error(res.error?.message ?? 'Request failed');
        if (res.data && res.data.subscribers.length > 0) {
          setMySubscribers(res.data?.subscribers as newnewapi.ISubscriber[]);
          setMySubsNextPageToken(res.data.paging?.nextPageToken);
        }
        setMySubscribersIsLoading(false);
      } catch (err) {
        console.error(err);
        setMySubscribersIsLoading(false);
      }
    },
    [isMySubscribersIsLoading]
  );

  useEffect(() => {
    if (mySubscribers.length < 1) fetchMySubscribers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const changeSortDirection = () => {
    setIsSortDirectionDesc(!isSortDirectionDesc);
  };

  const renderItem = useCallback((subscriber) => <SubscriberRow key={randomID()} subscriber={subscriber} />, []);

  const goNextPage = () => {
    if (mySubsNextPageToken) setMySubsPrevPageToken((curr) => [...curr, mySubsNextPageToken!!]);
    fetchMySubscribers(mySubsNextPageToken!!);
    setCurrentPage((curr) => curr + 1);
  };

  const goPrevPage = () => {
    if (!mySubsPrevPageToken[mySubsPrevPageToken.length - 2]) {
      fetchMySubscribers();
      setMySubsPrevPageToken([]);
    } else {
      fetchMySubscribers(mySubsPrevPageToken[mySubsPrevPageToken.length - 2]);
      setMySubsPrevPageToken((curr) => {
        const arr = curr;
        arr.pop();
        return arr;
      });
    }

    setCurrentPage((curr) => curr - 1);
  };

  const goFirstPage = () => {
    fetchMySubscribers();
    setMySubsPrevPageToken([]);
    setCurrentPage(0);
  };

  return (
    <STable>
      <SThead>
        <SSub>{t('subscriptions.table.subscribers')}</SSub>
        <SDate onClick={changeSortDirection}>
          <SDateWrapper>
            {t('subscriptions.table.date')}
            <SDateInlineSVG
              svg={arrowDown}
              fill={theme.colorsThemed.text.tertiary}
              width="20px"
              height="20px"
              sortDirectionDesc={isSortDirectionDesc}
            />
          </SDateWrapper>
        </SDate>
      </SThead>
      <STBody>{mySubscribers.map(renderItem)}</STBody>
      <STfoot>
        <SUpdateSub href="/creator/subscribers/edit-subscription-rate">{t('subscriptions.table.updateSub')}</SUpdateSub>
        <STools>
          {!mySubsNextPageToken && mySubsPrevPageToken.length < 1 ? (
            <SCount>
              1-{mySubscribers.length} of {mySubscribers.length}
            </SCount>
          ) : (
            <SCount>{`${currentPage !== 0 ? currentPage : ''}1-${currentPage + 1}0 of 0,000`}</SCount>
          )}

          <STableNav>
            <SButton onClick={goFirstPage} view="transparent" disabled={mySubsPrevPageToken.length < 1}>
              <SInlineSVG svg={ChevronFirstPage} fill={theme.colorsThemed.text.secondary} width="20px" height="20px" />
            </SButton>
            <SButton onClick={goPrevPage} view="transparent" disabled={mySubsPrevPageToken.length < 1}>
              <SInlineSVG
                type="prev"
                svg={ChevronDown}
                fill={theme.colorsThemed.text.secondary}
                width="20px"
                height="20px"
              />
            </SButton>
            <SButton onClick={goNextPage} view="transparent" disabled={!mySubsNextPageToken}>
              <SInlineSVG
                type="next"
                svg={ChevronDown}
                fill={theme.colorsThemed.text.secondary}
                width="20px"
                height="20px"
              />
            </SButton>
            <SButton
              onClick={() => {
                console.log('1');
              }}
              view="transparent"
              disabled={!mySubsNextPageToken}
            >
              <SInlineSVG
                type="last-page"
                svg={ChevronFirstPage}
                fill={theme.colorsThemed.text.secondary}
                width="20px"
                height="20px"
              />
            </SButton>
          </STableNav>
        </STools>
      </STfoot>
    </STable>
  );
};

export default SubscribersTable;

const STable = styled.div`
  font-weight: 600;
  font-size: 14px;
  color: ${(props) => props.theme.colorsThemed.text.tertiary};
  a {
    color: ${(props) => props.theme.colorsThemed.text.secondary};
  }
`;
const SThead = styled.div`
  display: flex;
  border-top: 1px solid ${(props) => props.theme.colorsThemed.background.outlines1};
  line-height: 48px;
`;

const SSub = styled.div`
  padding: 0 0 0 16px;
  width: 40%;

  ${(props) => props.theme.media.tablet} {
    width: 33%;
  }
`;

const SDate = styled.div`
  padding: 0 0 0 16px;
  width: 33%;
  display: flex;
`;

const SDateWrapper = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
  margin-right: auto;
`;

interface ISDateInlineSVG {
  sortDirectionDesc: boolean;
}

const SDateInlineSVG = styled(InlineSVG)<ISDateInlineSVG>`
  z-index: 1;
  transform: rotate(${(props) => (!props.sortDirectionDesc ? '180deg' : '0deg')});
  transition: all ease 0.5s;
  margin-left: 4px;
`;

const STfoot = styled.div`
  display: flex;
  align-items: center;
  margin-right: auto;
  padding-left: 24px;
`;

const SUpdateSub = styled(Link)`
  margin-right: 0;
  padding-top: 12px;
`;

const STools = styled.div`
  margin-left: auto;
  display: flex;
  align-items: center;
  padding-right: 15px;
  ${(props) => props.theme.media.tablet} {
    padding-right: 60px;
  }
`;

const SCount = styled.div``;

const STBody = styled.div`
  padding: 0 16px 12px;
  ${(props) => props.theme.media.tablet} {
    padding: 0 24px 12px;
  }
`;

const STableNav = styled.div`
  display: flex;
  margin-left: 5px;
`;

const SButton = styled(Button)`
  width: 20px;
  height: 20px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  margin-left: 15px;
`;

interface ISInlineSVG {
  type?: string;
}
const SInlineSVG = styled(InlineSVG)<ISInlineSVG>`
  min-width: 16px;
  min-height: 16px;

  ${(props) => {
    if (props.type === 'prev') {
      return css`
        transform: rotate(90deg);
      `;
    }
    if (props.type === 'next') {
      return css`
        transform: rotate(-90deg);
      `;
    }
    if (props.type === 'last-page') {
      return css`
        transform: rotate(180deg);
      `;
    }
    return css``;
  }}
`;
