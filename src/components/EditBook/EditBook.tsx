import axios, { AxiosResponse } from 'axios';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { FaSpinner } from 'react-icons/fa';
import { useState, useEffect } from 'react';

import HtmlEditor from '../Editor/HtmlEditor';
import MarkdownEditor from '../Editor/MarkdownEditor';
import { API_ENDPOINTS } from "../../api/urls";
import * as T1 from '../../types/BookTypes';

const EditBook = () => {
    const id = Number(useParams().id); // URLからidを取得
    let initData: T1.BookDataType = {
        id: id,
        title: "", // 初期値を空文字に設定
        author: "",
        genre: "",
        isPublished: false,
    };

    const [editBookData, setEditBookData] = useState<T1.BookDataType>(initData);
    const [unEditedData, setUnEditedData] = useState<T1.BookDataType>(initData);

    const [isMdTocOpen, setIsMdTocOpen] = useState<boolean>(false);
    const [isMdBodyOpen, setIsMdBodyOpen] = useState<boolean>(false);
    const [isHtmlBodyOpen, setIsHtmlBodyOpen] = useState<boolean>(false);
    const [isMdUsageOpen, setIsMdUsageOpen] = useState<boolean>(false);
    const [isHtmlUsageOpen, setIsHtmlUsageOpen] = useState<boolean>(false);
    const [isMdSummaryOpen, setIsMdSummaryOpen] = useState<boolean>(false);

    const [buttonDisabled, setButtonDisabled] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [warningMessage, setWarningMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const navigate = useNavigate(); // useNavigateフックを使う

    useEffect(() => {
        // console.log({ editBookData, unEditedData });
    }, [unEditedData]);

    useEffect(() => {
        const getBookData = async () => {
            try {
                setLoading(true);
                const [_, res]: [void, AxiosResponse<T1.BookDataType>] = await Promise.all([
                    setTime(500),
                    axios.get<T1.BookDataType>(API_ENDPOINTS.getBook(id))
                ]);
                const data: T1.BookDataType = res.data;
                setEditBookData(data);
                setUnEditedData(data);
            } catch (error) {
                console.error("Failed to get bookData", error);
                setErrorMessage(`Failed to get bookData.`);
                setSuccessMessage(null);
            } finally {
                setLoading(false);
            }
        };

        getBookData();
    }, [id]); // idが変わったらデータを再取得

    // 一定時間後にメッセージを消すためのuseEffect
    useEffect(() => {
        if (successMessage || errorMessage || warningMessage) {
            const timer = setTimeout(() => {
                setSuccessMessage(null);
                setErrorMessage(null);
                setWarningMessage(null);
            }, 4000);

            return () => clearTimeout(timer); // クリーンアップ
        }
    }, [successMessage, errorMessage, warningMessage]);

    const requiredCheck = (): T1.RequiredFieldType | '' => {
        const requiredFields: T1.RequiredFieldType[] = ['id', 'title', 'author', 'genre'];

        for (const field of requiredFields) {
            if (!editBookData[field]) { return field; }
        }
        return '';
    };

    const textToDisplay = (name: string): string => {
        switch (name) {
            case 'id':
                return 'ID';
            case 'title':
                return 'Title';
            case 'author':
                return 'Author';
            case 'genre':
                return 'Genre';
            case 'toc':
                return 'Table_Of_Contents';
            case 'htmlBody':
                return 'Body(Html)';
            case 'mdBody':
                return 'Body(Markdown)';
            case 'htmlUsage':
                return 'Usage(Html)';
            case 'mdUsage':
                return 'Usage(Markdown)';
            case 'cover':
                return 'Cover';
            case 'language':
                return 'Language';
            case 'summary':
                return 'Summary';
            case 'kindle':
                return 'URL(Kindle)';
            case 'isPublished':
                return 'Published';
            case 'publishedAt':
                return 'Published_At';
            default:
                return '';
        }
    }

    // 変更があったか確認
    const extractEditedData = (): Partial<T1.BookDataType> => {
        const extractedData = { ...editBookData };

        // オリジナルと同じ値のプロパティを削除
        Object.keys(unEditedData).forEach((key) => {
            if (key === "id") { return; }
            if (unEditedData[key as keyof T1.BookDataType] === editBookData[key as keyof T1.BookDataType]) {
                delete extractedData[key as keyof T1.BookDataType];
            }
        });

        return extractedData;
    };

    const handleBack = () => {
        // 編集した箇所のみのプロパティを抽出
        const extractedData: Partial<T1.BookDataType> = extractEditedData();

        // propertyがidのみの場合
        const keys = Object.keys(extractedData).filter(key => key !== 'id');
        const keysToDisplay: string[] = keys.map(key => textToDisplay(key));
        if (keys.length > 0) {
            const confirmMessage = `Back to without saving? \n Update field: \n ${keysToDisplay.join(', ')}`;
            if (!window.confirm(confirmMessage)) {
                return; // ユーザーがキャンセルした場合は何もしない
            }
        }

        navigate(-1);
    }

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setButtonDisabled(true);

            // フォームバリデーション
            const field: T1.RequiredFieldType | '' = requiredCheck();
            if (field !== '') {
                setErrorMessage(`The "${field.charAt(0).toUpperCase() + field.slice(1)}" field is required.`);
                return;
            }

            // 編集した箇所のみのプロパティを抽出
            const extractedData: Partial<T1.BookDataType> = extractEditedData();

            // 編集していても空の場合は更新しない 
            if (!extractedData.htmlBody) { delete extractedData.htmlBody; }
            if (!extractedData.mdBody) { delete extractedData.mdBody }
            if (!extractedData.htmlUsage) { delete extractedData.htmlUsage; }
            if (!extractedData.mdUsage) { delete extractedData.mdUsage; }
            if (!extractedData.publishedAt) { delete extractedData.publishedAt; }

            // propertyがidのみの場合
            const keys = Object.keys(extractedData).filter(key => key !== 'id');
            const keysToDisplay: string[] = keys.map(key => textToDisplay(key));
            if (keys.length === 0) {
                setWarningMessage("WARNING: Not Edited");
                return;
            }

            const confirmMessage = `Are you sure update? \n Update fields: \n ${keysToDisplay.join(', ')}`;
            if (!window.confirm(confirmMessage)) {
                return; // ユーザーがキャンセルした場合は何もしない
            }

            const res: AxiosResponse<T1.BookDataType> = await axios.put<T1.BookDataType>(API_ENDPOINTS.updateBook(id), extractedData)
            const fieldsMessage = keys.length > 0 ? `Updated Fields: ${keys.join(', ')}` : '';
            setSuccessMessage(`${res.data.title} Updated Successfully! <br /> ${fieldsMessage}`);
            await new Promise(() => setTimeout(() => navigate('/'), 500));
        } catch (e) {
            setErrorMessage("Failed to Update");
        } finally {
            setButtonDisabled(false);
        }
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
            try {
                if (!editBookData.mdBody) {
                    setLoading(true);
                    const [_, res]: [void, AxiosResponse<T1.MdBodyType>] = await Promise.all([
                        setTime(500),
                        axios.get<T1.MdBodyType>(API_ENDPOINTS.getMdBody(id)),
                    ]);
                    const data = res.data;
                    setEditBookData((prev) => ({
                        ...prev,
                        mdBody: data.mdBody
                    }));
                    setUnEditedData(prev => ({
                        ...prev,
                        mdBody: data.mdBody
                    }));
                }
                setIsMdBodyOpen(true);
            } catch (error) {
                console.error('Failed to fetch HTMLBody content', error);
            } finally {
                setLoading(false);
            }
        } else {
            setIsMdBodyOpen(false);
            setLoading(false);
        }
    }

    const toggleHtmlBodyEditor = async () => {
        if (!isHtmlBodyOpen) {
            try {
                if (!editBookData.htmlBody) {
                    setLoading(true);
                    const [_, res]: [void, AxiosResponse<T1.HtmlBodyType>] = await Promise.all([
                        setTime(500),
                        axios.get<T1.HtmlBodyType>(API_ENDPOINTS.getHtmlBody(id)),
                    ]);
                    const data = res.data;
                    setEditBookData((prev) => ({
                        ...prev,
                        htmlBody: data.htmlBody
                    }));
                    setUnEditedData(prev => ({
                        ...prev,
                        htmlBody: data.htmlBody
                    }));
                }
                setIsHtmlBodyOpen(true);
            } catch (error) {
                console.error('Failed to fetch HTMLBody content', error);
            } finally {
                setLoading(false);
            }
        } else {
            setIsHtmlBodyOpen(false);
            setLoading(false);
        }
    };

    const toggleMdUsageEditor = async () => {
        if (!isMdUsageOpen) {
            try {
                if (!editBookData.mdUsage) {
                    setLoading(true);
                    const [_, res]: [void, AxiosResponse<T1.MdUsageType>] = await Promise.all([
                        setTime(500),
                        axios.get<T1.MdUsageType>(API_ENDPOINTS.getMdUsage(id)),
                    ]);
                    const data = res.data;
                    setEditBookData((prev) => ({
                        ...prev,
                        mdUsage: data.mdUsage
                    }));
                    setUnEditedData(prev => ({
                        ...prev,
                        mdUsage: data.mdUsage
                    }));
                }
                setIsMdUsageOpen(true);
            } catch (error) {
                console.error('Failed to fetch Markdown Usage content', error);
            } finally {
                setLoading(false);
            }
        } else {
            setIsMdUsageOpen(false);
            setLoading(false);
        }
    }

    const toggleHtmlUsageEditor = async () => {
        if (!isHtmlUsageOpen) {
            try {
                if (!editBookData.htmlUsage) {
                    setLoading(true);
                    const [_, res]: [void, AxiosResponse<T1.HtmlUsageType>] = await Promise.all([
                        setTime(500),
                        axios.get<T1.HtmlUsageType>(API_ENDPOINTS.getHtmlUsage(id)),
                    ]);
                    const data = res.data;
                    setEditBookData((prev) => ({
                        ...prev,
                        htmlUsage: data.htmlUsage
                    }));
                    setUnEditedData(prev => ({
                        ...prev,
                        htmlUsage: data.htmlUsage
                    }));
                }
                setIsHtmlUsageOpen(true);
            } catch (error) {
                console.error('Failed to fetch htmlUsage content', error);
            } finally {
                setLoading(false);
            }
        } else {
            setIsHtmlUsageOpen(false);
            setLoading(false);
        }
    }

    const toggleMdSummaryEditor = () => {
        if (!isMdSummaryOpen) {
            setIsMdSummaryOpen(true);
        } else {
            setIsMdSummaryOpen(false);
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEditBookData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleContentsChange = (contentType: string, newContent: string) => {
        setEditBookData((prev) => ({
            ...prev,
            [contentType]: newContent,
        }));
    };

    const setTime = async (time: number): Promise<void> => {
        return new Promise(resolve => {
            setTimeout(() => { resolve(); }, time)
        })
    }

    return (
        <div className="container flex justify-center w-full mx-auto p-4">
            <div className="w-full bg-white shadow-md rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">Edit</h1>
                    <button
                        className="cursor-pointer bg-gray-300 text-gray-800 ml-2 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors text-sm font-medium"
                        onClick={handleBack}
                    >
                        Back
                    </button>
                </div>
                <form onSubmit={handleUpdate} className="space-y-4 w-full h-full">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                            Title
                        </label>
                        <input
                            id="title"
                            name="title"
                            placeholder="Title"
                            onChange={handleInputChange}
                            value={editBookData.title}
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
                            value={editBookData.author || ''}
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
                            value={editBookData.genre || ''}
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
                            value={editBookData.toc || ''}
                            className="hidden"
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
                            value={editBookData.mdBody || ''}
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
                            value={editBookData.htmlBody || ''}
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
                            value={editBookData.mdUsage || ''}
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
                            value={editBookData.htmlUsage || ''}
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
                        <label htmlFor="cover" className="block text-sm font-medium text-gray-700 mb-1">
                            Cover
                        </label>
                        <input
                            id="cover"
                            name="cover"
                            placeholder="Cover"
                            onChange={handleInputChange}
                            value={editBookData.cover || ''}
                            className="w-full p-2 border border-gray-300 rounded"
                        />
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
                            value={editBookData.language || ''}
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
                            value={editBookData.summary || ''}
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
                            checked={editBookData.isPublished || false}
                            onChange={(e) => setEditBookData((prev) => ({
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
                            value={editBookData.kindle || ''}
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
                            'Update'
                        )}
                    </button>
                </form>
            </div>

            {/* <div
                className={`fixed top-0 right-0 h-full w-full bg-gray-900 bg-opacity-50 z-50 transition-opacity duration-300 
                    ${isHtmlBodyOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`
                }
                onClick={toggleHtmlBodyEditor}
            /> */}

            <MarkdownEditor
                content={editBookData.toc || ''}
                handleContentsChange={(contentType: string, newContent: string) => handleContentsChange(contentType, newContent)}
                contentType={"toc"}
                isOpen={isMdTocOpen}
                editorTitle={"Markdown TOC Editor"}
                onClose={toggleMdTocEditor}
            />

            <MarkdownEditor
                content={editBookData.mdBody || ''}
                handleContentsChange={(contentType: string, newContent: string) => handleContentsChange(contentType, newContent)}
                contentType={"mdBody"}
                isOpen={isMdBodyOpen}
                editorTitle={"Markdown Body Editor"}
                onClose={toggleMdBodyEditor}
            />

            <HtmlEditor
                content={editBookData.htmlBody || ''}
                handleContentsChange={(contentType: string, newContent: string) => handleContentsChange(contentType, newContent)}
                contentType={"htmlBody"}
                isOpen={isHtmlBodyOpen}
                editorTitle={"Html Body Editor"}
                onClose={toggleHtmlBodyEditor}
            />

            <MarkdownEditor
                content={editBookData.mdUsage || ''}
                handleContentsChange={(contentType: string, newContent: string) => handleContentsChange(contentType, newContent)}
                contentType={"mdUsage"}
                isOpen={isMdUsageOpen}
                editorTitle={"Markdown Usage Editor"}
                onClose={toggleMdUsageEditor}
            />

            <HtmlEditor
                content={editBookData.htmlUsage || ''}
                handleContentsChange={(contentType: string, newContent: string) => handleContentsChange(contentType, newContent)}
                contentType={"htmlUsage"}
                isOpen={isHtmlUsageOpen}
                editorTitle={"Html Usage Editor"}
                onClose={toggleHtmlUsageEditor}
            />

            <MarkdownEditor
                content={editBookData.summary || ''}
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
                        <div className="text-white text-2xl">Loading...</div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default EditBook;
