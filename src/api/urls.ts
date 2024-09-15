const BASE_URL = "http://localhost:5000";
const BASE_WS = "ws://localhost:5000";
export const BASE_BOOK_URL = `${BASE_URL}/book`;

export const API_ENDPOINTS = {
    getBooksInit: () => `${BASE_URL}/books/init`,
    getBook: (id: number) => `${BASE_URL}/book/${id}`,
    getMdBody: (id: number) => `${BASE_URL}/book/mdbody/${id}`,
    getHtmlBody: (id: number) => `${BASE_URL}/book/htmlbody/${id}`,
    getIsGpt: (id: number) => `${BASE_URL}/book/isgpt/${id}`,
    getMdUsage: (id: number) => `${BASE_URL}/book/mdusage/${id}`,
    getHtmlUsage: (id: number) => `${BASE_URL}/book/htmlusage/${id}`,
    getTemporaryGpt: (id: number) => `${BASE_URL}/book/temporarygpt/${id}`,
    postCreate: () => `${BASE_URL}/book/create`,
    postGpt: () => `${BASE_URL}/book/gpt`,
    runGptOfToc: () => `${BASE_URL}/book/gpt/toc`,
    runGptOfMdBody: () => `${BASE_URL}/book/gpt/mdbody`,
    updateBook: (id: number) => `${BASE_URL}/book/${id}`,
    deleteBook: (id: number) => `${BASE_URL}/book/${id}`,
};

export const WS_ENDPOINTS = {
    wsGptOfMdBody:  () => `${BASE_WS}/book/gpt/mdbody`,
}

