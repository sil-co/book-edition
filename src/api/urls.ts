const BASE_URL = "http://localhost:5000";
export const BASE_BOOK_URL = `${BASE_URL}/book`;

export const API_ENDPOINTS = {
    getBooksInit: () => `${BASE_URL}/books`,
    getBook: (id: number) => `${BASE_URL}/book/${id}`,
    getMdBody: (id: number) => `${BASE_URL}/book/mdbody/${id}`,
    getHtmlBody: (id: number) => `${BASE_URL}/book/htmlbody/${id}`,
    getMdUsage: (id: number) => `${BASE_URL}/book/mdusage/${id}`,
    getHtmlUsage: (id: number) => `${BASE_URL}/book/htmlusage/${id}`,
    updateBook: (id: number) => `${BASE_URL}/book/${id}`,
    deleteBook: (id: number) => `${BASE_URL}/book/${id}`,
};

