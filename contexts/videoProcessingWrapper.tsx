import React, { useCallback, useContext, useEffect } from 'react';
import { useRouter } from 'next/router';
import { newnewapi } from 'newnew-api';
import { toast } from 'react-toastify';

import { SocketContext } from './socketContext';
import { usePostModalState } from './postModalContext';

interface IReactFunction {
  children: React.ReactNode;
}

const VideoProcessingWrapper: React.FC<IReactFunction> = ({ children }) => {
  const router = useRouter();
  const socketConnection = useContext(SocketContext);

  const { postOverlayOpen } = usePostModalState();

  const handlerSocketUpdated = useCallback(
    (data: any) => {
      const arr = new Uint8Array(data);
      const decoded = newnewapi.VideoProcessingProgress.decode(arr);

      if (!decoded) return;

      if (!decoded.postUuid) {
        console.log('Post has not been created yet. Returning');
        return;
      }

      if (
        decoded.postUuid &&
        decoded.fractionCompleted === 100 &&
        decoded.status === newnewapi.VideoProcessingProgress.Status.SUCCEEDED
      ) {
        if (
          decoded.videoType ===
          newnewapi.VideoProcessingProgress.VideoType.ANNOUNCE
        ) {
          toast.success('Your video has been processed', {
            onClick: () => {
              router.push(`/post/${decoded.postUuid}`);
            },
          });
        }

        if (
          decoded.videoType ===
            newnewapi.VideoProcessingProgress.VideoType.RESPONSE &&
          !postOverlayOpen
        ) {
          toast.success('Your response has been processed', {
            onClick: () => {
              router.push(`/post/${decoded.postUuid}`);
            },
          });
        }
        return;
      }

      if (
        decoded.postUuid &&
        decoded.status === newnewapi.VideoProcessingProgress.Status.FAILED
      ) {
        toast.error('An error occured when processing your video', {
          onClick: () => {
            router.push(`/post/${decoded.postUuid}`);
          },
        });
      }
    },
    [router, postOverlayOpen]
  );

  useEffect(() => {
    if (socketConnection) {
      socketConnection.on('VideoProcessingProgress', handlerSocketUpdated);
    }

    return () => {
      if (socketConnection && socketConnection.connected) {
        socketConnection.off('VideoProcessingProgress', handlerSocketUpdated);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socketConnection, handlerSocketUpdated]);

  return <>{children}</>;
};

export default VideoProcessingWrapper;
