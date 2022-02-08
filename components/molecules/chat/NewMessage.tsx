import React, { useState } from 'react';
import NewMessageButton from '../../atoms/chat/NewMessageButton';
import NewMessageModal from './NewMessageModal';

const NewMessage: React.FC = () => {
  const [showModal, setShowModal] = useState<boolean>(true);

  const openModal = () => {
    setShowModal(true);
  };
  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <>
      <NewMessageButton handleClick={openModal} />
      <NewMessageModal showModal={showModal} closeModal={closeModal} />
    </>
  );
};

export default NewMessage;
