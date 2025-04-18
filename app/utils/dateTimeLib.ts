export function getDayDiff(startDate: Date, endDate: Date): number {

  // console.log('startDate', startDate)
  // console.log('endDate', endDate)
  // console.log('Number(endDate) - Number(startDate)', Number(endDate) - Number(startDate))
  const msInDay = 24 * 60 * 60 * 1000;
  return Math.round(
    Math.abs(Number(endDate) - Number(startDate)) / msInDay
  );
}
export function getHourDiff(startDate: Date, endDate: Date): number {
  const msInHour = 60 * 60 * 1000;
  return Math.round(
    Math.abs(Number(endDate) - Number(startDate)) / msInHour
  );
}
export function getMinsDiff(startDate: Date, endDate: Date): number {
  const msInMin = 60 * 1000;
  return Math.round(
    Math.abs(Number(endDate) - Number(startDate)) / msInMin
  );
}

function dateConverted(date: Date): Date {
  return new Date(date);
}

export function getDaysFromToday(date: Date): number {
  const now = new Date();
  return getDayDiff(now, dateConverted(date))
}
export function getHoursFromToday(date: Date): number {
  const now = new Date();
  return getHourDiff(now, dateConverted(date))
}
export function getMinsFromToday(date: Date): number {
  const now = new Date();
  return getMinsDiff(now, dateConverted(date))
}

export function convertToLocaleDateTime(date: Date): string {
  return new Date(date).toLocaleString();
}
