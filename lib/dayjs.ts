import dayjs from 'dayjs';
import 'dayjs/locale/he';
import localizedFormat from 'dayjs/plugin/localizedFormat';

dayjs.extend(localizedFormat);
dayjs.locale('he');

export const formatDate = (date: Date | string | dayjs.Dayjs): string => {
  return dayjs(date).format('DD/MM/YYYY');
};

export const formatDateTime = (date: Date | string | dayjs.Dayjs): string => {
  return dayjs(date).format('DD/MM/YYYY HH:mm');
};

export const formatTimeWindow = (
  start: Date | string | dayjs.Dayjs,
  end: Date | string | dayjs.Dayjs
): string => {
  const startFormatted = dayjs(start).format('DD/MM HH:mm');
  const endFormatted = dayjs(end).format('DD/MM HH:mm');
  return `${startFormatted} - ${endFormatted}`;
};

export default dayjs;

