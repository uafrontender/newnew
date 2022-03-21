import React, { useState } from 'react';
import NewMessageButton from '../../atoms/chat/NewMessageButton';
import { IChatData } from '../../interfaces/ichat';
import NewMessageModal from './NewMessageModal';

interface IFunctionProps {
  openChat: (arg: IChatData) => void;
}

const NewMessage: React.FC<IFunctionProps> = ({ openChat }) => {
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
      <NewMessageModal openChat={openChat} showModal={showModal} closeModal={closeModal} />
    </>
  );
};

export default NewMessage;
