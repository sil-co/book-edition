import axios, { AxiosResponse } from 'axios';
import { API_ENDPOINTS } from "./urls";
import * as BT from '../types/BookTypes';
import * as OT from '../types/OpenApiTypes';

export const runGpt = async (
    reqBodyGpt: OT.ReqBodyGpt
) => {
    const res: AxiosResponse<BT.BookDataType> = await axios.post<BT.BookDataType>(API_ENDPOINTS.postGpt(), reqBodyGpt);
    return res.data;
}

export const runGptOfMdBody = async (
    reqBodyGpt: OT.ReqBodyGpt
) => {
    const res: AxiosResponse<string> = await axios.post<string>(API_ENDPOINTS.runGptOfMdBody(), reqBodyGpt);
    return res.data;
}
