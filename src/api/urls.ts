export const BASE_URL = "http://localhost:5000";
export const BASE_WS = "ws://localhost:5000";
export const BASE_IMAGE_URL = "http://localhost:5000";
export const BASE_SAMPLE_URL = "http://localhost:5000/resources/sample/no_image.jpg";

export const API_ENDPOINTS = {
    getUserAuth: () => `${BASE_URL}/user/auth`,
    postRegister: () => `${BASE_URL}/user/register`,
    postLogin: () => `${BASE_URL}/user/login`,
    getBooks: () => `${BASE_URL}/books`,
    getBooksInit: () => `${BASE_URL}/books/init`,
    getBook: (id: string) => `${BASE_URL}/book/${id}`,
    getMdBody: (id: string) => `${BASE_URL}/book/mdbody/${id}`,
    getHtmlBody: (id: string) => `${BASE_URL}/book/htmlbody/${id}`,
    getIsGpt: (id: string) => `${BASE_URL}/book/isgpt/${id}`,
    getMdUsage: (id: string) => `${BASE_URL}/book/mdusage/${id}`,
    getHtmlUsage: (id: string) => `${BASE_URL}/book/htmlusage/${id}`,
    getTemporaryGpt: (id: string) => `${BASE_URL}/book/temporarygpt/${id}`,
    getCoverImage: (coverImageId: string) => `${BASE_URL}/book/cover/${coverImageId}`,
    postCreate: () => `${BASE_URL}/book/create`,
    postGpt: () => `${BASE_URL}/book/gpt`,
    postEpub: () => `${BASE_URL}/book/epub`,
    runGptOfToc: () => `${BASE_URL}/book/gpt/toc`,
    runGptOfMdBody: () => `${BASE_URL}/book/gpt/mdbody`,
    generateImageCoverGpt: () => `${BASE_URL}/book/gpt/cover`,
    generateHtml: () => `${BASE_URL}/book/generate-html`,
    uploadCoverImage: () => `${BASE_URL}/book/cover/upload`,
    updateBook: (id: string) => `${BASE_URL}/book/${id}`,
    deleteBook: (id: string) => `${BASE_URL}/book/${id}`,
};

export const WS_ENDPOINTS = {
    wsGptOfMdBody:  () => `${BASE_WS}/book/gpt/mdbody`,
}

