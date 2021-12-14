import { newnewapi } from 'newnew-api';

const switchPostType = (
  post: newnewapi.IPost,
): newnewapi.IAuction | newnewapi.ICrowdfunding | newnewapi.IMultipleChoice => {
  if (post.auction) return post.auction;
  if (post.crowdfunding) return post.crowdfunding;
  if (post.multipleChoice) return post.multipleChoice;
  throw new Error('Unknow post type');
};

export default switchPostType;
