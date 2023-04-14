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
import {
  QueryObserverResult,
  RefetchOptions,
  RefetchQueryFilters,
} from 'react-query';
import { reportPost } from '../api/endpoints/report';
import { ReportData } from '../components/molecules/direct-messages/ReportModal';
import { useAppSelector } from '../redux-store/store';
import { TUpdatePostCoverImageMutation } from '../utils/hooks/usePost';
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
  bundleStripeSetupIntentClientSecret: string | undefined;
  customOptionTextFromRedirect: string | undefined;
  // loadingRef: any;
  recommendedPostsLoading: boolean;
  reportPostOpen: boolean;
  handleSeeNewDeletedBox: () => void;
  handleReportSubmit: ({ reasons, message }: ReportData) => Promise<void>;
  handleReportClose: () => void;
  handleSetIsFollowingDecision: (v: boolean) => void;
  handleGoBackInsidePost: () => void;
  handleReportOpen: () => void;
  resetSetupIntentClientSecret: () => void;
  resetBundleSetupIntentClientSecret: () => void;
  handleCloseAndGoBack: () => void;
  shareMenuOpen: boolean;
  deletePostOpen: boolean;
  ellipseMenuOpen: boolean;
  isDeletingPost: boolean;
  handleDeletePost: () => Promise<void>;
  handleFollowDecision: () => Promise<void>;
  handleEllipseMenuClose: () => void;
  handleOpenDeletePostModal: () => void;
  handleShareClose: () => void;
  handleOpenShareMenu: () => void;
  handleOpenEllipseMenu: () => void;
  handleCloseDeletePostModal: () => void;
  handleSetIsConfirmToClosePost: (newState: boolean) => void;
  handleUpdatePostTitle: (newTitle: string) => Promise<void>;
  handleUpdatePostCoverImage: (
    newImage: TUpdatePostCoverImageMutation
  ) => Promise<void>;
  handleUpdatePostData: (updatedPost: newnewapi.IPost) => void;
  isUpdateTitleLoading: boolean;
  refetchPost: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<newnewapi.IPost, any>>;
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
  bundleStripeSetupIntentClientSecret: undefined,
  customOptionTextFromRedirect: undefined,
  // loadingRef: undefined,
  recommendedPostsLoading: false,
  reportPostOpen: false,
  handleSeeNewDeletedBox: () => {},
  handleReportSubmit: (() => {}) as unknown as ({
    reasons,
    message,
  }: ReportData) => Promise<void>,
  handleReportClose: () => {},
  handleSetIsFollowingDecision: (v: boolean) => {},
  handleGoBackInsidePost: () => {},
  handleReportOpen: () => {},
  resetSetupIntentClientSecret: () => {},
  resetBundleSetupIntentClientSecret: () => {},
  handleCloseAndGoBack: () => {},
  shareMenuOpen: false,
  deletePostOpen: false,
  ellipseMenuOpen: false,
  isDeletingPost: false,
  handleDeletePost: (() => {}) as () => Promise<void>,
  handleFollowDecision: (() => {}) as () => Promise<void>,
  handleEllipseMenuClose: () => {},
  handleOpenDeletePostModal: () => {},
  handleShareClose: () => {},
  handleOpenShareMenu: () => {},
  handleOpenEllipseMenu: () => {},
  handleCloseDeletePostModal: () => {},
  handleSetIsConfirmToClosePost: (newState: boolean) => {},
  handleUpdatePostTitle: (() => {}) as () => Promise<void>,
  handleUpdatePostCoverImage: (() => {}) as () => Promise<void>,
  handleUpdatePostData: (() => {}) as () => void,
  isUpdateTitleLoading: false,
  refetchPost: (() => {}) as any,
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
  bundleStripeSetupIntentClientSecret: string | undefined;
  customOptionText: string | undefined;
  // loadingRef: any;
  recommendedPostsLoading: boolean;
  handleSeeNewDeletedBox: () => void;
  handleSetIsFollowingDecision: (v: boolean) => void;
  handleGoBackInsidePost: () => void;
  resetSetupIntentClientSecret: () => void;
  resetBundleSetupIntentClientSecret: () => void;
  handleCloseAndGoBack: () => void;
  handleFollowDecision: () => Promise<void>;
  deletePostOpen: boolean;
  isDeletingPost: boolean;
  handleDeletePost: () => Promise<void>;
  handleOpenDeletePostModal: () => void;
  handleCloseDeletePostModal: () => void;
  handleSetIsConfirmToClosePost: (newState: boolean) => void;
  handleUpdatePostTitle: (newTitle: string) => Promise<void>;
  handleUpdatePostCoverImage: (
    newImage: TUpdatePostCoverImageMutation
  ) => Promise<void>;
  handleUpdatePostData: (updatedPost: newnewapi.IPost) => void;
  isUpdateTitleLoading: boolean;
  refetchPost: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<newnewapi.IPost, any>>;
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
  handleSeeNewDeletedBox,
  saveCard,
  stripeSetupIntentClientSecret,
  bundleStripeSetupIntentClientSecret,
  customOptionText: customOptionTextFromRedirect,
  // loadingRef,
  handleCloseAndGoBack,
  handleSetIsFollowingDecision,
  handleGoBackInsidePost,
  resetSetupIntentClientSecret,
  resetBundleSetupIntentClientSecret,
  handleFollowDecision,
  deletePostOpen,
  isDeletingPost,
  handleDeletePost,
  handleOpenDeletePostModal,
  handleCloseDeletePostModal,
  handleSetIsConfirmToClosePost,
  handleUpdatePostTitle,
  handleUpdatePostCoverImage,
  handleUpdatePostData,
  isUpdateTitleLoading,
  refetchPost,
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
      hasRecommendations: recommendedPosts && recommendedPosts.length > 0,
      recommendedPosts,
      saveCard,
      stripeSetupIntentClientSecret,
      bundleStripeSetupIntentClientSecret,
      customOptionTextFromRedirect,
      handleSeeNewDeletedBox,
      // loadingRef,
      recommendedPostsLoading,
      reportPostOpen,
      handleReportSubmit,
      handleReportClose,
      handleSetIsFollowingDecision,
      handleGoBackInsidePost,
      handleReportOpen,
      resetSetupIntentClientSecret,
      resetBundleSetupIntentClientSecret,
      handleCloseAndGoBack,
      shareMenuOpen,
      deletePostOpen,
      ellipseMenuOpen,
      isDeletingPost,
      handleDeletePost,
      handleFollowDecision,
      handleEllipseMenuClose,
      handleOpenDeletePostModal,
      handleShareClose,
      handleOpenShareMenu,
      handleOpenEllipseMenu,
      handleCloseDeletePostModal,
      handleSetIsConfirmToClosePost,
      handleUpdatePostTitle,
      handleUpdatePostCoverImage,
      handleUpdatePostData,
      isUpdateTitleLoading,
      refetchPost,
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
      bundleStripeSetupIntentClientSecret,
      customOptionTextFromRedirect,
      handleSeeNewDeletedBox,
      // loadingRef,
      recommendedPostsLoading,
      reportPostOpen,
      handleReportSubmit,
      handleReportClose,
      handleSetIsFollowingDecision,
      handleGoBackInsidePost,
      handleReportOpen,
      resetSetupIntentClientSecret,
      resetBundleSetupIntentClientSecret,
      handleCloseAndGoBack,
      shareMenuOpen,
      deletePostOpen,
      ellipseMenuOpen,
      isDeletingPost,
      handleDeletePost,
      handleFollowDecision,
      handleEllipseMenuClose,
      handleOpenDeletePostModal,
      handleShareClose,
      handleOpenShareMenu,
      handleOpenEllipseMenu,
      handleCloseDeletePostModal,
      handleSetIsConfirmToClosePost,
      handleUpdatePostTitle,
      handleUpdatePostCoverImage,
      handleUpdatePostData,
      isUpdateTitleLoading,
      refetchPost,
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
