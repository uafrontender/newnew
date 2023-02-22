import 'i18next'; // before v13.0.0 -> import 'react-i18next';
import type common from '../public/locales/en-US/common.json';
import type componentPostCard from '../public/locales/en-US/component-PostCard.json';
import type modalPaymentModal from '../public/locales/en-US/modal-PaymentModal.json';
import type modalResponseSuccessModal from '../public/locales/en-US/modal-ResponseSuccessModal.json';
import type modalEditPostTitle from '../public/locales/en-US/modal-EditPostTitle.json';
import type page404 from '../public/locales/en-US/page-404.json';
import type pageAbout from '../public/locales/en-US/page-About.json';
import type pageBundles from '../public/locales/en-US/page-Bundles.json';
import type pageChat from '../public/locales/en-US/page-Chat.json';
import type pageCreation from '../public/locales/en-US/page-Creation.json';
import type pageCreator from '../public/locales/en-US/page-Creator.json';
import type pageCreatorOnboarding from '../public/locales/en-US/page-CreatorOnboarding.json';
import type pageHome from '../public/locales/en-US/page-Home.json';
import type pageHowItWorks from '../public/locales/en-US/page-HowItWorks.json';
import type pageNotifications from '../public/locales/en-US/page-Notifications.json';
import type pagePost from '../public/locales/en-US/page-Post.json';
import type pageProfile from '../public/locales/en-US/page-Profile.json';
import type pageSearch from '../public/locales/en-US/page-Search.json';
import type pageSeeMore from '../public/locales/en-US/page-SeeMore.json';
import type pageSignUp from '../public/locales/en-US/page-SignUp.json';
import type pageUnsubscribe from '../public/locales/en-US/page-Unsubscribe.json'
import type pageVerifyEmail from '../public/locales/en-US/page-VerifyEmail.json';

export interface I18nNamespaces {
  common: typeof common,
  'component-PostCard': typeof componentPostCard,
  'modal-PaymentModal': typeof modalPaymentModal,
  'modal-ResponseSuccessModal': typeof modalResponseSuccessModal,
  'modal-EditPostTitle': typeof modalEditPostTitle,
  'page-404': typeof page404,
  'page-About': typeof pageAbout,
  'page-Bundles': typeof pageBundles,
  'page-Chat': typeof pageChat,
  'page-Creation': typeof pageCreation,
  'page-Creator': typeof pageCreator,
  'page-CreatorOnboarding': typeof pageCreatorOnboarding,
  'page-Home': typeof pageHome,
  'page-HowItWorks': typeof pageHowItWorks,
  'page-Notifications': typeof pageNotifications,
  'page-Post': typeof pagePost,
  'page-Profile': typeof pageProfile,
  'page-Search': typeof pageSearch,
  'page-SeeMore': typeof pageSeeMore,
  'page-SignUp': typeof pageSignUp,
  'page-Unsubscribe': typeof pageUnsubscribe,
  'page-VerifyEmail': typeof pageVerifyEmail,
}

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common'
    resources: I18nNamespaces
  }
}
