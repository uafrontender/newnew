import { v4 as uuidv4 } from 'uuid';

function getGuestId(): string {
  const GUEST_ID_KEY = 'savedGuestId';
  let guestId = localStorage.getItem(GUEST_ID_KEY);
  if (!guestId) {
    guestId = uuidv4();
    localStorage.setItem(GUEST_ID_KEY, guestId);
  }
  return guestId;
}

export default getGuestId;
