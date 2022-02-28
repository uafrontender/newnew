import { newnewapi } from "newnew-api";
import { TPostType } from "./switchPostType";

export type TPostStatusStringified =
  'scheduled'
  | 'voting'
  | 'wating_for_decision'
  | 'waiting_for_response'
  | 'flagged'
  | 'succeeded'
  | 'failed'
  | 'cancelled'
  | 'processing';

export default function switchPostStatus(
  postType: TPostType,
  status: newnewapi.Auction.Status | newnewapi.Crowdfunding.Status | newnewapi.MultipleChoice.Status,
): TPostStatusStringified {
  console.log(typeof status)

  if (postType === 'ac') {
    switch (status as newnewapi.Auction.Status) {
      case newnewapi.Auction.Status.SCHEDULED: {
        return 'scheduled';
      }
      case newnewapi.Auction.Status.ACCEPTING_BIDS: {
        return 'voting';
      }
      case newnewapi.Auction.Status.WAITING_FOR_DECISION: {
        return 'wating_for_decision';
      }
      case newnewapi.Auction.Status.WAITING_FOR_RESPONSE: {
        return 'waiting_for_response';
      }
      case newnewapi.Auction.Status.SUCCEEDED: {
        return 'succeeded';
      }
      case newnewapi.Auction.Status.CANCELLED: {
        return 'cancelled';
      }
      case newnewapi.Auction.Status.ANNOUNCE_FLAGGED: {
        return 'flagged';
      }
      case newnewapi.Auction.Status.RESPONSE_FLAGGED: {
        return 'flagged';
      }
      case newnewapi.Auction.Status.PROCESSING_ANNOUNCE: {
        return 'processing';
      }
      case newnewapi.Auction.Status.PROCESSING_RESPONSE: {
        return 'processing';
      }
      case newnewapi.Auction.Status.FAILED: {
        return 'failed';
      }
      default: {
        return 'processing';
      }
    }
  }

  if (postType === 'cf') {
    switch (status as newnewapi.Crowdfunding.Status) {
      case newnewapi.Crowdfunding.Status.SCHEDULED: {
        return 'scheduled';
      }
      case newnewapi.Crowdfunding.Status.ACCEPTING_PLEDGES: {
        return 'voting';
      }
      case newnewapi.Crowdfunding.Status.WAITING_FOR_RESPONSE: {
        return 'waiting_for_response';
      }
      case newnewapi.Crowdfunding.Status.SUCCEEDED: {
        return 'succeeded';
      }
      case newnewapi.Crowdfunding.Status.CANCELLED: {
        return 'cancelled';
      }
      case newnewapi.Crowdfunding.Status.ANNOUNCE_FLAGGED: {
        return 'flagged';
      }
      case newnewapi.Crowdfunding.Status.RESPONSE_FLAGGED: {
        return 'flagged';
      }
      case newnewapi.Crowdfunding.Status.PROCESSING_ANNOUNCE: {
        return 'processing';
      }
      case newnewapi.Crowdfunding.Status.PROCESSING_RESPONSE: {
        return 'processing';
      }
      case newnewapi.Crowdfunding.Status.FAILED: {
        return 'failed';
      }
      default: {
        return 'processing';
      }
    }
  }

  if (postType === 'mc') {
    switch (status as newnewapi.MultipleChoice.Status) {
      case newnewapi.MultipleChoice.Status.SCHEDULED: {
        return 'scheduled';
      }
      case newnewapi.MultipleChoice.Status.ACCEPTING_VOTES: {
        return 'voting';
      }
      case newnewapi.MultipleChoice.Status.WAITING_FOR_RESPONSE: {
        return 'waiting_for_response';
      }
      case newnewapi.MultipleChoice.Status.SUCCEEDED: {
        return 'succeeded';
      }
      case newnewapi.MultipleChoice.Status.CANCELLED: {
        return 'cancelled';
      }
      case newnewapi.MultipleChoice.Status.ANNOUNCE_FLAGGED: {
        return 'flagged';
      }
      case newnewapi.MultipleChoice.Status.RESPONSE_FLAGGED: {
        return 'flagged';
      }
      case newnewapi.MultipleChoice.Status.PROCESSING_ANNOUNCE: {
        return 'processing';
      }
      case newnewapi.MultipleChoice.Status.PROCESSING_RESPONSE: {
        return 'processing';
      }
      case newnewapi.MultipleChoice.Status.FAILED: {
        return 'failed';
      }
      default: {
        return 'processing';
      }
    }
  }

  return 'processing';
}
