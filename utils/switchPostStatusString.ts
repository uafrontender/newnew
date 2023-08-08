import { TPostType } from './switchPostType';
import { TPostStatusStringified } from './switchPostStatus';

// TODO: Resolve stringification issue
export default function switchPostStatusString(
  postType: TPostType,
  status: string
): TPostStatusStringified {
  if (postType === 'ac') {
    switch (status) {
      case 'SCHEDULED':
        return 'scheduled';
      case 'ACCEPTING_BIDS':
        return 'voting';
      case 'WAITING_FOR_DECISION':
        return 'waiting_for_decision';
      case 'WAITING_FOR_RESPONSE':
        return 'waiting_for_response';
      case 'SUCCEEDED':
        return 'succeeded';
      case 'DELETED_BY_CREATOR':
        return 'deleted_by_creator';
      case 'DELETED_BY_ADMIN':
        return 'deleted_by_admin';
      case 'ANNOUNCE_FLAGGED':
        return 'flagged';
      case 'RESPONSE_FLAGGED':
        return 'flagged';
      case 'PROCESSING_ANNOUNCE':
        return 'processing_announcement';
      case 'PROCESSING_RESPONSE':
        return 'processing_response';
      case 'FAILED':
        return 'failed';
      default:
        return 'processing_announcement';
    }
  }

  if (postType === 'cf') {
    switch (status) {
      case 'SCHEDULED':
        return 'scheduled';
      case 'ACCEPTING_PLEDGES':
        return 'voting';
      case 'WAITING_FOR_RESPONSE':
        return 'waiting_for_response';
      case 'SUCCEEDED':
        return 'succeeded';
      case 'DELETED_BY_CREATOR':
        return 'deleted_by_creator';
      case 'DELETED_BY_ADMIN':
        return 'deleted_by_admin';
      case 'ANNOUNCE_FLAGGED':
        return 'flagged';
      case 'RESPONSE_FLAGGED':
        return 'flagged';
      case 'PROCESSING_ANNOUNCE':
        return 'processing_announcement';
      case 'PROCESSING_RESPONSE':
        return 'processing_response';
      case 'FAILED':
        return 'failed';
      default:
        return 'processing_announcement';
    }
  }

  if (postType === 'mc') {
    switch (status) {
      case 'SCHEDULED':
        return 'scheduled';
      case 'ACCEPTING_VOTES':
        return 'voting';
      case 'WAITING_FOR_RESPONSE':
        return 'waiting_for_response';
      case 'SUCCEEDED':
        return 'succeeded';
      case 'DELETED_BY_CREATOR':
        return 'deleted_by_creator';
      case 'DELETED_BY_ADMIN':
        return 'deleted_by_admin';
      case 'ANNOUNCE_FLAGGED':
        return 'flagged';
      case 'RESPONSE_FLAGGED':
        return 'flagged';
      case 'PROCESSING_ANNOUNCE':
        return 'processing_announcement';
      case 'PROCESSING_RESPONSE':
        return 'processing_response';
      case 'FAILED':
        return 'failed';
      default:
        return 'processing_announcement';
    }
  }

  return 'processing_announcement';
}
