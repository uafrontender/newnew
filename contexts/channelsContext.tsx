/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-plusplus */
/* eslint-disable consistent-return */
/* eslint-disable no-unused-vars */
import { newnewapi } from 'newnew-api';
import React, {
  createContext,
  useState,
  useMemo,
  useEffect,
  useContext,
} from 'react';
import { SocketContext } from './socketContext';

interface IChannels {
  [key: string]: number;
}

export const ChannelsContext = createContext({
  channelsWithSubs: {},
  addChannel: (id: string, channel: newnewapi.IChannel) => {},
  removeChannel: (id: string) => {},
});

interface IChannelsContextProvider {
  children: React.ReactNode;
}

const ChannelsContextProvider: React.FC<IChannelsContextProvider> = ({
  children,
}) => {
  const socketConnection = useContext(SocketContext);
  const [channelsWithSubs, setChannelsWithSubs] = useState<IChannels>({});
  const [scheduledArr, setScheduledArr] = useState<string[]>([]);

  const addChannel = (id: string, channel: newnewapi.IChannel) => {
    setChannelsWithSubs((curr) => {
      const workingObj = { ...curr };
      const shouldSubscribe = !workingObj[id] || workingObj[id] === 0;

      if (!socketConnection?.connected) {
        setScheduledArr((currentArr) => [...currentArr, id]);
        return curr;
      }

      if (shouldSubscribe && socketConnection && socketConnection?.connected) {
        const subscribeMsg = new newnewapi.SubscribeToChannels({
          channels: [channel],
        });

        const subscribeMsgEncoded =
          newnewapi.SubscribeToChannels.encode(subscribeMsg).finish();
        socketConnection?.emit('SubscribeToChannels', subscribeMsgEncoded);
      }
      workingObj[id] = shouldSubscribe ? 1 : workingObj[id] + 1;
      return workingObj;
    });
  };

  const removeChannel = (id: string) => {
    setChannelsWithSubs((curr) => {
      const workingObj = { ...curr };
      if (workingObj[id]) {
        workingObj[id] -= 1;
      }
      return workingObj;
    });
  };

  const contextValue = useMemo(
    () => ({
      channelsWithSubs,
      addChannel,
      removeChannel,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [channelsWithSubs]
  );

  useEffect(() => {
    if (socketConnection?.connected) {
      if (scheduledArr.length > 0) {
        setScheduledArr((currentArr) => {
          currentArr.forEach((val) => {
            setChannelsWithSubs((curr) => {
              const workingObj = { ...curr };
              const shouldSubscribe = !workingObj[val] || workingObj[val] === 0;
              if (
                shouldSubscribe &&
                socketConnection &&
                socketConnection?.connected
              ) {
                let subscribeMsg;
                if (val.startsWith('chat_')) {
                  const chatId = parseInt(val.split('_')[1]);
                  subscribeMsg = new newnewapi.SubscribeToChannels({
                    channels: [
                      {
                        chatRoomUpdates: {
                          chatRoomId: chatId,
                        },
                      },
                    ],
                  });
                } else if (
                  val ===
                  newnewapi.Channel.CuratedListType.Type.POPULAR.toString()
                ) {
                  subscribeMsg = new newnewapi.SubscribeToChannels({
                    channels: [
                      {
                        curatedListUpdates: {
                          type: newnewapi.Channel.CuratedListType.Type.POPULAR,
                        },
                      },
                    ],
                  });
                } else {
                  subscribeMsg = new newnewapi.SubscribeToChannels({
                    channels: [
                      {
                        postUpdates: {
                          postUuid: val,
                        },
                      },
                    ],
                  });
                }

                const subscribeMsgEncoded =
                  newnewapi.SubscribeToChannels.encode(subscribeMsg).finish();
                socketConnection?.emit(
                  'SubscribeToChannels',
                  subscribeMsgEncoded
                );
              }
              workingObj[val] = shouldSubscribe ? 1 : workingObj[val] + 1;

              return workingObj;
            });
          });
          return [];
        });
      }
    }
  }, [socketConnection, socketConnection?.connected, scheduledArr]);

  useEffect(() => {
    const shouldUnsubArray: newnewapi.IChannel[] = [];
    for (let i = 0; i < Object.values(channelsWithSubs).length; i++) {
      if (Object.values(channelsWithSubs)[i] < 1) {
        if (Object.keys(channelsWithSubs)[i].startsWith('chat_')) {
          const chatId = parseInt(
            Object.keys(channelsWithSubs)[i].split('_')[1]
          );
          shouldUnsubArray.push({
            chatRoomUpdates: {
              chatRoomId: chatId,
            },
          } as newnewapi.IChannel);
        } else if (Object.keys(channelsWithSubs)[i]) {
          shouldUnsubArray.push({
            postUpdates: {
              postUuid: Object.keys(channelsWithSubs)[i],
            },
          } as newnewapi.IChannel);
        }
      }
    }
    if (shouldUnsubArray.length > 0) {
      const unsubMsg = new newnewapi.UnsubscribeFromChannels({
        channels: shouldUnsubArray,
      });
      socketConnection?.emit(
        'UnsubscribeFromChannels',
        newnewapi.UnsubscribeFromChannels.encode(unsubMsg).finish()
      );
    }
  }, [socketConnection, channelsWithSubs]);

  return (
    <ChannelsContext.Provider value={contextValue}>
      {children}
    </ChannelsContext.Provider>
  );
};

export default ChannelsContextProvider;
