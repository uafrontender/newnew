import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import NewMessageButton from '../../atoms/direct-messages/NewMessageButton';

const NewMessageModal = dynamic(() => import('./NewMessageModal'));

const NewMessage: React.FC = () => {
  const [showModal, setShowModal] = useState<boolean>(false);

  const openModal = () => {
    setShowModal(true);
  };
  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <>
      <NewMessageButton handleClick={openModal} />
      {showModal && (
        <NewMessageModal showModal={showModal} closeModal={closeModal} />
      )}
    </>
  );
};

export default NewMessage;
