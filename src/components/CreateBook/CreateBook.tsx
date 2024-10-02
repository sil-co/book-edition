import axios, { AxiosResponse } from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaSpinner } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

import { useState, useEffect } from 'react';

import MarkdownEditor from '../Editor/MarkdownEditor';
import { API_ENDPOINTS } from "../../api/urls";
import * as BT from '../../types/BookTypes';
import { useGlobalState } from '../../context/GlobalStateProvider';

const CreateBook = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    if (!token) {
        navigate("/login?error=unauthorized");
        return;
    }

    let initData: BT.BookDataType = {
        title: "",
        author: "",
        genre: "",
        isPublished: false,
    };

    const [newBook, setNewBook] = useState<BT.BookDataType>(initData);
    const [isMdTocOpen, setIsMdTocOpen] = useState<boolean>(false);
    const [isMdBodyOpen, setIsMdBodyOpen] = useState<boolean>(false);
    const [isHtmlBodyOpen, setIsHtmlBodyOpen] = useState<boolean>(false);
    const [isMdUsageOpen, setIsMdUsageOpen] = useState<boolean>(false);
    const [isHtmlUsageOpen, setIsHtmlUsageOpen] = useState<boolean>(false);
    const [isMdSummaryOpen, setIsMdSummaryOpen] = useState<boolean>(false);
    const [buttonDisabled, setButtonDisabled] = useState(false);
    const { setSuccessMessage, setErrorMessage } = useGlobalState();
    const { t } = useTranslation();

    useEffect(() => {
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            event.preventDefault();
            event.returnValue = 'Are you sure reload?'; // これで警告を表示
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        // Cleanup function: コンポーネントがアンマウントされたときにイベントリスナーを削除
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    // バリデーション
    const requiredCheck = (): BT.RequiredFieldType | '' => {
        const requiredFields: BT.RequiredFieldType[] = ['title', 'author', 'genre'];
        for (const field of requiredFields) {
            if (!newBook[field]) { return field; }
        }
        return '';
    };

    const extractCreateData = (): Partial<BT.BookDataType> => {
        const extractedData: Partial<BT.BookDataType> = {};

        Object.entries(newBook).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '' && !Number.isNaN(value)) {
                extractedData[key as keyof BT.BookDataType] = value;
            }
        });

        return extractedData;
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setButtonDisabled(true);

            const field: BT.RequiredFieldType | '' = requiredCheck();
            if (field !== '') {
                setErrorMessage(`The "${field.charAt(0).toUpperCase() + field.slice(1)}" field is required.`);
                return;
            }

            const extractedData = extractCreateData();

            const confirmMessage = t('createConfirm');
            if (!window.confirm(confirmMessage)) { return; }

            const res: AxiosResponse<BT.BookDataType> = await axios.post<BT.BookDataType>(
                API_ENDPOINTS.postCreate(),
                extractedData,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSuccessMessage(t('createSuccess', {title: res.data.title}));
            await setTime(1000, () => navigate('/books'));
        } catch (e) {
            setErrorMessage(t('createFailed'));
        } finally {
            setButtonDisabled(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setNewBook((prevBook) => ({
            ...prevBook,
            [name]: value,
        }));
    };

    const toggleMdTocEditor = () => {
        if (!isMdTocOpen) {
            setIsMdTocOpen(true);
        } else {
            setIsMdTocOpen(false);
        }
    }

    const toggleMdBodyEditor = async () => {
        if (!isMdBodyOpen) {
            setIsMdBodyOpen(true);
        } else {
            setIsMdBodyOpen(false);
        }
    }

    const toggleHtmlBodyEditor = async () => {
        if (!isHtmlBodyOpen) {
            setIsHtmlBodyOpen(true);
        } else {
            setIsHtmlBodyOpen(false);
        }
    };

    const toggleMdUsageEditor = async () => {
        if (!isMdUsageOpen) {
            setIsMdUsageOpen(true);
        } else {
            setIsMdUsageOpen(false);
        }
    }

    const toggleHtmlUsageEditor = async () => {
        if (!isHtmlUsageOpen) {
            setIsHtmlUsageOpen(true);
        } else {
            setIsHtmlUsageOpen(false);
        }
    }

    const toggleMdSummaryEditor = () => {
        if (!isMdSummaryOpen) {
            setIsMdSummaryOpen(true);
        } else {
            setIsMdSummaryOpen(false);
        }
    }

    const handleContentsChange = (contentType: string, newContent: string) => {
        setNewBook((prev) => ({
            ...prev,
            [contentType]: newContent,
        }));
    };

    const setTime = async (time: number, callback?: () => void): Promise<void> => {
        return new Promise(resolve => {
            setTimeout(() => {
                if (callback) { callback(); }
                resolve();
            }, time)
        })
    }

    return (
        <div className="container flex justify-center w-full mx-auto p-4 mt-12">
            <div className="w-full bg-white shadow-md rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">{t('create')}</h1>
                    <button
                        className="cursor-pointer bg-gray-300 text-gray-800 ml-2 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors text-sm font-medium"
                        onClick={() => navigate('/books')}
                    >
                        {t('back')}
                    </button>
                </div>
                <form onSubmit={handleCreate} className="space-y-4 w-full h-full">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                            {t('title')}
                        </label>
                        <input
                            id="title"
                            name="title"
                            placeholder="Title"
                            onChange={handleInputChange}
                            value={newBook.title}
                            className="w-full p-2 border border-gray-300 rounded"
                        />
                    </div>
                    <div>
                        <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-1">
                            {t('author')}
                        </label>
                        <input
                            id="author"
                            name="author"
                            placeholder="Author"
                            onChange={handleInputChange}
                            value={newBook.author || ''}
                            className="w-full p-2 border border-gray-300 rounded"
                        />
                    </div>
                    <div>
                        <label htmlFor="genre" className="block text-sm font-medium text-gray-700 mb-1">
                            {t('genre')}
                        </label>
                        <input
                            id="genre"
                            name="genre"
                            placeholder="Genre"
                            onChange={handleInputChange}
                            value={newBook.genre || ''}
                            className="w-full p-2 border border-gray-300 rounded"
                        />
                    </div>
                    <div>
                        <label htmlFor="toc" className="block text-sm font-medium text-gray-700 mb-1">
                            {t('toc')}
                        </label>
                        <textarea
                            id="toc"
                            name="toc"
                            placeholder={t('toc')}
                            onChange={handleInputChange}
                            value={newBook.toc || ''}
                            className="hidden"
                        // className="w-full p-2 border border-gray-300 rounded h-24"
                        ></textarea>
                        <button
                            type="button"
                            onClick={toggleMdTocEditor}
                            className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-red-200 via-red-300 to-yellow-200 group-hover:from-red-200 group-hover:via-red-300 group-hover:to-yellow-200 dark:text-white dark:hover:text-gray-900 focus:ring-4 focus:outline-none focus:ring-red-100 dark:focus:ring-red-400"
                        >
                            <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
                                {t('openMDE')}
                            </span>
                        </button>
                    </div>
                    <div>
                        <label htmlFor="htmlBody" className="block text-sm font-medium text-gray-700 mb-1">
                            {t('body')}
                        </label>
                        <textarea
                            id="mdBody"
                            name="mdBody"
                            placeholder="mdBody"
                            onChange={handleInputChange}
                            value={newBook.mdBody || ''}
                            className="hidden"
                        ></textarea>
                        <button
                            type="button"
                            onClick={toggleMdBodyEditor}
                            className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-red-200 via-red-300 to-yellow-200 group-hover:from-red-200 group-hover:via-red-300 group-hover:to-yellow-200 dark:text-white dark:hover:text-gray-900 focus:ring-4 focus:outline-none focus:ring-red-100 dark:focus:ring-red-400"
                        >
                            <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
                                {t('openMDE')}
                            </span>
                        </button>
                        {/* <textarea
                            id="htmlBody"
                            name="htmlBody"
                            placeholder="HtmlBody"
                            onChange={handleInputChange}
                            value={newBook.htmlBody || ''}
                            className="hidden"
                        ></textarea>
                        <button
                            type="button"
                            onClick={toggleHtmlBodyEditor}
                            className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-cyan-500 to-blue-500 group-hover:from-cyan-500 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-cyan-200 dark:focus:ring-cyan-800"
                        >
                            <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
                                Open Html Editor
                            </span>
                        </button> */}
                    </div>
                    <div>
                        <label htmlFor="htmlUsage" className="block text-sm font-medium text-gray-700 mb-1">
                            {t('usage')}
                        </label>
                        <textarea
                            id="mdUsage"
                            name="mdUsage"
                            placeholder="mdUsage"
                            onChange={handleInputChange}
                            value={newBook.mdUsage || ''}
                            className="hidden"
                        ></textarea>
                        <button
                            type="button"
                            onClick={toggleMdUsageEditor}
                            className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-red-200 via-red-300 to-yellow-200 group-hover:from-red-200 group-hover:via-red-300 group-hover:to-yellow-200 dark:text-white dark:hover:text-gray-900 focus:ring-4 focus:outline-none focus:ring-red-100 dark:focus:ring-red-400"
                        >
                            <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
                                {t('openMDE')}
                            </span>
                        </button>
                        {/* <textarea
                            id="htmlUsage"
                            name="htmlUsage"
                            placeholder="htmlUsage"
                            onChange={handleInputChange}
                            value={newBook.htmlUsage || ''}
                            className="hidden"
                        ></textarea>
                        <button
                            type="button"
                            onClick={toggleHtmlUsageEditor}
                            className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-cyan-500 to-blue-500 group-hover:from-cyan-500 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-cyan-200 dark:focus:ring-cyan-800"
                        >
                            <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
                                Open Html Editor
                            </span>
                        </button> */}
                    </div>
                    <div>
                        {/* <label htmlFor="coverImageId" className="block text-sm font-medium text-gray-700 mb-1">
                            Cover
                        </label>
                        <input
                            id="coverImageId"
                            name="coverImageId"
                            placeholder="Cover"
                            onChange={handleInputChange}
                            value={newBook.coverImageId || ''}
                            className="w-full p-2 border border-gray-300 rounded"
                        /> */}
                    </div>
                    <div>
                        <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
                            {t('language')}
                        </label>
                        <input
                            id="language"
                            name="language"
                            placeholder={t('language')}
                            onChange={handleInputChange}
                            value={newBook.language || ''}
                            className="w-full p-2 border border-gray-300 rounded"
                        />
                    </div>
                    <div>
                        <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-1">
                            {t('summary')}
                        </label>
                        <textarea
                            id="summary"
                            name="summary"
                            placeholder={t('summary')}
                            onChange={handleInputChange}
                            value={newBook.summary || ''}
                            className="hidden"
                        ></textarea>
                        <button
                            type="button"
                            onClick={toggleMdSummaryEditor}
                            className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-red-200 via-red-300 to-yellow-200 group-hover:from-red-200 group-hover:via-red-300 group-hover:to-yellow-200 dark:text-white dark:hover:text-gray-900 focus:ring-4 focus:outline-none focus:ring-red-100 dark:focus:ring-red-400"
                        >
                            <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
                                {t('openMDE')}
                            </span>
                        </button>
                    </div>
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            name="isPublished"
                            className="mr-2"
                            checked={newBook.isPublished || false}
                            onChange={(e) => setNewBook((prev) => ({
                                ...prev,
                                isPublished: e.target.checked,
                            }))}
                        />
                        <label>{t('published')}</label>
                    </div>
                    <div>
                        <label htmlFor="kindle" className="block text-sm font-medium text-gray-700 mb-1">
                            Kindle URL
                        </label>
                        <input
                            id="kindle"
                            name="kindle"
                            placeholder="Kindle URL"
                            onChange={handleInputChange}
                            value={newBook.kindle || ''}
                            className="w-full p-2 border border-gray-300 rounded"
                        />
                    </div>
                    <button
                        type="submit"
                        className={`text-white bg-gradient-to-r from-cyan-500 to-blue-500 
                             focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 
                            font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 min-w-[90px]
                            ${buttonDisabled ? '' : 'hover:bg-gradient-to-bl'}
                        `}
                        disabled={buttonDisabled} // 送信中なら無効化
                    >
                        {buttonDisabled ? (
                            <FaSpinner className="animate-spin inline-block" />
                        ) : (
                            t('create')
                        )}
                    </button>
                </form>
            </div>

            {isMdTocOpen && (
                <MarkdownEditor
                    bookData={newBook}
                    handleContentsChange={(contentType: string, newContent: string) => handleContentsChange(contentType, newContent)}
                    contentType={"toc"}
                    isOpen={isMdTocOpen}
                    editorTitle={"Markdown Editor" + ` - ${t('toc')}`}
                    onClose={toggleMdTocEditor}
                />
            )}

            {isMdBodyOpen && (
                <MarkdownEditor
                    bookData={newBook}
                    handleContentsChange={(contentType: string, newContent: string) => handleContentsChange(contentType, newContent)}
                    contentType={"mdBody"}
                    isOpen={isMdBodyOpen}
                    editorTitle={"Markdown Editor" + ` - ${t('body')}`}
                    onClose={toggleMdBodyEditor}
                />
            )}

            {/* {isHtmlBodyOpen && (
                <HtmlEditor
                    bookData={newBook}
                    handleContentsChange={(contentType: string, newContent: string) => handleContentsChange(contentType, newContent)}
                    contentType={"htmlBody"}
                    isOpen={isHtmlBodyOpen}
                    editorTitle={"HTML Editor" + ` - ${t('body')}`}
                    onClose={toggleHtmlBodyEditor}
                />
            )} */}

            {isMdUsageOpen && (
                <MarkdownEditor
                    bookData={newBook}
                    handleContentsChange={(contentType: string, newContent: string) => handleContentsChange(contentType, newContent)}
                    contentType={"mdUsage"}
                    isOpen={isMdUsageOpen}
                    editorTitle={"Markdown Editor" + ` - ${t('usage')}`}
                    onClose={toggleMdUsageEditor}
                />
            )}

            {/* {isHtmlUsageOpen && (
                <HtmlEditor
                    bookData={newBook}
                    handleContentsChange={(contentType: string, newContent: string) => handleContentsChange(contentType, newContent)}
                    contentType={"htmlUsage"}
                    isOpen={isHtmlUsageOpen}
                    editorTitle={"HTML Editor" + ` - ${t('usage')}`}
                    onClose={toggleHtmlUsageEditor}
                />
            )} */}

            {isMdSummaryOpen && (
                <MarkdownEditor
                    bookData={newBook}
                    handleContentsChange={(contentType: string, newContent: string) => handleContentsChange(contentType, newContent)}
                    contentType={"summary"}
                    isOpen={isMdSummaryOpen}
                    editorTitle={"Markdown Editor" + ` - ${t('summary')}`}
                    onClose={toggleMdSummaryEditor}
                />
            )}
        </div>
    );
};

export default CreateBook;
