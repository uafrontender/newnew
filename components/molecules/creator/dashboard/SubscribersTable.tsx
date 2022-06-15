import React, { useCallback, useEffect, useState } from 'react';
import styled, { css, useTheme } from 'styled-components';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { newnewapi } from 'newnew-api';
import dynamic from 'next/dynamic';

import Button from '../../../atoms/Button';
import Lottie from '../../../atoms/Lottie';
import { getMySubscribers } from '../../../../api/endpoints/subscription';
import { useGetSubscriptions } from '../../../../contexts/subscriptionsContext';
import arrowDown from '../../../../public/images/svg/icons/filled/ArrowDown.svg';
import loadingAnimation from '../../../../public/animations/logo-loading-blue.json';
import ChevronDown from '../../../../public/images/svg/icons/outlined/ChevronDown.svg';
import ChevronFirstPage from '../../../../public/images/svg/icons/outlined/ChevronFirstPage.svg';

const SubscriberRow = dynamic(
  () => import('../../../atoms/dashboard/SubscriberRow')
);

const InlineSVG = dynamic(() => import('../../../atoms/InlineSVG'));

export const SubscribersTable = () => {
  const { t } = useTranslation('page-Creator');
  const theme = useTheme();
  const { mySubscribersTotal } = useGetSubscriptions();

  const [isSortDirectionDesc, setIsSortDirectionDesc] = useState<boolean>(true);
  const [isMySubscribersIsLoading, setMySubscribersIsLoading] = useState(false);
  const [mySubscribers, setMySubscribers] = useState<newnewapi.ISubscriber[]>(
    []
  );
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [lastPage, setLastPage] = useState<number>(0);

  const fetchMySubscribers = useCallback(async () => {
    if (isMySubscribersIsLoading) return;
    try {
      setMySubscribersIsLoading(true);
      const payload = new newnewapi.GetMySubscribersRequest({
        sortBy: 1,
        order: isSortDirectionDesc ? 2 : 1,
        paging: {
          limit: 10,
          offset: currentPage * 10,
        },
      });
      const res = await getMySubscribers(payload);

      if (!res.data || res.error)
        throw new Error(res.error?.message ?? 'Request failed');
      if (res.data && res.data.subscribers.length > 0) {
        setMySubscribers(res.data?.subscribers as newnewapi.ISubscriber[]);
      }
      setMySubscribersIsLoading(false);
    } catch (err) {
      console.error(err);
      setMySubscribersIsLoading(false);
    }
  }, [isMySubscribersIsLoading, currentPage, isSortDirectionDesc]);

  useEffect(() => {
    if (mySubscribersTotal > 10)
      setLastPage(Math.ceil(mySubscribersTotal / 10));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mySubscribersTotal]);

  const goNextPage = useCallback(() => setCurrentPage((curr) => curr + 1), []);
  const goPrevPage = useCallback(() => setCurrentPage((curr) => curr - 1), []);
  const goFirstPage = useCallback(() => setCurrentPage(0), []);
  const goLastPage = useCallback(() => setCurrentPage(lastPage), [lastPage]);

  const changeSortDirection = useCallback(() => {
    setIsSortDirectionDesc(!isSortDirectionDesc);
    setCurrentPage(0);
  }, [isSortDirectionDesc]);

  useEffect(() => {
    fetchMySubscribers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, changeSortDirection]);

  const renderItem = useCallback(
    (subscriber: newnewapi.ISubscriber) => (
      <SubscriberRow key={subscriber.user?.uuid} subscriber={subscriber} />
    ),
    []
  );

  return (
    <>
      {!isMySubscribersIsLoading ? (
        <STable>
          <SThead>
            <SSub>{t('subscriptions.table.subscribers')}</SSub>
            <SDate onClick={changeSortDirection}>
              <SDateWrapper>
                <div>{t('subscriptions.table.date')}</div>
                <SDateInlineSVG
                  svg={arrowDown}
                  fill={theme.colorsThemed.text.tertiary}
                  width='20px'
                  height='20px'
                  sortDirectionDesc={isSortDirectionDesc}
                />
              </SDateWrapper>
            </SDate>
          </SThead>
          <STBody>{mySubscribers.map(renderItem)}</STBody>
          <STfoot>
            <SUpdateSub href='/creator/subscribers/edit-subscription-rate'>
              {t('subscriptions.table.updateSub')}
            </SUpdateSub>
            <STools>
              {mySubscribersTotal < 10 ? (
                <SCount>
                  1-{mySubscribersTotal} of {mySubscribersTotal}
                </SCount>
              ) : (
                <SCount>{`${currentPage !== 0 ? currentPage : ''}1-${
                  currentPage + 1
                }0 of ${mySubscribersTotal}`}</SCount>
              )}

              <STableNav>
                <SButton
                  onClick={goFirstPage}
                  view='transparent'
                  disabled={currentPage === 0}
                >
                  <SInlineSVG
                    svg={ChevronFirstPage}
                    fill={theme.colorsThemed.text.secondary}
                    width='20px'
                    height='20px'
                  />
                </SButton>
                <SButton
                  onClick={goPrevPage}
                  view='transparent'
                  disabled={currentPage === 0}
                >
                  <SInlineSVG
                    type='prev'
                    svg={ChevronDown}
                    fill={theme.colorsThemed.text.secondary}
                    width='20px'
                    height='20px'
                  />
                </SButton>
                <SButton
                  onClick={goNextPage}
                  view='transparent'
                  disabled={currentPage === lastPage}
                >
                  <SInlineSVG
                    type='next'
                    svg={ChevronDown}
                    fill={theme.colorsThemed.text.secondary}
                    width='20px'
                    height='20px'
                  />
                </SButton>
                <SButton
                  onClick={goLastPage}
                  view='transparent'
                  disabled={currentPage === lastPage}
                >
                  <SInlineSVG
                    type='last-page'
                    svg={ChevronFirstPage}
                    fill={theme.colorsThemed.text.secondary}
                    width='20px'
                    height='20px'
                  />
                </SButton>
              </STableNav>
            </STools>
          </STfoot>
        </STable>
      ) : (
        <Lottie
          width={64}
          height={64}
          options={{
            loop: true,
            autoplay: true,
            animationData: loadingAnimation,
          }}
        />
      )}
    </>
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
  border-top: 1px solid
    ${(props) => props.theme.colorsThemed.background.outlines1};
  border-bottom: 1px solid
    ${(props) => props.theme.colorsThemed.background.outlines1};
  line-height: 48px;
  margin-bottom: -1px;
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
  display: flex;

  ${(props) => props.theme.media.tablet} {
    width: 33%;
  }
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
  transform: rotate(
    ${(props) => (!props.sortDirectionDesc ? '180deg' : '0deg')}
  );
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
