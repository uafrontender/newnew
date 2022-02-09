/* eslint-disable camelcase */
import React, { useContext, useEffect, useState } from 'react';
import type { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { newnewapi } from 'newnew-api';

import Lottie from '../components/atoms/Lottie';

import logoAnimation from '../public/animations/logo-loading-blue.json';
import { SocketContext } from '../contexts/socketContext';
import { getSubscriptionStatus } from '../api/endpoints/subscription';

interface ISubscriptionSuccessPage {
  userId: string;
}

const SubscriptionSuccessPage: NextPage<ISubscriptionSuccessPage> = ({
  userId,
}) => {
  const router = useRouter();

  // Socket
  const socketConnection = useContext(SocketContext);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function checkSubscriptionStatus() {
      try {
        const getStatusPayload = new newnewapi.SubscriptionStatusRequest({
          creatorUuid: userId,
        });

        const res = await getSubscriptionStatus(getStatusPayload);

        if (res.data?.status?.activeRenewsAt) {
          console.log('Subscribed! Redirecting to chat');
          router.push(`/direct-messages?user=${userId}`);
        }
      } catch (err) {
        console.error(err);
      }
    }

    checkSubscriptionStatus();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handlerSubscriptionUpdated = async (data: any) => {
      const arr = new Uint8Array(data);
      const decoded = newnewapi.CreatorSubscriptionChanged.decode(arr);

      if (!decoded) return;

      console.log(decoded);

      setIsLoading(false);

      // router.push('/');
      router.push(`/direct-messages?user=${decoded.creatorUuid}`);
    };

    if (socketConnection) {
      socketConnection.on('CreatorSubscriptionChanged', handlerSubscriptionUpdated);
    }

    return () => {
      if (socketConnection && socketConnection.connected) {
        socketConnection.off('CreatorSubscriptionChanged', handlerSubscriptionUpdated);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socketConnection]);

  return (
    <div>
      <main>
        <div
          style={{
            width: '100vw',
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <Lottie
            width={64}
            height={64}
            options={{
              loop: true,
              autoplay: true,
              animationData: logoAnimation,
            }}
            isStopped={!isLoading}
          />
        </div>
      </main>
    </div>
  );
};

export default SubscriptionSuccessPage;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { userId } = context.query;

  if (!userId
    || Array.isArray(userId)
  ) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  return {
    props: {
      userId,
    },
  };
};
