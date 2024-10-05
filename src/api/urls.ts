export const BASE_URL = "http://localhost:5000";
export const BASE_WS = "ws://localhost:5000";
export const BASE_IMAGE_URL = "http://localhost:5000";
export const BASE_SAMPLE_URL = "http://localhost:5000/resources/sample/no_image.jpg";

export const API_ENDPOINTS = {
    postUserAuth: () => `${BASE_URL}/api/users/auth`,
    postRegister: () => `${BASE_URL}/api/users/register`,
    postLogin: () => `${BASE_URL}/api/users/login`,
    getBooks: () => `${BASE_URL}/api/books`,
    // getBooksInit: () => `${BASE_URL}/api/books/init`,
    getBookAll: (id: string) => `${BASE_URL}/api/book/all/${id}`,
    getBook: (id: string) => `${BASE_URL}/api/book/${id}`,
    getMdBody: (id: string) => `${BASE_URL}/api/book/mdbody/${id}`,
    getHtmlBody: (id: string) => `${BASE_URL}/api/book/htmlbody/${id}`,
    getIsGpt: (id: string) => `${BASE_URL}/api/book/isgpt/${id}`,
    getMdUsage: (id: string) => `${BASE_URL}/api/book/mdusage/${id}`,
    getHtmlUsage: (id: string) => `${BASE_URL}/api/book/htmlusage/${id}`,
    getTemporaryGpt: (id: string) => `${BASE_URL}/api/book/temporarygpt/${id}`,
    getCoverImage: (coverImageId: string) => `${BASE_URL}/api/book/cover/${coverImageId}`,
    postCreate: () => `${BASE_URL}/api/book/create`,
    postGpt: () => `${BASE_URL}/api/book/gpt`,
    postEpub: () => `${BASE_URL}/api/book/epub`,
    postExtract: () => `${BASE_URL}/api/book/extract`,
    runGptOfToc: () => `${BASE_URL}/api/book/gpt/toc`,
    runGptOfIntroduction: () => `${BASE_URL}/api/book/gpt/introduction`,
    runGptOfAfterend: () => `${BASE_URL}/api/book/gpt/afterend`,
    runGptOfMdBody: () => `${BASE_URL}/api/book/gpt/mdbody`,
    generateImageCoverGpt: () => `${BASE_URL}/api/book/gpt/cover`,
    generateHtml: () => `${BASE_URL}/api/book/generate-html`,
    uploadImage: () => `${BASE_URL}/api/book/image/upload`,
    uploadCoverImage: () => `${BASE_URL}/api/book/cover/upload`,
    updateBook: (id: string) => `${BASE_URL}/api/book/${id}`,
    deleteBook: (id: string) => `${BASE_URL}/api/book/${id}`,
};

export const WS_ENDPOINTS = {
    wsGptOfMdBody:  () => `${BASE_WS}/book/gpt/mdbody`,
}

