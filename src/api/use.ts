import axios from "axios";
import { API_ENDPOINTS } from "./urls";
import { BookDataType, HtmlBodyType } from "../types/BookTypes";

export const fetchBook = async (id: number): Promise<BookDataType> => {
    const response = await axios.get<BookDataType>(API_ENDPOINTS.getBook(id));
    return response.data;
};

export const updateBook = async (id: number, extractedData: Partial<BookDataType>): Promise<BookDataType> => {
    const response = await axios.put<BookDataType>(API_ENDPOINTS.updateBook(id), extractedData);
    return response.data;
};

export const fetchHtmlBody = async (id: number): Promise<HtmlBodyType> => {
    const response = await axios.get<HtmlBodyType>(API_ENDPOINTS.getHtmlBody(id));
    return response.data;
};
