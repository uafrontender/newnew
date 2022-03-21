import { TPostType } from "./switchPostType";
import { TPostStatusStringified } from "./switchPostStatus";

// TODO: Resolve stringification issue
export default function switchPostStatusString(
  postType: TPostType,
  status: string,
): TPostStatusStringified {

  if (postType === 'ac') {
    switch (status) {
      case 'SCHEDULED': {
        return 'scheduled';
      }
      case 'ACCEPTING_BIDS': {
        return 'voting';
      }
      case 'WAITING_FOR_DECISION': {
        return 'wating_for_decision';
      }
      case 'WAITING_FOR_RESPONSE': {
        return 'waiting_for_response';
      }
      case 'SUCCEEDED': {
        return 'succeeded';
      }
      case 'DELETED': {
        return 'deleted';
      }
      case 'ANNOUNCE_FLAGGED': {
        return 'flagged';
      }
      case 'RESPONSE_FLAGGED': {
        return 'flagged';
      }
      case 'PROCESSING_ANNOUNCE': {
        return 'processing';
      }
      case 'PROCESSING_RESPONSE': {
        return 'processing';
      }
      case 'FAILED': {
        return 'failed';
      }
      default: {
        return 'processing';
      }
    }
  }

  if (postType === 'cf') {
    switch (status) {
      case 'SCHEDULED': {
        return 'scheduled';
      }
      case 'ACCEPTING_PLEDGES': {
        return 'voting';
      }
      case 'WAITING_FOR_RESPONSE': {
        return 'waiting_for_response';
      }
      case 'SUCCEEDED': {
        return 'succeeded';
      }
      case 'DELETED': {
        return 'deleted';
      }
      case 'ANNOUNCE_FLAGGED': {
        return 'flagged';
      }
      case 'RESPONSE_FLAGGED': {
        return 'flagged';
      }
      case 'PROCESSING_ANNOUNCE': {
        return 'processing';
      }
      case 'PROCESSING_RESPONSE': {
        return 'processing';
      }
      case 'FAILED': {
        return 'failed';
      }
      default: {
        return 'processing';
      }
    }
  }

  if (postType === 'mc') {
    switch (status) {
      case 'SCHEDULED': {
        return 'scheduled';
      }
      case 'ACCEPTING_VOTES': {
        return 'voting';
      }
      case 'WAITING_FOR_RESPONSE': {
        return 'waiting_for_response';
      }
      case 'SUCCEEDED': {
        return 'succeeded';
      }
      case 'DELETED': {
        return 'deleted';
      }
      case 'ANNOUNCE_FLAGGED': {
        return 'flagged';
      }
      case 'RESPONSE_FLAGGED': {
        return 'flagged';
      }
      case 'PROCESSING_ANNOUNCE': {
        return 'processing';
      }
      case 'PROCESSING_RESPONSE': {
        return 'processing';
      }
      case 'FAILED': {
        return 'failed';
      }
      default: {
        return 'processing';
      }
    }
  }

  return 'processing';
}
