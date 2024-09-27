import axios, { AxiosResponse } from 'axios';
import { API_ENDPOINTS, WS_ENDPOINTS } from "./urls";
import * as BT from '../types/BookTypes';
import * as OT from '../types/OpenApiTypes';

export const runGpt = async (
    reqBodyGpt: OT.ReqBodyGpt
) => {
    const res: AxiosResponse<BT.BookDataType> = await axios.post<BT.BookDataType>(API_ENDPOINTS.postGpt(), reqBodyGpt);
    return res.data;
}

export const checkIsGpt = async (id: string): Promise<boolean> => {
    const resIsGpt: AxiosResponse<BT.IsGptType> = await axios.get<BT.IsGptType>(API_ENDPOINTS.getIsGpt(id));
    return resIsGpt.data.isGptRunning;
}

export const runGptOfMdBody = async (
    reqBodyGpt: OT.ReqBodyGpt
) => {
    const res: AxiosResponse<string> = await axios.post<string>(API_ENDPOINTS.runGptOfMdBody(), reqBodyGpt);
    return res.data;
}
