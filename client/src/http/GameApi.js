import axios from 'axios';
import config from '../../config/config';

export const $gameApi = axios.create({
	baseURL: config.serverBaseUrl,
})