/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-nested-ternary */
/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable arrow-body-style */
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import styled, { css } from 'styled-components';
import { useTranslation } from 'next-i18next';
import { newnewapi } from 'newnew-api';
import { toast } from 'react-toastify';
import moment from 'moment';

import { SocketContext } from '../../../contexts/socketContext';
import { ChannelsContext } from '../../../contexts/channelsContext';
import { useAppDispatch, useAppSelector } from '../../../redux-store/store';
import { toggleMutedMode } from '../../../redux-store/slices/uiStateSlice';
import { fetchPostByUUID, markPost } from '../../../api/endpoints/post';
import {
  fetchAcOptionById,
  fetchCurrentBidsForPost,
  placeBidOnAuction,
} from '../../../api/endpoints/auction';

import Lottie from '../../atoms/Lottie';
import GoBackButton from '../../molecules/GoBackButton';
import PostVideo from '../../molecules/decision/PostVideo';
import PostTimer from '../../molecules/decision/PostTimer';
import PostTopInfo from '../../molecules/decision/PostTopInfo';
import DecisionTabs from '../../molecules/decision/PostTabs';
import AcWinnerTab from '../../molecules/decision/auction/AcWinnerTab';
import AcOptionsTab from '../../molecules/decision/auction/AcOptionsTab';
import CommentsTab from '../../molecules/decision/CommentsTab';
import LoadingModal from '../../molecules/LoadingModal';

// Assets
import loadingAnimation from '../../../public/animations/logo-loading-blue.json';

// Utils
import isBrowser from '../../../utils/isBrowser';
import switchPostType from '../../../utils/switchPostType';
import { TPostStatusStringified } from '../../../utils/switchPostStatus';
import PaymentSuccessModal from '../../molecules/decision/PaymentSuccessModal';

interface IPostSuccessAC {
  post: newnewapi.Auction;
  postStatus: TPostStatusStringified;
  handleGoBack: () => void;
  handleUpdatePostStatus: (postStatus: number | string) => void;
}

const PostSuccessAC: React.FunctionComponent<IPostSuccessAC> = ({
  post,
  postStatus,
  handleGoBack,
  handleUpdatePostStatus,
}) => {
  const { t } = useTranslation('decision');

  return (
    <>hey</>
  );
};

export default PostSuccessAC;
