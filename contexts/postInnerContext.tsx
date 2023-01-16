/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { newnewapi } from 'newnew-api';
import { useRouter } from 'next/router';
import React, {
  createContext,
  useState,
  useContext,
  useMemo,
  MutableRefObject,
  useCallback,
} from 'react';
import { reportPost } from '../api/endpoints/report';
import { ReportData } from '../components/molecules/direct-messages/ReportModal';
import { useAppSelector } from '../redux-store/store';
import { TPostStatusStringified } from '../utils/switchPostStatus';
import { TPostType } from '../utils/switchPostType';

const PostInnerContext = createContext<{
  modalContainerRef: MutableRefObject<HTMLDivElement | undefined>;
  isMyPost: boolean;
  postParsed:
    | newnewapi.Auction
    | newnewapi.Crowdfunding
    | newnewapi.MultipleChoice
    | undefined;
  typeOfPost: TPostType | undefined;
  postStatus: TPostStatusStringified;
  isFollowingDecision: boolean;
  deletedByCreator: boolean;
  hasRecommendations: boolean;
  recommendedPosts: newnewapi.Post[];
  saveCard: boolean | undefined;
  stripeSetupIntentClientSecret: string | undefined;
  loadingRef: any;
  recommendedPostsLoading: boolean;
  reportPostOpen: boolean;
  handleSeeNewDeletedBox: () => void;
  handleOpenRecommendedPost: (newPost: newnewapi.Post) => void;
  handleReportSubmit: ({ reasons, message }: ReportData) => Promise<void>;
  handleReportClose: () => void;
  handleSetIsFollowingDecision: (v: boolean) => void;
  handleGoBackInsidePost: () => void;
  handleUpdatePostStatus: (newStatus: number | string) => void;
  handleReportOpen: () => void;
  resetSetupIntentClientSecret: () => void;
  handleCloseAndGoBack: () => void;
  shareMenuOpen: boolean;
  deletePostOpen: boolean;
  ellipseMenuOpen: boolean;
  handleDeletePost: () => Promise<void>;
  handleFollowDecision: () => Promise<void>;
  handleEllipseMenuClose: () => void;
  handleOpenDeletePostModal: () => void;
  handleShareClose: () => void;
  handleOpenShareMenu: () => void;
  handleOpenEllipseMenu: () => void;
  handleCloseDeletePostModal: () => void;
  handleSetIsConfirmToClosePost: (newState: boolean) => void;
}>({
  modalContainerRef: {} as MutableRefObject<HTMLDivElement | undefined>,
  isMyPost: false,
  postParsed: undefined,
  typeOfPost: undefined,
  postStatus: 'voting',
  isFollowingDecision: false,
  deletedByCreator: false,
  hasRecommendations: false,
  recommendedPosts: [],
  saveCard: undefined,
  stripeSetupIntentClientSecret: undefined,
  loadingRef: undefined,
  recommendedPostsLoading: false,
  reportPostOpen: false,
  handleSeeNewDeletedBox: () => {},
  handleOpenRecommendedPost: (newPost: newnewapi.Post) => {},
  handleReportSubmit: (() => {}) as unknown as ({
    reasons,
    message,
  }: ReportData) => Promise<void>,
  handleReportClose: () => {},
  handleSetIsFollowingDecision: (v: boolean) => {},
  handleGoBackInsidePost: () => {},
  handleUpdatePostStatus: (newStatus: number | string) => {},
  handleReportOpen: () => {},
  resetSetupIntentClientSecret: () => {},
  handleCloseAndGoBack: () => {},
  shareMenuOpen: false,
  deletePostOpen: false,
  ellipseMenuOpen: false,
  handleDeletePost: (() => {}) as () => Promise<void>,
  handleFollowDecision: (() => {}) as () => Promise<void>,
  handleEllipseMenuClose: () => {},
  handleOpenDeletePostModal: () => {},
  handleShareClose: () => {},
  handleOpenShareMenu: () => {},
  handleOpenEllipseMenu: () => {},
  handleCloseDeletePostModal: () => {},
  handleSetIsConfirmToClosePost: (newState: boolean) => {},
});

interface IPostContextProvider {
  modalContainerRef: MutableRefObject<HTMLDivElement | undefined>;
  isMyPost: boolean;
  postParsed:
    | newnewapi.Auction
    | newnewapi.Crowdfunding
    | newnewapi.MultipleChoice
    | undefined;
  typeOfPost: TPostType | undefined;
  postStatus: TPostStatusStringified;
  isFollowingDecision: boolean;
  deletedByCreator: boolean;
  recommendedPosts: newnewapi.Post[];
  saveCard: boolean | undefined;
  stripeSetupIntentClientSecret: string | undefined;
  loadingRef: any;
  recommendedPostsLoading: boolean;
  handleSeeNewDeletedBox: () => void;
  handleOpenRecommendedPost: (newPost: newnewapi.Post) => void;
  handleSetIsFollowingDecision: (v: boolean) => void;
  handleGoBackInsidePost: () => void;
  handleUpdatePostStatus: (newStatus: number | string) => void;
  resetSetupIntentClientSecret: () => void;
  handleCloseAndGoBack: () => void;
  handleFollowDecision: () => Promise<void>;
  deletePostOpen: boolean;
  handleDeletePost: () => Promise<void>;
  handleOpenDeletePostModal: () => void;
  handleCloseDeletePostModal: () => void;
  handleSetIsConfirmToClosePost: (newState: boolean) => void;
  children: React.ReactNode;
}

