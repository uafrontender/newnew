/* eslint-disable no-unused-vars */
import React, { createContext, useState, useMemo } from 'react';

export const ChannelsContext = createContext({
  channels: new Set<string>(),
  addChannel: (id: string) => {},
  removeChannel: (id: string) => {},
});

const ChannelsContextProvider: React.FC = ({ children }) => {
  const [channels, setChannels] = useState<Set<string>>(new Set());

  const addChannel = (id: string) => {
    setChannels((curr) => new Set(curr).add(id));
  };

  const removeChannel = (id: string) => {
    setChannels((curr) => {
      const workingSet = new Set(curr);
      workingSet.delete(id);
      return workingSet;
    });
  };

  const contextValue = useMemo(() => ({
    channels,
    addChannel,
    removeChannel,
  }), [channels]);

  return (
    <ChannelsContext.Provider
      value={contextValue}
    >
      {children}
    </ChannelsContext.Provider>
  );
};

export default ChannelsContextProvider;
