import { atom } from 'jotai';

function getSavedUser() {
  try {
    const saved = localStorage.getItem('collabr_user');
    if (saved) {
      return JSON.parse(saved);
    }
    return null;
  } catch (e) {
    return null;
  }
}

export const userAtom = atom(getSavedUser());
