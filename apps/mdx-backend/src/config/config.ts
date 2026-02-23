import { isDevelopment } from './env';

export const BFF_URL = 'https://api.ticscreek.top';
export const redirect = isDevelopment ? 'https://dev.ticscreek.top:5173' : 'https://ticscreek.top';
