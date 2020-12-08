import { DateTime } from 'luxon';

export const isAdult = (birthDate: string, adultYears: number): boolean => {
  const today = DateTime.local();
  const birth = DateTime.fromISO(birthDate);

  return today.diff(birth, ['years']).years >= adultYears;
};
