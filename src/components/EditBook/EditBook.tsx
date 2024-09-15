import axios, { AxiosResponse } from 'axios';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { FaSpinner } from 'react-icons/fa';
import { useState, useEffect } from 'react';

import HtmlEditor from '../Editor/HtmlEditor';
import MarkdownEditor from '../Editor/MarkdownEditor';
import { API_ENDPOINTS } from "../../api/urls";
import { checkIsGpt } from '../../api/gpt';
import * as BT from '../../types/BookTypes';

const EditBook = () => {
    const id = Number(useParams().id); // URLからidを取得
    let initData: BT.BookDataType = {
        id: id,
        title: "", // 初期値を空文字に設定
        author: "",
        genre: "",
        isPublished: false,
    };

    const [editBookData, setEditBookData] = useState<BT.BookDataType>(initData);
    const [unEditedData, setUnEditedData] = useState<BT.BookDataType>(initData);

    const [isMdTocOpen, setIsMdTocOpen] = useState<boolean>(false);
    const [isMdBodyOpen, setIsMdBodyOpen] = useState<boolean>(false);
    const [isHtmlBodyOpen, setIsHtmlBodyOpen] = useState<boolean>(false);
    const [isMdUsageOpen, setIsMdUsageOpen] = useState<boolean>(false);
    const [isHtmlUsageOpen, setIsHtmlUsageOpen] = useState<boolean>(false);
    const [isMdSummaryOpen, setIsMdSummaryOpen] = useState<boolean>(false);

    const [isDisabled, setIsDisabled] = useState<boolean>(false);
    const [loading, setLoading] = useState<string>('');
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
                setLoading('Loading...');
                const isGpt: Boolean = await checkIsGpt(id);
                if (isGpt) {
                    setWarningMessage('Cannot display because GPT is still running.');
                    await setTime(2000, () => navigate('/'));
                    return;
                }
                // const [_, res]: [void, AxiosResponse<BT.BookDataType>] = await Promise.all([
                //     setTime(200),
                //     axios.get<BT.BookDataType>(API_ENDPOINTS.getBook(id))
                // ]);
                const res: AxiosResponse<BT.BookDataType> = await axios.get<BT.BookDataType>(API_ENDPOINTS.getBook(id))
                const data: BT.BookDataType = res.data;
                setEditBookData(data);
                setUnEditedData(data);
                
            } catch (error) {
                console.error("Failed to get bookData", error);
                setErrorMessage(`Failed to get bookData.`);
                setSuccessMessage(null);
            } finally {
                setLoading('');
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
            }, 5000);

            return () => clearTimeout(timer); // クリーンアップ
        }
    }, [successMessage, errorMessage, warningMessage]);

    const requiredCheck = (): BT.RequiredFieldType | '' => {
        const requiredFields: BT.RequiredFieldType[] = ['id', 'title', 'author', 'genre'];

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
    const extractEditedData = (): Partial<BT.BookDataType> => {
        const extractedData = { ...editBookData };

        // オリジナルと同じ値のプロパティを削除
        Object.keys(unEditedData).forEach((key) => {
            if (key === "id") { return; }
            if (unEditedData[key as keyof BT.BookDataType] === editBookData[key as keyof BT.BookDataType]) {
                delete extractedData[key as keyof BT.BookDataType];
            }
        });

        return extractedData;
    };

    const handleBack = () => {
        // 編集した箇所のみのプロパティを抽出
        const extractedData: Partial<BT.BookDataType> = extractEditedData();

        // propertyがidのみの場合
        const keys = Object.keys(extractedData).filter(key => key !== 'id');
        const keysToDisplay: string[] = keys.map(key => textToDisplay(key));
        if (keys.length > 0) {
            const confirmMessage = `Back to without saving? \n Update field: \n ${keysToDisplay.join(', ')}`;
            if (!window.confirm(confirmMessage)) {
                return; // ユーザーがキャンセルした場合は何もしない
            }
        }

        navigate('/');
    }

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsDisabled(true);
            await setTime(300);

            // フォームバリデーション
            const field: BT.RequiredFieldType | '' = requiredCheck();
            if (field !== '') {
                setErrorMessage(`The "${field.charAt(0).toUpperCase() + field.slice(1)}" field is required.`);
                return;
            }

            // 編集した箇所のみのプロパティを抽出
            const extractedData: Partial<BT.BookDataType> = extractEditedData();

            // 編集していても空の場合は更新しない 
            // if (!extractedData.htmlBody) { delete extractedData.htmlBody; }
            // if (!extractedData.mdBody) { delete extractedData.mdBody; }
            // if (!extractedData.htmlUsage) { delete extractedData.htmlUsage; }
            // if (!extractedData.mdUsage) { delete extractedData.mdUsage; }
            // if (!extractedData.publishedAt) { delete extractedData.publishedAt; }

            // propertyがidのみの場合
            const keys = Object.keys(extractedData).filter(key => key !== 'id');
            const keysToDisplay: string[] = keys.map(key => textToDisplay(key));
            if (keys.length === 0) {
                setWarningMessage("WARNING: Not Edited");
                return;
            }

            const confirmMessage = `Are you sure update? \n Update fields: \n ${keysToDisplay.join(', ')}`;
            if (!window.confirm(confirmMessage)) { return; }

            const isGpt: Boolean = await checkIsGpt(id);
            if (isGpt) {
                setWarningMessage('Cannot update because GPT is still running.');
                return;
            }

            const res: AxiosResponse<BT.BookDataType> = await axios.put<BT.BookDataType>(API_ENDPOINTS.updateBook(id), extractedData);
            setSuccessMessage(`${res.data.title} Updated Successfully! `);
            // await new Promise(() => setTimeout(() => navigate('/'), 200));
            keys.forEach((key) => {
                if (key === 'id') { return; }
                setUnEditedData((prev) => ({
                    ...prev,
                    [key]: res.data[key as keyof BT.BookDataType]
                }));
            });
        } catch (e) {
            setErrorMessage("Failed to Update");
        } finally {
            setIsDisabled(false);
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
                if (!editBookData.mdBody && editBookData.mdBody !== '') {
                    setLoading('Loading...');
                    const [_, res]: [void, AxiosResponse<BT.MdBodyType>] = await Promise.all([
                        setTime(200),
                        axios.get<BT.MdBodyType>(API_ENDPOINTS.getMdBody(id)),
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
                console.error('Failed to fetch Markdown Body content.', error);
                setErrorMessage(`Failed to fetch Markdown Body content.`);
            } finally {
                setLoading('');
            }
        } else {
            setIsMdBodyOpen(false);
            setLoading('');
        }
    }

    const toggleHtmlBodyEditor = async () => {
        if (!isHtmlBodyOpen) {
            try {
                if (!editBookData.htmlBody && editBookData.htmlBody !== '') {
                    setLoading('Loading...');
                    const [_, res]: [void, AxiosResponse<BT.HtmlBodyType>] = await Promise.all([
                        setTime(200),
                        axios.get<BT.HtmlBodyType>(API_ENDPOINTS.getHtmlBody(id)),
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
                console.error('Failed to fetch HTML Body content', error);
                setErrorMessage(`Failed to fetch HTML Body content.`);
            } finally {
                setLoading('');
            }
        } else {
            setIsHtmlBodyOpen(false);
            setLoading('');
        }
    };

    const toggleMdUsageEditor = async () => {
        if (!isMdUsageOpen) {
            try {
                if (!editBookData.mdUsage && editBookData.mdUsage !== '') {
                    setLoading('Loading...');
                    const [_, res]: [void, AxiosResponse<BT.MdUsageType>] = await Promise.all([
                        setTime(200),
                        axios.get<BT.MdUsageType>(API_ENDPOINTS.getMdUsage(id)),
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
                setErrorMessage(`Failed to fetch Markdown Usage content.`);
            } finally {
                setLoading('');
            }
        } else {
            setIsMdUsageOpen(false);
            setLoading('');
        }
    }

    const toggleHtmlUsageEditor = async () => {
        if (!isHtmlUsageOpen) {
            try {
                if (!editBookData.htmlUsage && editBookData.htmlUsage !== '') {
                    setLoading('Loading...');
                    const [_, res]: [void, AxiosResponse<BT.HtmlUsageType>] = await Promise.all([
                        setTime(200),
                        axios.get<BT.HtmlUsageType>(API_ENDPOINTS.getHtmlUsage(id)),
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
                console.error('Failed to fetch html Usage content', error);
                setErrorMessage('Failed to fetch html Usage content')
            } finally {
                setLoading('');
            }
        } else {
            setIsHtmlUsageOpen(false);
            setLoading('');
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

    const setTime = async (time: number, callback?: () => void): Promise<void> => {
        return new Promise(resolve => {
            setTimeout(() => {
                callback && callback();
                resolve();
            }, time)
        })
    }

    return (
        <div className="container flex justify-center w-full mx-auto p-4">
            <div className="w-full bg-white shadow-md rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">Edit</h1>
                    <button
                        className="w-16 cursor-pointer bg-gray-300 text-gray-800 ml-2 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors text-sm font-medium"
                        onClick={handleBack}
                        disabled={isDisabled}
                    >
                        {isDisabled ? (
                            <FaSpinner className="animate-spin inline-block" />
                        ) : (
                            'Back'
                        )}
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
                            disabled={isDisabled}
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
                            disabled={isDisabled}
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
                            disabled={isDisabled}
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
                            // className="w-full p-2 border border-gray-300 rounded h-24"
                            disabled={isDisabled}
                        ></textarea>
                        <button
                            type="button"
                            onClick={toggleMdTocEditor}
                            className={`relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-red-200 via-red-300 to-yellow-200 dark:text-white group-hover:from-red-200 group-hover:via-red-300 group-hover:to-yellow-200 dark:hover:text-gray-900
                                focus:ring-4 focus:outline-none focus:ring-red-100 dark:focus:ring-red-400
                                ${isDisabled && "cursor-not-allowed"}
                            `}
                            disabled={isDisabled}
                        >
                            <span className="inline-block w-48 relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
                                {isDisabled ? (
                                    <FaSpinner className="animate-spin inline-block" />
                                ) : (
                                    'Open Markdown Editor'
                                )}
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
                            disabled={isDisabled}
                        ></textarea>
                        <button
                            type="button"
                            onClick={toggleMdBodyEditor}
                            className={`relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-red-200 via-red-300 to-yellow-200 dark:text-white group-hover:from-red-200 group-hover:via-red-300 group-hover:to-yellow-200 dark:hover:text-gray-900
                                focus:ring-4 focus:outline-none focus:ring-red-100 dark:focus:ring-red-400
                                ${isDisabled && "cursor-not-allowed"}
                            `}
                            disabled={isDisabled}
                        >
                            <span className="inline-block w-48 relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
                                {isDisabled ? (
                                    <FaSpinner className="animate-spin inline-block" />
                                ) : (
                                    'Open Markdown Editor'
                                )}
                            </span>
                        </button>
                        <textarea
                            id="htmlBody"
                            name="htmlBody"
                            placeholder="HtmlBody"
                            onChange={handleInputChange}
                            value={editBookData.htmlBody || ''}
                            className="hidden"
                            disabled={isDisabled}
                        ></textarea>
                        <button
                            type="button"
                            onClick={toggleHtmlBodyEditor}
                            className={`relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-cyan-500 to-blue-500 group-hover:from-cyan-500 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-cyan-200 dark:focus:ring-cyan-800
                                ${isDisabled && "cursor-not-allowed"}
                            `}
                            disabled={isDisabled}
                        >
                            <span className="inline-block w-40 relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
                                {isDisabled ? (
                                    <FaSpinner className="animate-spin inline-block" />
                                ) : (
                                    'Open Html Editor'
                                )}
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
                            disabled={isDisabled}
                        ></textarea>
                        <button
                            type="button"
                            onClick={toggleMdUsageEditor}
                            className={`relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-red-200 via-red-300 to-yellow-200 dark:text-white group-hover:from-red-200 group-hover:via-red-300 group-hover:to-yellow-200 dark:hover:text-gray-900
                                focus:ring-4 focus:outline-none focus:ring-red-100 dark:focus:ring-red-400
                                ${isDisabled && "cursor-not-allowed"}
                            `}
                            disabled={isDisabled}
                        >
                            <span className="inline-block w-48 relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
                                {isDisabled ? (
                                    <FaSpinner className="animate-spin inline-block" />
                                ) : (
                                    'Open Markdown Editor'
                                )}
                            </span>
                        </button>
                        <textarea
                            id="htmlUsage"
                            name="htmlUsage"
                            placeholder="htmlUsage"
                            onChange={handleInputChange}
                            value={editBookData.htmlUsage || ''}
                            className="hidden"
                            disabled={isDisabled}
                        ></textarea>
                        <button
                            type="button"
                            onClick={toggleHtmlUsageEditor}
                            className={`relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-cyan-500 to-blue-500 group-hover:from-cyan-500 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-cyan-200 dark:focus:ring-cyan-800
                                ${isDisabled && "cursor-not-allowed"}
                            `}
                            disabled={isDisabled}
                        >
                            <span className="inline-block w-40 relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
                                {isDisabled ? (
                                    <FaSpinner className="animate-spin inline-block" />
                                ) : (
                                    'Open Html Editor'
                                )}
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
                            disabled={isDisabled}
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
                            disabled={isDisabled}
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
                            disabled={isDisabled}
                        ></textarea>
                        <button
                            type="button"
                            onClick={toggleMdSummaryEditor}
                            className={`relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-red-200 via-red-300 to-yellow-200 dark:text-white group-hover:from-red-200 group-hover:via-red-300 group-hover:to-yellow-200 dark:hover:text-gray-900
                                focus:ring-4 focus:outline-none focus:ring-red-100 dark:focus:ring-red-400
                                ${isDisabled && "cursor-not-allowed"}
                            `}
                            disabled={isDisabled}
                        >
                            <span className="inline-block w-48 relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
                                {isDisabled ? (
                                    <FaSpinner className="animate-spin inline-block" />
                                ) : (
                                    'Open Markdown Editor'
                                )}
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
                            disabled={isDisabled}
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
                            disabled={isDisabled}
                        />
                    </div>
                    <button
                        type="submit"
                        className={`text-white bg-gradient-to-r from-cyan-500 to-blue-500 
                             focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 
                            font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 min-w-[90px]
                            ${isDisabled ? '' : 'hover:bg-gradient-to-bl'}
                        `}
                        disabled={isDisabled}
                    >
                        {isDisabled ? (
                            <FaSpinner className="animate-spin inline-block" />
                        ) : (
                            'Update'
                        )}
                    </button>
                </form>
            </div >

            <MarkdownEditor
                bookData={editBookData}
                handleContentsChange={(contentType: string, newContent: string) => handleContentsChange(contentType, newContent)}
                contentType={"toc"}
                isOpen={isMdTocOpen}
                editorTitle={"Markdown Table Of Contents Editor"}
                onClose={toggleMdTocEditor}
                setLoading={setLoading}
            />

            <MarkdownEditor
                bookData={editBookData}
                handleContentsChange={(contentType: string, newContent: string) => handleContentsChange(contentType, newContent)}
                contentType={"mdBody"}
                isOpen={isMdBodyOpen}
                editorTitle={"Markdown Body Editor"}
                onClose={toggleMdBodyEditor}
                setLoading={setLoading}
                loadable={true}
            />

            <HtmlEditor
                bookData={editBookData}
                handleContentsChange={(contentType: string, newContent: string) => handleContentsChange(contentType, newContent)}
                contentType={"htmlBody"}
                isOpen={isHtmlBodyOpen}
                editorTitle={"Html Body Editor"}
                onClose={toggleHtmlBodyEditor}
            />

            <MarkdownEditor
                bookData={editBookData}
                handleContentsChange={(contentType: string, newContent: string) => handleContentsChange(contentType, newContent)}
                contentType={"mdUsage"}
                isOpen={isMdUsageOpen}
                editorTitle={"Markdown Usage Editor"}
                onClose={toggleMdUsageEditor}
            />

            <HtmlEditor
                bookData={editBookData}
                handleContentsChange={(contentType: string, newContent: string) => handleContentsChange(contentType, newContent)}
                contentType={"htmlUsage"}
                isOpen={isHtmlUsageOpen}
                editorTitle={"Html Usage Editor"}
                onClose={toggleHtmlUsageEditor}
            />

            <MarkdownEditor
                bookData={editBookData}
                handleContentsChange={(contentType: string, newContent: string) => handleContentsChange(contentType, newContent)}
                contentType={"summary"}
                isOpen={isMdSummaryOpen}
                editorTitle={"Markdown Summary Editor"}
                onClose={toggleMdSummaryEditor}
            />

            {/* {successMessage && (
                <div className="fixed top-4 inset-x-0 flex justify-center items-center">
                    <div className="bg-green-500 text-white px-4 py-2 rounded shadow-lg w-1/3 text-center">
                        <p
                            dangerouslySetInnerHTML={{ __html: successMessage }}
                        />
                    </div>
                </div>
            )} */}

            {
                successMessage && (
                    <div className="fixed top-4 inset-x-0 flex justify-center items-center z-40">
                        <div className="flex w-full max-w-md items-center p-4 mb-4 text-sm text-green-800 border border-green-300 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-green-400 dark:border-green-800" role="alert">
                            <svg className="flex-shrink-0 inline w-4 h-4 me-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
                            </svg>
                            <span className="sr-only">Info</span>
                            <div
                                className="text-sm font-medium"
                                dangerouslySetInnerHTML={{ __html: successMessage }}
                            />
                        </div>
                    </div>
                )
            }

            {
                warningMessage && (
                    <div className="fixed top-4 inset-x-0 flex justify-center items-center z-40">
                        <div className="flex w-full max-w-md items-center p-4 mb-4 text-sm text-yellow-800 border border-yellow-300 rounded-lg bg-yellow-50 dark:bg-gray-800 dark:text-yellow-300 dark:border-yellow-800" role="alert">
                            <svg className="flex-shrink-0 inline w-4 h-4 me-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
                            </svg>
                            <span className="sr-only">Info</span>
                            <div
                                className="text-sm font-medium"
                                dangerouslySetInnerHTML={{ __html: warningMessage }}
                            />
                        </div>
                    </div>
                )
            }

            {
                errorMessage && (
                    <div className="fixed top-4 inset-x-0 flex justify-center items-center z-40">
                        <div className="flex w-full max-w-md items-center p-4 mb-4 text-sm text-red-800 border border-red-300 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400 dark:border-red-800" role="alert">
                            <svg className="flex-shrink-0 inline w-4 h-4 me-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
                            </svg>
                            <span className="sr-only">Info</span>
                            <div
                                className="text-sm font-medium"
                                dangerouslySetInnerHTML={{ __html: errorMessage }}
                            />
                        </div>
                    </div>
                )
            }

            {
                loading && (
                    <div className="fixed inset-0 bg-gray-800 bg-opacity-60 flex items-center justify-center z-30 w-full h-full">
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
                )
            }

        </div >
    );
};

export default EditBook;
