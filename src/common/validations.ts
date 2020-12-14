import { DateTime } from 'luxon';

export const isAdult = (birthDate: string, adultYears: number): boolean => {
  const today = DateTime.local();
  const birth = DateTime.fromISO(birthDate);

  return today.diff(birth, ['years']).years >= adultYears;
};

export const isFirstDateLater = (
  firstDate: Date | string,
  secondDate: Date | string,
): boolean => {
  const first = new Date(firstDate);
  const second = new Date(secondDate);

  return first > second;
};
