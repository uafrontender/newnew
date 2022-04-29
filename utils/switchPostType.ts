import { newnewapi } from 'newnew-api';

export type TPostType = 'cf' | 'mc' | 'ac';

const switchPostType = (
  post:
    | newnewapi.IPost
    | newnewapi.Auction
    | newnewapi.Crowdfunding
    | newnewapi.MultipleChoice
): [
  newnewapi.Auction | newnewapi.Crowdfunding | newnewapi.MultipleChoice,
  TPostType
] => {
  if (!(post as any).postUuid) {
    const postAsPost = post as newnewapi.Post;
    if (postAsPost.auction) {
      return [postAsPost.auction as newnewapi.Auction, 'ac'];
    }
    if (postAsPost.crowdfunding) {
      return [postAsPost.crowdfunding as newnewapi.Crowdfunding, 'cf'];
    }
    if (postAsPost.multipleChoice) {
      return [postAsPost.multipleChoice as newnewapi.MultipleChoice, 'mc'];
    }
  }
  if (post instanceof newnewapi.MultipleChoice) {
    return [post, 'mc'];
  }
  if (post instanceof newnewapi.Auction) {
    return [post, 'ac'];
  }
  if (post instanceof newnewapi.Crowdfunding) {
    return [post, 'cf'];
  }
  throw new Error('Unknow post type');
};

export default switchPostType;
