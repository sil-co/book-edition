import axios, { AxiosResponse } from 'axios';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { FaSpinner } from 'react-icons/fa';
import { FiExternalLink } from 'react-icons/fi';
import { FaAngleDoubleLeft } from "react-icons/fa";

import { useState, useEffect, useRef } from 'react';

import { useGlobalState } from '../../context/GlobalStateProvider';
import HtmlEditor from '../Editor/HtmlEditor';
import MarkdownEditor from '../Editor/MarkdownEditor';
import ImageGallery from '../Editor/ImageGallery';
import { API_ENDPOINTS, BASE_URL, BASE_SAMPLE_URL } from "../../api/urls";
import { checkIsGpt } from '../../api/gpt';
import * as BT from '../../types/BookTypes';
import * as OT from '../../types/OpenApiTypes';

const EditBook = () => {
    const navigate = useNavigate();
    const { setSuccessMessage, setWarningMessage, setLoadingTxt, setErrorMessage, setImageModalSrc } = useGlobalState();

    let initData: BT.BookDataType = {
        title: "", // 初期値を空文字に設定
        author: "",
        genre: "",
        isPublished: false,
    };

    const [id, setId] = useState<string>('');
    const [editBookData, setEditBookData] = useState<BT.BookDataType>(initData);
    const [unEditedData, setUnEditedData] = useState<BT.BookDataType>(initData);
    const [isMdTocOpen, setIsMdTocOpen] = useState<boolean>(false);
    const [isMdBodyOpen, setIsMdBodyOpen] = useState<boolean>(false);
    const [isHtmlBodyOpen, setIsHtmlBodyOpen] = useState<boolean>(false);
    const [isMdUsageOpen, setIsMdUsageOpen] = useState<boolean>(false);
    const [isHtmlUsageOpen, setIsHtmlUsageOpen] = useState<boolean>(false);
    const [isMdSummaryOpen, setIsMdSummaryOpen] = useState<boolean>(false);
    const [isImageEditorOpen, setIsImageEditorOpen] = useState<boolean>(false);
    const [isSelectModalOpen, setIsSelectModalOpen] = useState<boolean>(false);
    const [isIntroductionOpen, setIsIntroductionOpen] = useState<boolean>(false);
    const [isAfterEndOpen, setIsAfterEndOpen] = useState<boolean>(false);
    const [isOtherBooksOpen, setIsOtherBooksOpen] = useState<boolean>(false);
    const [imagePreviewId, setImagePreviewId] = useState<string>('');
    const [selectedImageId, setSelectedImageId] = useState<string>('');
    const [fileName, setFileName] = useState<string>('');
    const [dragActive, setDragActive] = useState<boolean>(false);
    const [isDisabled, setIsDisabled] = useState<boolean>(false);
    const selectedImageRef = useRef<HTMLImageElement | null>(null);
    const previewImageRef = useRef<HTMLImageElement | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate("/login?error=unauthorized");
            return;
        }
        const id = useParams().id;
        console.log({ id })
        if (!id) {
            navigate("/books");
            return;
        }
        setId(id);
    }, []);


    useEffect(() => {
        console.log({ id })
        if (id) { getBookData(); }
    }, [id]);

    useEffect(() => {
        if (imagePreviewId) { setNewPreviewImage(imagePreviewId); }
    }, [imagePreviewId]);

    useEffect(() => {
        if (selectedImageId) { setNewSelectedImage(selectedImageId); }
    }, [selectedImageId]);

    const getBookData = async () => {
        try {
            setLoadingTxt('Loading...');
            const isGpt: Boolean = await checkIsGpt(id);
            if (isGpt) {
                setWarningMessage('Cannot display because GPT is still running.');
                await setTime(2000, () => navigate('/books'));
                return;
            }
            const token = localStorage.getItem('token');
            const res: AxiosResponse<BT.BookDataType> = await axios.get<BT.BookDataType>(
                API_ENDPOINTS.getBook(id),
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const data: BT.BookDataType = res.data;
            setEditBookData(data);
            setUnEditedData(data);
            if (data.coverImageId) { setSelectedImageId(data.coverImageId); }
        } catch (error) {
            console.error("Failed to get bookData", error);
            setErrorMessage(`Failed to get bookData.`);
            setSuccessMessage(null);
        } finally {
            setLoadingTxt('');
        }
    };

    const setNewSelectedImage = async (selectedImageId: string) => {
        if (!selectedImageId) { return setErrorMessage("Cannot select") }
        const res: AxiosResponse<BT.CoverImageData> = await axios.get<BT.CoverImageData>(API_ENDPOINTS.getCoverImage(selectedImageId));
        const imagePath = res.data.imagePath || '';
        // const fetchedImage = await fetch(imagePath);
        // const blob = await fetchedImage.blob();
        // const newImageSelected = URL.createObjectURL(blob);
        // URL.revokeObjectURL(selectedImageId);
        // setSelectedImageId(newImageSelected);
        const newImagePath = `${imagePath}?t=${new Date().getTime()}`;
        if (selectedImageRef.current) { selectedImageRef.current.src = newImagePath; }
    }

    const setNewPreviewImage = async (imagePreviewId: string) => {
        if (!imagePreviewId) { return setErrorMessage("No preview image.") }
        const res: AxiosResponse<BT.CoverImageData> = await axios.get<BT.CoverImageData>(API_ENDPOINTS.getCoverImage(imagePreviewId));
        const imagePath = res.data.imagePath || '';
        const newImagePath = `${imagePath}?t=${new Date().getTime()}`;
        if (previewImageRef.current) { previewImageRef.current.src = newImagePath; }
    }

    const isChangedCoverImage = async (): Promise<boolean> => {
        const originalImageBuffer = await (await fetch(unEditedData.coverImageId || '')).blob().then((b) => b.arrayBuffer());
        const newImageBuffer = await (await fetch(selectedImageId)).blob().then((b) => b.arrayBuffer());

        if (
            originalImageBuffer.byteLength === newImageBuffer.byteLength &&
            new Uint8Array(originalImageBuffer).every((value, index) => value === new Uint8Array(newImageBuffer)[index])
        ) {
            return false;
        } else {
            return true;
        }
    }

    const uploadImage = async (): Promise<BT.CoverImageData | undefined> => {
        if (!selectedImageId) { return; }
        let extension: string = getFileExtension(selectedImageId);
        if (!extension) { setErrorMessage('Invalid extension.'); return; }
        if (extension !== 'jpg' && extension !== 'png' && extension !== 'webp') { extension = 'jpg'; }
        const coverTitle = `${editBookData.title}_cover.${extension}`;

        const data = await fetch(selectedImageId);
        const blob = await data.blob();
        const formData = new FormData();
        formData.append('cover', blob, coverTitle);

        const token = localStorage.getItem('token');
        const res: AxiosResponse<BT.CoverImageData> = await axios.post<BT.CoverImageData>(
            `${API_ENDPOINTS.uploadCoverImage()}`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                },
            },
        );

        return res.data;
    };

    const requiredCheck = (): BT.RequiredFieldType | '' => {
        const requiredFields: BT.RequiredFieldType[] = ['id', 'title', 'author', 'genre'];

        for (const field of requiredFields) {
            if (!editBookData[field]) { return field; }
        }
        return '';
    };

    const textToDisplay = (name: keyof BT.BookDataType | string): string => {
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
            case 'coverImageId':
                return 'Cover';
            case 'language':
                return 'Language';
            case 'summary':
                return 'Summary';
            case 'kindle':
                return 'URL(Kindle)';
            case 'isPublished':
                return 'Published';
            case 'defaultStyle':
                return 'Style';
            case 'introduction':
                return 'Introduction';
            case 'afterEnd':
                return 'AfterEnd';
            case 'otherBooks':
                return 'Other Books';
            case 'publishedAt':
                return 'Published_At';
            default:
                return '';
        }
    }

    // 変更があったか確認
    const extractEditedData = (): Partial<BT.BookDataType> => {
        const extractedData = { ...editBookData };

        Object.keys(unEditedData).forEach((key) => {
            if (key === "id") { return; }
            if (unEditedData[key as keyof BT.BookDataType] === editBookData[key as keyof BT.BookDataType]) {
                delete extractedData[key as keyof BT.BookDataType];
            }
        });

        return extractedData;
    };

    const handleBack = async () => {
        // 編集した箇所のみのプロパティを抽出
        const extractedData: Partial<BT.BookDataType> = extractEditedData();

        // propertyがidのみの場合
        const keys = Object.keys(extractedData).filter(key => key !== 'id');
        const keysToDisplay: string[] = keys.map(key => textToDisplay(key));
        if (keys.length > 0) {
            const confirmMessage = `Back to without saving? \n Update field: \n ${keysToDisplay.join(', ')}`;
            if (!window.confirm(confirmMessage)) {
                return;
            }
        }
        await setTime(2000, () => navigate('/books'));
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
            // const isChangedCover = await isChangedCoverImage();
            if (keys.length === 0) { return setWarningMessage("WARNING: Not Edited"); }

            let confirmMessage = `Are you sure update? \n Update fields: \n ${keysToDisplay.join(', ')}`;
            // if (isChangedCover) { confirmMessage += 'Book Cover'; }
            if (!window.confirm(confirmMessage)) { return; }

            const isGpt: Boolean = await checkIsGpt(id);
            if (isGpt) { return setWarningMessage('Cannot update because GPT is still running.'); }

            const token = localStorage.getItem('token');
            const res: AxiosResponse<BT.BookDataType> = await axios.put<BT.BookDataType>(
                API_ENDPOINTS.updateBook(id),
                extractedData,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            keys.forEach((key) => {
                if (key === 'id') { return; }
                setUnEditedData((prev) => ({
                    ...prev,
                    [key]: res.data[key as keyof BT.BookDataType]
                }));
            });

            setSuccessMessage(`${res.data.title} Updated Successfully! `);
        } catch (e) {
            setErrorMessage("Failed to Update");
        } finally {
            setIsDisabled(false);
        }
    };

    const toggleIntroductionEditor = () => {
        if (!isIntroductionOpen) {
            setIsIntroductionOpen(true);
        } else {
            setIsIntroductionOpen(false);
        }
    }

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
                    setLoadingTxt('Loading...');
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
                setLoadingTxt('');
            }
        } else {
            setIsMdBodyOpen(false);
            setLoadingTxt('');
        }
    }

    const toggleHtmlBodyEditor = async () => {
        if (!isHtmlBodyOpen) {
            try {
                if (!editBookData.htmlBody && editBookData.htmlBody !== '') {
                    setLoadingTxt('Loading...');
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
                setLoadingTxt('');
            }
        } else {
            setIsHtmlBodyOpen(false);
            setLoadingTxt('');
        }
    };

    const toggleMdUsageEditor = async () => {
        if (!isMdUsageOpen) {
            try {
                if (!editBookData.mdUsage && editBookData.mdUsage !== '') {
                    setLoadingTxt('Loading...');
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
                setLoadingTxt('');
            }
        } else {
            setIsMdUsageOpen(false);
            setLoadingTxt('');
        }
    }

    const toggleHtmlUsageEditor = async () => {
        if (!isHtmlUsageOpen) {
            try {
                if (!editBookData.htmlUsage && editBookData.htmlUsage !== '') {
                    setLoadingTxt('Loading...');
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
                setLoadingTxt('');
            }
        } else {
            setIsHtmlUsageOpen(false);
            setLoadingTxt('');
        }
    }

    const toggleMdSummaryEditor = () => {
        if (!isMdSummaryOpen) {
            setIsMdSummaryOpen(true);
        } else {
            setIsMdSummaryOpen(false);
        }
    }

    const toggleImageEditor = () => {
        if (!isImageEditorOpen) {
            setIsImageEditorOpen(true);
        } else {
            setIsImageEditorOpen(false);
        }
    }

    const toggleSelectModal = () => {
        if (!isSelectModalOpen) {
            setIsSelectModalOpen(true);
        } else {
            setIsSelectModalOpen(false);
        }
    }

    const toggleAfterEndEditor = () => {
        if (!isAfterEndOpen) {
            setIsAfterEndOpen(true);
        } else {
            setIsAfterEndOpen(false);
        }
    }

    const toggleOtherBooksEditor = () => {
        if (!isOtherBooksOpen) {
            setIsOtherBooksOpen(true);
        } else {
            setIsOtherBooksOpen(false);
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEditBookData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleContentsChange = (contentType: keyof BT.BookDataType, newContent: string) => {
        setEditBookData((prev) => ({
            ...prev,
            [contentType]: newContent,
        }));
    };

    const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
        e.preventDefault();
        const imgElement = e.target as HTMLImageElement;
        setImageModalSrc(imgElement.src || '');
    };

    const closeModal = () => {
        setImageModalSrc('');
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            if (file) {
                setFileName(file.name);
            } else {
                setFileName('');
            }
            handleFileChange(e);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragActive(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragActive(false);
    };

    const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragActive(false);
        const file = e.dataTransfer.files[0]; // ドロップされたファイルを取得
        if (file) {
            setFileName(file.name);

            // DataTransferオブジェクトを使用してFileListを作成
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);

            // プレビューURLを解放してから新しく設定
            // if (imagePreviewId) {
            //     URL.revokeObjectURL(imagePreviewId);
            // }

            const filePreview = URL.createObjectURL(file);
            await uploadPreviewImage(filePreview);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];

            // if (imagePreviewId) {
            //     URL.revokeObjectURL(imagePreviewId);
            // }

            const filePreview = URL.createObjectURL(file);
            await uploadPreviewImage(filePreview);
        }
    };

    const handleOpenInNewTab = (url: string) => {
        if (!url) return;
        window.open(url, '_blank', 'noopener,noreferrer'); // 別タブで開く
    };

    const uploadPreviewImage = async (filePreview: string): Promise<BT.CoverImageData | undefined> => {
        if (!filePreview) { return; }
        let extension: string = getFileExtension(filePreview);
        if (!extension) { setErrorMessage('Invalid extension.'); return; }
        if (extension !== 'jpg' && extension !== 'png' && extension !== 'webp') { extension = 'jpg'; }
        const coverTitle = `${editBookData.title}_cover.${extension}`;

        const data = await fetch(filePreview);
        const blob = await data.blob();
        const formData = new FormData();
        formData.append('cover', blob, coverTitle);

        const token = localStorage.getItem('token');
        const res: AxiosResponse<BT.CoverImageData> = await axios.post<BT.CoverImageData>(
            `${API_ENDPOINTS.uploadCoverImage()}`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                },
            },
        );
        setImagePreviewId(res.data.id);

        // if (previewImageRef.current) {
        //     // const data = await fetch(previewImageRef.current.src);
        //     // const blob = await data.blob();
        //     // const copyImagePreview = URL.createObjectURL(blob);
        //     // URL.revokeObjectURL(previewImageRef.current.src);
        //     // previewImageRef.current.src = res.data.imagePath;
        //     const newImagePath = `${res.data.imagePath}?t=${new Date().getTime()}`;
        //     previewImageRef.current.src = newImagePath;
        // }
        setSuccessMessage('The image was uploaded.');
    }

    const usePreviewImage = async (e: React.MouseEvent<HTMLImageElement>) => {
        e.preventDefault();
        if (!imagePreviewId) { return setErrorMessage('No image selected'); }
        // const data = await fetch(imagePreviewId);
        // const blob = await data.blob();
        // const copyImagePreview = URL.createObjectURL(blob);
        // URL.revokeObjectURL(imagePreviewId);
        setEditBookData((prev) => ({
            ...prev,
            coverImageId: imagePreviewId,
        }));
        setSelectedImageId(imagePreviewId);
        setImagePreviewId('');
    }

    const getFileExtension = (url: string): string => {
        const extension = url.split('.').pop()?.split(/\#|\?/)[0];
        return extension || '';
    };

    const handleDownloadClick = async () => {
        if (!window.confirm(`Download selected image?`)) { return; }
        try {
            let extension: string = getFileExtension(selectedImageId);
            if (!extension) { return setErrorMessage('Invalid extension.'); }
            if (extension !== 'jpg' && extension !== 'png' && extension !== 'webp') { extension = 'jpg'; }
            const response = await fetch(selectedImageId);
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = `${editBookData.title}_cover.${extension}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error('Download failed:', error);
            setErrorMessage('Failed to download the image.');
        }
    };

    const generateImageGpt = async () => {
        try {
            const confirmMessage = `Do you generate image using GPT?`;
            if (!window.confirm(confirmMessage)) { return; }
            setLoadingTxt(`Image Generating...`);
            const gptImageReqBody: OT.GptImageReqBody = {
                id: String(editBookData.id),
                title: editBookData.title,
                contentType: 'coverImageId',
                model: "dall-e-3",
                prompt: ``,
                size: "1024x1792",
            }
            const res: AxiosResponse<string> = await axios.post<string>(API_ENDPOINTS.generateImageCoverGpt(), gptImageReqBody);
            const data = await fetch(`${BASE_URL}${res.data}`);
            const blob = await data.blob();
            const newImagePreview = URL.createObjectURL(blob);
            URL.revokeObjectURL(imagePreviewId);
            setImagePreviewId(newImagePreview);
            setErrorMessage('Output Image for GPT Successfully!');
        } catch (e) {
            setErrorMessage('Failed GPT Output. Please try again.');
        } finally {
            setLoadingTxt('');
        }
    }

    const setSampleImageOnPreview = async () => {
        // setImagePreviewId('');
        if (previewImageRef.current) { previewImageRef.current.src = BASE_SAMPLE_URL; }
    }

    const setSampleImageOnSelected = async () => {
        // setSelectedImageId('');
        if (selectedImageRef.current) { selectedImageRef.current.src = BASE_SAMPLE_URL; }
    }

    const setTime = async (time: number, callback?: () => void): Promise<void> => {
        return new Promise(resolve => {
            setTimeout(() => {
                callback && callback();
                resolve();
            }, time)
        })
    }

    return (
        <div className="container flex justify-center w-full mx-auto p-0 sm:p-4 mt-12">
            <div className="w-full bg-white shadow-md rounded-lg p-2 sm:p-6">
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
                    <div className="relative">
                        <label htmlFor="introduction" className="block text-sm font-medium text-gray-700 mb-1">
                            Introduction
                        </label>
                        <textarea
                            id="introduction"
                            name="introduction"
                            placeholder="introduction"
                            onChange={handleInputChange}
                            value={editBookData.introduction || ''}
                            className="hidden"
                            disabled={isDisabled}
                        ></textarea>
                        <span className="group">
                            <button
                                type="button"
                                onClick={toggleIntroductionEditor}
                                className={`relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg bg-gradient-to-br from-red-200 via-red-300 to-yellow-200 dark:text-white group-hover:from-red-200 group-hover:via-red-300 group-hover:to-yellow-200 dark:hover:text-gray-900
            focus:ring-4 focus:outline-none focus:ring-red-100 dark:focus:ring-red-400
            ${isDisabled && "cursor-not-allowed"}`}
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
                        </span>
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
                        <label htmlFor="coverImageId" className="block text-sm font-medium text-gray-700 mb-1 select-none">
                            Book Cover
                        </label>
                        <textarea
                            id="coverImageId"
                            name="coverImageId"
                            placeholder="coverImageId"
                            onChange={handleInputChange}
                            value={editBookData.coverImageId || ''}
                            className="hidden"
                            disabled={isDisabled}
                        ></textarea>
                        {/* <button
                            type="button"
                            onClick={toggleImageEditor}
                            className={`relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-green-400 to-blue-600 group-hover:from-green-400 group-hover:to-blue-600 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800
                                ${isDisabled && "cursor-not-allowed"}
                            `}
                            disabled={isDisabled}
                        >
                            <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
                                {isDisabled ? (
                                    <FaSpinner className="animate-spin inline-block" />
                                ) : (
                                    'Open Image Gallery'
                                )}
                            </span>
                        </button> */}
                        <div className="flex mt-0 space-x-4" >
                            <div
                                className={`relative first:mt-0 w-40 h-40 bg-gray-100 rounded-md flex items-center justify-center
                                    ${selectedImageId ? 'border-2 border-green-500' : 'border border-gray-300'}
                                `}>
                                {selectedImageId ? (
                                    <>
                                        <img
                                            src={selectedImageId}
                                            alt="Selected"
                                            className="w-full h-full object-contain cursor-pointer rounded"
                                            onClick={handleImageClick}
                                            onError={setSampleImageOnSelected}
                                            loading='lazy'
                                            ref={selectedImageRef}
                                        />
                                        <span className="absolute bottom-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-5 text-yellow-400 underline text-lg font-semibold  pointer-events-none">
                                            Now selected
                                        </span>
                                    </>
                                ) : (
                                    <span className="text-gray-400 text-sm select-none">Not selected</span>
                                )}
                            </div>
                            <div className="flex items-center flex-col justify-around w-[100px]">
                                {/* Todo: {APIでの画像出力はプロンプト調整しての出力や時間の遅さでかなり料金がかかる。よってEdgeやchatで出力する} */}
                                {/* <button
                                    type="button"
                                    onClick={generateImageGpt}
                                    disabled={true}
                                    // className={`text-white px-2 py-1 rounded w-[75px] h-8 select-none flex justify-center items-center
                                    //     ${isDisabled ? 'bg-emerald-500' : 'bg-gray-500 opacity-30'}
                                    // `}
                                    className="hidden"
                                >
                                    {isDisabled ? (
                                        <FaSpinner className="animate-spin inline-block" />
                                    ) : (
                                        'GPT(β)'
                                    )}
                                </button> */}
                                <button
                                    type="button"
                                    onClick={handleDownloadClick}
                                    disabled={isDisabled}
                                    className="bg-lime-500 text-white px-2 py-1 rounded w-[75px] h-8 select-none flex justify-center items-center"
                                >
                                    {isDisabled ? (
                                        <FaSpinner className="animate-spin inline-block" />
                                    ) : (
                                        'DL-img'
                                    )}
                                </button>
                                <div className="relative">
                                    <span
                                        onClick={usePreviewImage}
                                        className="bg-yellow-500 text-white px-2 py-1 rounded w-[75px] h-8 select-none cursor-pointer flex justify-center items-center"
                                    >
                                        {isDisabled ? (
                                            <FaSpinner className="animate-spin inline-block" />
                                        ) : (
                                            'Use this'
                                        )}
                                    </span>
                                    <button
                                        type="button"
                                        className="absolute -right-3 -top-2  px-1 py-1 text-black rounded-md transition-colors text-sm font-medium bg-slate-100 hover:bg-slate-200"
                                        disabled={isDisabled}
                                        onClick={() => handleOpenInNewTab("https://www.canva.com/")}
                                    >
                                        <FaAngleDoubleLeft />
                                    </button>
                                </div>
                                <div className="relative">
                                    <span
                                        onClick={() => handleOpenInNewTab("https://www.canva.com/")}
                                        className="bg-cyan-500 text-white px-2 py-1 rounded w-[75px] h-8 select-none cursor-pointer flex justify-center items-center"
                                    >
                                        {isDisabled ? (
                                            <FaSpinner className="animate-spin inline-block" />
                                        ) : (
                                            'Canva'
                                        )}
                                    </span>
                                    <button
                                        type="button"
                                        className="absolute -right-3 -top-2  px-1 py-1 text-black rounded-md transition-colors text-sm font-medium bg-slate-100 hover:bg-slate-200"
                                        disabled={isDisabled}
                                        onClick={() => handleOpenInNewTab("https://www.canva.com/")}
                                    >
                                        <FiExternalLink />
                                    </button>
                                </div>
                            </div>
                            <div className="relative first:mt-0 w-40 h-40 bg-gray-100 border border-gray-300 rounded-md flex items-center justify-center">
                                {imagePreviewId ? (
                                    <>
                                        <img
                                            src={imagePreviewId}
                                            alt="Preview"
                                            className="w-full h-full object-contain cursor-pointer rounded"
                                            onClick={handleImageClick}
                                            onError={setSampleImageOnPreview}
                                            loading='lazy'
                                            ref={previewImageRef}
                                        />
                                        <span className="absolute bottom-0 left-0 w-full h-full flex items-center underline justify-center bg-black bg-opacity-5 text-yellow-400 text-lg font-semibold pointer-events-none">
                                            Preview
                                        </span>
                                    </>
                                ) : (
                                    <span className="text-gray-400 text-sm select-none">No preview</span>
                                )}
                            </div>
                            <div
                                className={`last:mt-0 relative w-full h-40 border-2 border-dashed rounded-md flex items-center justify-center transition-colors ${dragActive ? 'border-blue-600' : 'border-gray-300'
                                    }`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                            >
                                <input
                                    id="coverImageId"
                                    name="coverImageId"
                                    type="file"
                                    onChange={handleChange}
                                    className="absolute w-full h-full opacity-0 cursor-pointer"
                                    disabled={isDisabled}
                                />
                                <div className="text-center">
                                    <span className="text-gray-500 text-sm">
                                        {fileName || 'Select Image or drag and drop here'}
                                    </span>
                                </div>
                            </div>
                        </div>
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
                    <div className="relative">
                        <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-1">
                            Summary
                        </label>
                        <textarea
                            id="summary"
                            name="summary"
                            placeholder="summary"
                            onChange={handleInputChange}
                            value={editBookData.summary || ''}
                            className="hidden"
                            disabled={isDisabled}
                        ></textarea>
                        <span className="group">
                            <button
                                type="button"
                                onClick={toggleMdSummaryEditor}
                                className={`relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg bg-gradient-to-br from-red-200 via-red-300 to-yellow-200 dark:text-white group-hover:from-red-200 group-hover:via-red-300 group-hover:to-yellow-200 dark:hover:text-gray-900
            focus:ring-4 focus:outline-none focus:ring-red-100 dark:focus:ring-red-400
            ${isDisabled && "cursor-not-allowed"}`}
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
                        </span>
                    </div>
                    <div className="relative">
                        <label htmlFor="afterEnd" className="block text-sm font-medium text-gray-700 mb-1">
                            AfterEnd
                        </label>
                        <textarea
                            id="afterEnd"
                            name="afterEnd"
                            placeholder="afterEnd"
                            onChange={handleInputChange}
                            value={editBookData.afterEnd || ''}
                            className="hidden"
                            disabled={isDisabled}
                        ></textarea>
                        <span className="group">
                            <button
                                type="button"
                                onClick={toggleAfterEndEditor}
                                className={`relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg bg-gradient-to-br from-red-200 via-red-300 to-yellow-200 dark:text-white group-hover:from-red-200 group-hover:via-red-300 group-hover:to-yellow-200 dark:hover:text-gray-900
            focus:ring-4 focus:outline-none focus:ring-red-100 dark:focus:ring-red-400
            ${isDisabled && "cursor-not-allowed"}`}
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
                        </span>
                    </div>
                    <div className="relative">
                        <label htmlFor="otherBooks" className="block text-sm font-medium text-gray-700 mb-1">
                            OtherBooks
                        </label>
                        <textarea
                            id="otherBooks"
                            name="otherBooks"
                            placeholder="otherBooks"
                            onChange={handleInputChange}
                            value={editBookData.otherBooks || ''}
                            className="hidden"
                            disabled={isDisabled}
                        ></textarea>
                        <span className="group">
                            <button
                                type="button"
                                onClick={toggleOtherBooksEditor}
                                className={`relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg bg-gradient-to-br from-red-200 via-red-300 to-yellow-200 dark:text-white group-hover:from-red-200 group-hover:via-red-300 group-hover:to-yellow-200 dark:hover:text-gray-900
            focus:ring-4 focus:outline-none focus:ring-red-100 dark:focus:ring-red-400
            ${isDisabled && "cursor-not-allowed"}`}
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
                        </span>
                    </div>
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            name="isPublished"
                            id="isPublished"
                            className="mr-2 cursor-pointer"
                            checked={editBookData.isPublished || false}
                            onChange={(e) => setEditBookData((prev) => ({
                                ...prev,
                                isPublished: e.target.checked,
                            }))}
                            disabled={isDisabled}
                        />
                        <label htmlFor="isPublished" className="select-none cursor-pointer block text-sm font-medium text-gray-700">
                            Published
                        </label>
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
                        className={`w-16 text-white bg-gradient-to-r from-cyan-500 to-blue-500 
                             focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 
                            font-medium rounded-lg text-sm px-3 py-2.5 text-center me-2 mb-2 min-w-[90px]
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
                    {/* <button
                        type="button"
                        className={`w-16 text-white bg-lime-500 h-10 select-none
                            font-medium rounded-lg text-sm px-3 py-2.5 text-center me-2 mb-2 min-w-[90px]
                            ${isDisabled ? '' : 'hover:bg-gradient-to-bl'}
                        `}
                        disabled={isDisabled}
                    >
                        {isDisabled ? (
                            <FaSpinner className="animate-spin inline-block" />
                        ) : (
                            'DL-epub'
                        )}
                    </button> */}
                </form>
            </div >

            <MarkdownEditor
                bookData={editBookData}
                handleContentsChange={(contentType: keyof BT.BookDataType, newContent: string) => handleContentsChange(contentType, newContent)}
                contentType={"introduction"}
                isOpen={isIntroductionOpen}
                editorTitle={"Markdown Introduction Editor"}
                onClose={toggleIntroductionEditor}
                gptButton={true}
                placeHolderText={"Introduction to the book"}
            />

            <MarkdownEditor
                bookData={editBookData}
                handleContentsChange={(contentType: keyof BT.BookDataType, newContent: string) => handleContentsChange(contentType, newContent)}
                contentType={"toc"}
                isOpen={isMdTocOpen}
                editorTitle={"Markdown Table Of Contents Editor"}
                onClose={toggleMdTocEditor}
                gptButton={true}
            />

            <MarkdownEditor
                bookData={editBookData}
                handleContentsChange={(contentType: keyof BT.BookDataType, newContent: string) => handleContentsChange(contentType, newContent)}
                contentType={"mdBody"}
                isOpen={isMdBodyOpen}
                editorTitle={"Markdown Body Editor"}
                onClose={toggleMdBodyEditor}
                gptButton={true}
                loadable={true}
            />

            <HtmlEditor
                bookData={editBookData}
                handleContentsChange={(contentType: keyof BT.BookDataType, newContent: string) => handleContentsChange(contentType, newContent)}
                contentType={"htmlBody"}
                isOpen={isHtmlBodyOpen}
                editorTitle={"Html Body Editor"}
                onClose={toggleHtmlBodyEditor}
            />

            <MarkdownEditor
                bookData={editBookData}
                handleContentsChange={(contentType: keyof BT.BookDataType, newContent: string) => handleContentsChange(contentType, newContent)}
                contentType={"mdUsage"}
                isOpen={isMdUsageOpen}
                editorTitle={"Markdown Usage Editor"}
                onClose={toggleMdUsageEditor}
                extract={true}
            />

            <HtmlEditor
                bookData={editBookData}
                handleContentsChange={(contentType: keyof BT.BookDataType, newContent: string) => handleContentsChange(contentType, newContent)}
                contentType={"htmlUsage"}
                isOpen={isHtmlUsageOpen}
                editorTitle={"Html Usage Editor"}
                onClose={toggleHtmlUsageEditor}
            />

            <MarkdownEditor
                bookData={editBookData}
                handleContentsChange={(contentType: keyof BT.BookDataType, newContent: string) => handleContentsChange(contentType, newContent)}
                contentType={"summary"}
                isOpen={isMdSummaryOpen}
                editorTitle={"Markdown Summary Editor"}
                onClose={toggleMdSummaryEditor}
                gptButton={true}
                placeHolderText={"Book summary (as shown on the kindle page)"}
            />

            <MarkdownEditor
                bookData={editBookData}
                handleContentsChange={(contentType: keyof BT.BookDataType, newContent: string) => handleContentsChange(contentType, newContent)}
                contentType={"afterEnd"}
                isOpen={isAfterEndOpen}
                editorTitle={"Markdown AfterEnd Editor"}
                onClose={toggleAfterEndEditor}
                gptButton={true}
                placeHolderText={"Afterword, at the end of the book"}
            />

            <MarkdownEditor
                bookData={editBookData}
                handleContentsChange={(contentType: keyof BT.BookDataType, newContent: string) => handleContentsChange(contentType, newContent)}
                contentType={"otherBooks"}
                isOpen={isOtherBooksOpen}
                editorTitle={"Markdown OtherBooks Editor"}
                onClose={toggleOtherBooksEditor}
                placeHolderText={"Introduction of my other books"}
            />

            <ImageGallery
                bookData={editBookData}
                handleContentsChange={(contentType: keyof BT.BookDataType, newContent: string) => handleContentsChange(contentType, newContent)}
                contentType={"coverImageId"}
                isOpen={isImageEditorOpen}
                editorTitle={"Image Gallery"}
                onClose={toggleImageEditor}
            />
        </div >
    );
};

export default EditBook;