const PostContextProvider: React.FunctionComponent<IPostContextProvider> = ({
  modalContainerRef,
  isMyPost,
  postParsed,
  typeOfPost,
  postStatus,
  isFollowingDecision,
  deletedByCreator,
  recommendedPosts,
  recommendedPostsLoading,
  handleOpenRecommendedPost,
  handleSeeNewDeletedBox,
  saveCard,
  stripeSetupIntentClientSecret,
  loadingRef,
  handleCloseAndGoBack,
  handleSetIsFollowingDecision,
  handleGoBackInsidePost,
  handleUpdatePostStatus,
  resetSetupIntentClientSecret,
  handleFollowDecision,
  deletePostOpen,
  handleDeletePost,
  handleOpenDeletePostModal,
  handleCloseDeletePostModal,
  handleSetIsConfirmToClosePost,
  children,
}) => {
  const router = useRouter();
  const user = useAppSelector((state) => state.user);

  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [ellipseMenuOpen, setEllipseMenuOpen] = useState(false);
  const [reportPostOpen, setReportPostOpen] = useState(false);

  const handleReportOpen = useCallback(() => {
    if (!user.loggedIn && user._persist?.rehydrated) {
      router.push(
        `/sign-up?reason=report&redirect=${encodeURIComponent(
          window.location.href
        )}`
      );
      return;
    }
    setReportPostOpen(true);
  }, [user, router]);

  const handleReportSubmit = useCallback(
    async ({ reasons, message }: ReportData) => {
      if (postParsed) {
        await reportPost(postParsed.postUuid, reasons, message).catch((e) =>
          console.error(e)
        );
      }
    },
    [postParsed]
  );

  const handleOpenShareMenu = useCallback(() => {
    setShareMenuOpen(true);
  }, []);
  const handleOpenEllipseMenu = useCallback(() => {
    setEllipseMenuOpen(true);
  }, []);

  const handleReportClose = useCallback(() => {
    setReportPostOpen(false);
  }, []);

  const handleShareClose = useCallback(() => {
    setShareMenuOpen(false);
  }, []);

  const handleEllipseMenuClose = useCallback(() => {
    setEllipseMenuOpen(false);
  }, []);

  const contextValueMemo = useMemo(
    () => ({
      modalContainerRef,
      isMyPost,
      postParsed,
      typeOfPost,
      postStatus,
      isFollowingDecision,
      deletedByCreator,
      hasRecommendations: recommendedPosts.length > 0,
      recommendedPosts,
      saveCard,
      stripeSetupIntentClientSecret,
      handleSeeNewDeletedBox,
      handleOpenRecommendedPost,
      loadingRef,
      recommendedPostsLoading,
      reportPostOpen,
      handleReportSubmit,
      handleReportClose,
      handleSetIsFollowingDecision,
      handleGoBackInsidePost,
      handleUpdatePostStatus,
      handleReportOpen,
      resetSetupIntentClientSecret,
      handleCloseAndGoBack,
      shareMenuOpen,
      deletePostOpen,
      ellipseMenuOpen,
      handleDeletePost,
      handleFollowDecision,
      handleEllipseMenuClose,
      handleOpenDeletePostModal,
      handleShareClose,
      handleOpenShareMenu,
      handleOpenEllipseMenu,
      handleCloseDeletePostModal,
      handleSetIsConfirmToClosePost,
    }),
    [
      modalContainerRef,
      isMyPost,
      postParsed,
      typeOfPost,
      postStatus,
      isFollowingDecision,
      deletedByCreator,
      recommendedPosts,
      saveCard,
      stripeSetupIntentClientSecret,
      handleSeeNewDeletedBox,
      handleOpenRecommendedPost,
      loadingRef,
      recommendedPostsLoading,
      reportPostOpen,
      handleReportSubmit,
      handleReportClose,
      handleSetIsFollowingDecision,
      handleGoBackInsidePost,
      handleUpdatePostStatus,
      handleReportOpen,
      resetSetupIntentClientSecret,
      handleCloseAndGoBack,
      shareMenuOpen,
      deletePostOpen,
      ellipseMenuOpen,
      handleDeletePost,
      handleFollowDecision,
      handleEllipseMenuClose,
      handleOpenDeletePostModal,
      handleShareClose,
      handleOpenShareMenu,
      handleOpenEllipseMenu,
      handleCloseDeletePostModal,
      handleSetIsConfirmToClosePost,
    ]
  );

  return (
    <PostInnerContext.Provider value={contextValueMemo}>
      {children}
    </PostInnerContext.Provider>
  );
};

export default PostContextProvider;

export function usePostInnerState() {
  const context = useContext(PostInnerContext);
  if (!context)
    throw new Error(
      'usePostInnerState must be used inside a `PostInnerContextProvider`'
    );
  return context;
}
