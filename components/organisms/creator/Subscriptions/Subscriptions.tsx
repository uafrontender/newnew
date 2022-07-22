/* eslint-disable no-nested-ternary */
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';
import { newnewapi } from 'newnew-api';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Headline from '../../../atoms/Headline';
import { useAppSelector } from '../../../../redux-store/store';
import { getMySubscriptionProduct } from '../../../../api/endpoints/subscription';
import { useGetSubscriptions } from '../../../../contexts/subscriptionsContext';
import { getMyRooms } from '../../../../api/endpoints/chat';
import Button from '../../../atoms/Button';
import Lottie from '../../../atoms/Lottie';
import loadingAnimation from '../../../../public/animations/logo-loading-blue.json';
import { useGetChats } from '../../../../contexts/chatContext';

const SubscribersTable = dynamic(
  () => import('../../../molecules/creator/dashboard/SubscribersTable')
);
const NoResults = dynamic(
  () => import('../../../molecules/creator/dashboard/subscriptions/NoResults')
);
const Navigation = dynamic(
  () => import('../../../molecules/creator/Navigation')
);

export const Subscriptions: React.FC = React.memo(() => {
  const { t } = useTranslation('page-Creator');
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );
  const { setMobileChatOpened } = useGetChats();
  const { mySubscribersTotal, isMySubscribersIsLoading } =
    useGetSubscriptions();
  const [mySubscriptionProduct, setMySubscriptionProduct] =
    useState<newnewapi.ISubscriptionProduct | null>(null);

  const [myAnnouncementRoom, setMyAnnouncementRoom] =
    useState<newnewapi.IChatRoom | undefined>();
  const [loadingRoom, setLoadingRoom] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchMyRoom = async () => {
    if (loadingRoom) return;
    try {
      setLoadingRoom(true);
      const payload = new newnewapi.GetMyRoomsRequest({
        myRole: 2,
        roomKind: 4,
        paging: {
          limit: 1,
        },
      });
      const res = await getMyRooms(payload);

      if (!res.data || res.error)
        throw new Error(res.error?.message ?? 'Request failed');
      if (res.data && res.data.rooms[0].id) {
        setMyAnnouncementRoom(res.data.rooms[0]);
      }
      setLoadingRoom(false);
    } catch (err) {
      console.error(err);
      setLoadingRoom(false);
    }
  };

  useEffect(() => {
    if (!myAnnouncementRoom && mySubscribersTotal > 0) fetchMyRoom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myAnnouncementRoom, mySubscribersTotal]);

  const fetchMySubscriptionProduct = async () => {
    if (isLoading) return;
    try {
      setIsLoading(true);
      const payload = new newnewapi.EmptyRequest();
      const res = await getMySubscriptionProduct(payload);
      if (res.error) throw new Error(res.error?.message ?? 'Request failed');
      if (res.data?.myProduct) {
        setMySubscriptionProduct(res.data?.myProduct);
      }
      setIsLoading(false);
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!mySubscriptionProduct && !isLoading) {
      fetchMySubscriptionProduct();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mySubscriptionProduct, isLoading]);

  return (
    <SContainer>
      {!isMobile && <Navigation />}
      <SContent>
        <STitleBlock>
          <STitle variant={4}>
            {t('subscriptions.title')}{' '}
            {mySubscribersTotal > 0 && `(${mySubscribersTotal})`}
          </STitle>
          {myAnnouncementRoom && mySubscribersTotal > 0 ? (
            isMobile ? (
              <Button
                view='primaryGrad'
                onClick={() => {
                  if (isMobile) {
                    setMobileChatOpened(true, {
                      chatRoom: myAnnouncementRoom,
                      showChatList: null,
                    });
                  }
                }}
              >
                {t('subscriptions.messageAll')}
              </Button>
            ) : (
              <Link
                href={`/creator/dashboard?tab=direct-messages&roomID=${myAnnouncementRoom.id}`}
              >
                <a>
                  <Button view='primaryGrad'>
                    {t('subscriptions.messageAll')}
                  </Button>
                </a>
              </Link>
            )
          ) : null}
        </STitleBlock>
        {!isMySubscribersIsLoading ? (
          !mySubscribersTotal || mySubscribersTotal < 1 ? (
            <NoResults />
          ) : (
            <SubscribersTable />
          )
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
      </SContent>
    </SContainer>
  );
});

export default Subscriptions;

const SContainer = styled.div`
  position: relative;
  margin-top: -16px;

  ${(props) => props.theme.media.tablet} {
    margin-top: unset;
  }

  ${(props) => props.theme.media.laptop} {
    margin-top: -40px;
    margin-bottom: -40px;
  }
`;

const SContent = styled.div`
  margin-bottom: 30px;
  width: 100%;
  background: ${(props) => props.theme.colorsThemed.background.tertiary};
  border-radius: 24px;
  padding: 19px 0 30px;

  ${(props) => props.theme.media.tablet} {
    margin-left: 200px;
    width: calc(100vw - 270px);
    padding: 40px 0;
  }

  ${(props) => props.theme.media.laptop} {
    margin-left: 224px;
    width: calc(100vw - 385px);
  }
`;

const STitle = styled(Headline)`
  font-weight: 600;
`;

const STitleBlock = styled.section`
  display: flex;
  align-items: center;
  margin-bottom: 18px;
  padding: 0 24px;
  flex-direction: row;
  justify-content: space-between;

  ${(props) => props.theme.media.laptop} {
    margin-bottom: 48px;
  }
`;
