import axios, { AxiosResponse } from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaSpinner } from 'react-icons/fa';

import { useState, useEffect } from 'react';

import HtmlEditor from '../Editor/HtmlEditor';
import MarkdownEditor from '../Editor/MarkdownEditor';
import { API_ENDPOINTS } from "../../api/urls";
import * as BT from '../../types/BookTypes';

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

    const [loading, setLoading] = useState<string>('');
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [warningMessage, setWarningMessage] = useState<string | null>(null);
    const [buttonDisabled, setButtonDisabled] = useState(false);

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

    useEffect(() => {
        if (successMessage || errorMessage || warningMessage) {
            const timer = setTimeout(() => {
                setSuccessMessage(null);
                setErrorMessage(null);
                setWarningMessage(null);
            }, 3000); // 3秒後にメッセージを消す

            return () => clearTimeout(timer); // クリーンアップ
        }
    }, [successMessage, errorMessage, warningMessage]);

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

            const confirmMessage = `Are you sure create?`;
            if (!window.confirm(confirmMessage)) { return; }

            const res: AxiosResponse<BT.BookDataType> = await axios.post<BT.BookDataType>(
                API_ENDPOINTS.postCreate(),
                extractedData,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSuccessMessage('Book created successfully!');
            await setTime(1000, () => navigate('/books'));
        } catch (e) {
            setErrorMessage("Failed to Update");
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
                    <h1 className="text-2xl font-bold">Create</h1>
                    <button
                        className="cursor-pointer bg-gray-300 text-gray-800 ml-2 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors text-sm font-medium"
                        onClick={() => navigate('/books')}
                    >
                        Back
                    </button>
                </div>
                <form onSubmit={handleCreate} className="space-y-4 w-full h-full">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                            Title
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
                            Author
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
                            Genre
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
                            Table Of Contents
                        </label>
                        <textarea
                            id="toc"
                            name="toc"
                            placeholder="Table of Contents"
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
                                Open Markdown Editor
                            </span>
                        </button>
                    </div>
                    <div>
                        <label htmlFor="htmlBody" className="block text-sm font-medium text-gray-700 mb-1">
                            Body
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
                                Open Markdown Editor
                            </span>
                        </button>
                        <textarea
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
                        </button>
                    </div>
                    <div>
                        <label htmlFor="htmlUsage" className="block text-sm font-medium text-gray-700 mb-1">
                            Usage
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
                                Open Markdown Editor
                            </span>
                        </button>
                        <textarea
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
                        </button>
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
                            Language
                        </label>
                        <input
                            id="language"
                            name="language"
                            placeholder="Language"
                            onChange={handleInputChange}
                            value={newBook.language || ''}
                            className="w-full p-2 border border-gray-300 rounded"
                        />
                    </div>
                    <div>
                        <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-1">
                            Summary
                        </label>
                        <textarea
                            id="summary"
                            name="summary"
                            placeholder="Summary"
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
                                Open Markdown Editor
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
                        <label>Published</label>
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
                            'Create'
                        )}
                    </button>
                </form>
            </div>

            <MarkdownEditor
                bookData={newBook}
                handleContentsChange={(contentType: string, newContent: string) => handleContentsChange(contentType, newContent)}
                contentType={"toc"}
                isOpen={isMdTocOpen}
                editorTitle={"Markdown Table Of Contents Editor"}
                onClose={toggleMdTocEditor}
            />

            <MarkdownEditor
                bookData={newBook}
                handleContentsChange={(contentType: string, newContent: string) => handleContentsChange(contentType, newContent)}
                contentType={"mdBody"}
                isOpen={isMdBodyOpen}
                editorTitle={"Markdown Body Editor"}
                onClose={toggleMdBodyEditor}
            />

            <HtmlEditor
                bookData={newBook}
                handleContentsChange={(contentType: string, newContent: string) => handleContentsChange(contentType, newContent)}
                contentType={"htmlBody"}
                isOpen={isHtmlBodyOpen}
                editorTitle={"Html Body Editor"}
                onClose={toggleHtmlBodyEditor}
            />

            <MarkdownEditor
                bookData={newBook}
                handleContentsChange={(contentType: string, newContent: string) => handleContentsChange(contentType, newContent)}
                contentType={"mdUsage"}
                isOpen={isMdUsageOpen}
                editorTitle={"Markdown Usage Editor"}
                onClose={toggleMdUsageEditor}
            />

            <HtmlEditor
                bookData={newBook}
                handleContentsChange={(contentType: string, newContent: string) => handleContentsChange(contentType, newContent)}
                contentType={"htmlUsage"}
                isOpen={isHtmlUsageOpen}
                editorTitle={"Html Usage Editor"}
                onClose={toggleHtmlUsageEditor}
            />

            <MarkdownEditor
                bookData={newBook}
                handleContentsChange={(contentType: string, newContent: string) => handleContentsChange(contentType, newContent)}
                contentType={"summary"}
                isOpen={isMdSummaryOpen}
                editorTitle={"Markdown Summary Editor"}
                onClose={toggleMdSummaryEditor}
            />

            {successMessage && (
                <div className="fixed top-4 inset-x-0 flex justify-center items-center">
                    <div className="bg-green-500 text-white px-4 py-2 rounded shadow-lg w-1/3 text-center">
                        <p
                            dangerouslySetInnerHTML={{ __html: successMessage }}
                        />
                    </div>
                </div>
            )}

            {warningMessage && (
                <div className="fixed top-4 inset-x-0 flex justify-center items-center">
                    <div className="bg-yellow-500 text-white px-4 py-2 rounded shadow-lg w-1/3 text-center">
                        <p>{warningMessage}</p>
                    </div>
                </div>
            )}

            {errorMessage && (
                <div className="fixed top-4 inset-x-0 flex justify-center items-center">
                    <div className="bg-red-500 text-white px-4 py-2 rounded shadow-lg w-1/3 text-center">
                        <p>{errorMessage}</p>
                    </div>
                </div>
            )}

            {loading && (
                <div className="fixed inset-0 bg-gray-800 bg-opacity-60 flex items-center justify-center z-50 w-full h-full">
                    <div className="flex flex-col items-center">
                        <svg
                            className="animate-spin h-12 w-12 text-white mb-4"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            ></circle>
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v8h8a8 8 0 11-8 8V12H4z"
                            ></path>
                        </svg>
                        <div className="text-white text-2xl">{loading}</div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreateBook;
