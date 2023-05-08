import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { newnewapi } from 'newnew-api';

import NewMessageButton from '../../atoms/direct-messages/NewMessageButton';
import { Mixpanel } from '../../../utils/mixpanel';

const NewMessageModal = dynamic(() => import('./NewMessageModal'));

interface INewMessage {
  onNewMessageSelect: (chatRoom: newnewapi.IChatRoom) => void;
}

const NewMessage: React.FC<INewMessage> = ({ onNewMessageSelect }) => {
  const [showModal, setShowModal] = useState<boolean>(false);

  const openModal = () => {
    Mixpanel.track('New Message Button Clicked', {
      _stage: 'Direct Messages',
    });
    setShowModal(true);
  };
  const closeModal = () => {
    Mixpanel.track('New Message Modal Closed', {
      _stage: 'Direct Messages',
    });
    setShowModal(false);
  };

  return (
    <>
      <NewMessageButton handleClick={openModal} />
      {showModal && (
        <NewMessageModal
          showModal={showModal}
          closeModal={closeModal}
          onNewMessageSelect={onNewMessageSelect}
        />
      )}
    </>
  );
};

export default NewMessage;
