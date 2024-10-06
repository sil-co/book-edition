import React, { useState, useEffect, useRef } from 'react';

import { FiExternalLink } from 'react-icons/fi';

import * as BT from '../../types/BookTypes';

interface EditorEditorProps {
    bookData: BT.BookDataType;
    handleContentsChange: (contentType: keyof BT.BookDataType, newContent: string) => void;
    contentType: BT.EditorContentType;
    onClose: () => void;
    isOpen: boolean;
    editorTitle: string;
    setLoading?: React.Dispatch<React.SetStateAction<string>>;
    loadable?: boolean;
    images?: string[];
    defaultImage?: string;
}

const ImageGallery: React.FC<EditorEditorProps> = ({
    // bookData,
    // handleContentsChange,
    contentType,
    // onClose,
    isOpen,
    editorTitle,
    // setLoading,
    // loadable,
    images, 
    defaultImage
}) => {
    // const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string>('');
    const [isImageModalOpen, setIsImageModalOpen] = useState<boolean>(false);
    const [fileName, setFileName] = useState<string>('');
    const [dragActive, setDragActive] = useState<boolean>(false);

    const uploadImage = () => {
        alert('upload image successfully!');
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            if (file) {
                setFileName(file.name);
            } else {
                setFileName('');
            }
            handleFileChange(e);
            uploadImage();
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();

        console.log('handle drag over');

        setDragActive(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();

        console.log('handle drag leave');
        setDragActive(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();

        console.log('handle drop');

        setDragActive(false);
        const file = e.dataTransfer.files[0]; // ドロップされたファイルを取得
        if (file) {
            setFileName(file.name);

            // DataTransferオブジェクトを使用してFileListを作成
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);

            setFileName(file.name);
            // setSelectedFile(file);

            // プレビューURLを解放してから新しく設定
            if (preview) {
                URL.revokeObjectURL(preview);
            }

            const filePreview = URL.createObjectURL(file);
            setPreview(filePreview);
            uploadImage();
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            // setSelectedFile(file);

            // 既存のプレビューURLを解放
            if (preview) {
                URL.revokeObjectURL(preview);
            }

            // 新しいプレビューURLを生成
            const filePreview = URL.createObjectURL(file);
            setPreview(filePreview);
        }
    };

    const handleImageClick = () => {
        setIsImageModalOpen(true);
    };

    const closeModal = () => {
        setIsImageModalOpen(false);
    };

    const handleOpenInNewTab = (url: string) => {
        if (!url) return;
        window.open(url, '_blank', 'noopener,noreferrer'); // 別タブで開く
    };

    // const handleSubmit = async (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    //     e.preventDefault();
    //     if (!selectedFile) return;

    //     const formData = new FormData();
    //     formData.append(`${contentType}`, selectedFile);

    //     try {
    //         const response = await fetch('/upload', {
    //             method: 'POST',
    //             body: formData,
    //         });

    //         if (response.ok) {
    //             const result = await response.json();
    //             const newContent: string = result.filePath
    //             handleContentsChange(contentType, newContent);
    //         }
    //     } catch (error) {
    //         console.error('Error uploading file:', error);
    //     }
    // };

    const testFn = () => {
        console.log('testFn');
    }

    return (
        <div className={`fixed m-0 top-0 right-0 h-full w-full bg-white shadow-lg z-20 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="p-4 flex justify-between items-center border-b">
                <h2 className="text-xl font-bold">{editorTitle}</h2>
                <div className="flex space-x-2">
                    <div className="relative">
                        <span
                            onClick={() => handleOpenInNewTab("https://www.canva.com/")}
                            className="bg-blue-500 text-white px-3 py-1 rounded inline-block w-16 cursor-pointer"
                        >
                            Canva
                        </span>
                        <button
                            type="button"
                            className="absolute -right-3 -top-2  px-1 py-1 text-black rounded-md transition-colors text-sm font-medium bg-slate-100 hover:bg-slate-200"
                            onClick={() => handleOpenInNewTab("https://www.canva.com/")}
                        >
                            <FiExternalLink />
                        </button>
                    </div>
                    <button
                        onClick={testFn}
                        className="bg-emerald-500 text-white px-3 py-1 rounded w-16"
                    >
                        GPT
                    </button>
                    <button
                        onClick={testFn}
                        className="bg-red-500 text-white px-3 py-1 rounded w-16"
                    >
                        Close
                    </button>
                </div>
            </div>
            <div className="container flex justify-center w-full mx-auto p-0 sm:p-4">
                <div className="mr-2 w-40 h-40 bg-gray-100 border border-gray-300 rounded-md flex items-center justify-center">
                    {preview ? (
                        <img
                            src={preview}
                            alt="Preview"
                            className="w-full h-full object-contain cursor-pointer rounded"
                            onClick={handleImageClick}
                        />
                    ) : (
                        <span className="text-gray-400 text-base select-none">Not selected</span>
                    )}
                </div>
                <div className="flex space-x-4 w-full">
                    <div
                        className={`relative w-full h-40 border-2 border-dashed rounded-md flex items-center justify-center transition-colors ${dragActive ? 'border-blue-600' : 'border-gray-300'
                            }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <input
                            id={contentType}
                            name={contentType}
                            type="file"
                            onChange={handleChange}
                            className="absolute w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="text-center">
                            <span className="text-gray-500 text-xl">
                                {fileName || 'Select Image or drag and drop here'}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="ml-2 w-40 h-40 bg-gray-100 border border-gray-300 rounded-md flex items-center justify-center">
                    {preview ? (
                        <img
                            src={preview}
                            alt="Preview"
                            className="w-full h-full object-contain cursor-pointer rounded"
                            onClick={handleImageClick}
                        />
                    ) : (
                        <span className="text-gray-400 text-base select-none">No preview</span>
                    )}
                </div>
                {isImageModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={closeModal}>
                        <div className="relative bg-gray-200 p-1 rounded-lg">
                            <button
                                onClick={closeModal}
                                className="absolute top-2 right-2 text-black bg-gray-200 rounded-full w-10 h-10 font-bold hover:bg-gray-300"
                            >
                                ×
                            </button>
                            <img src={preview} alt="Enlarged Preview" className="w-full h-auto max-h-[90vh]" />
                        </div>
                    </div>
                )}
            </div>
            <div className="container mx-auto p-4">
                <h1 className="text-2xl font-bold text-center mb-6">Image Gallery</h1>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 2xl:grid-cols-7 gap-4">
                    {images && images.map((src, index) => (
                        <LazyImage key={index} src={src} defaultImage={defaultImage || ''} alt={`Gallery image ${index + 1}`} />
                    ))}
                </div>
            </div>
        </div >
    );
};

// LazyImageコンポーネント
type LazyImageProps = {
    src: string;
    defaultImage: string;
    alt: string;
};

const LazyImage: React.FC<LazyImageProps> = ({ src, defaultImage, alt }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [imageSrc, setImageSrc] = useState('');
    const imgRef = useRef<HTMLImageElement | null>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsVisible(true);
                        observer.disconnect(); // 一度表示されたら監視をやめる
                    }
                });
            },
            {
                threshold: 0.1, // 10%が表示領域に入ったら発火
            }
        );

        if (imgRef.current) {
            observer.observe(imgRef.current);
        }

        return () => {
            if (imgRef.current) {
                observer.unobserve(imgRef.current);
            }
        };
    }, []);

    // 画像読み込み失敗時にデフォルト画像を設定
    const handleError = () => {
        setImageSrc(defaultImage);
    };

    useEffect(() => {
        if (isVisible) {
            setImageSrc(src); // 画像が表示領域に入ったときに画像をセット
        }
    }, [isVisible, src]);

    return (
        <div className="relative overflow-hidden rounded-lg shadow-lg w-40 h-64 ">
            <img
                ref={imgRef}
                src={imageSrc || defaultImage}
                alt={alt}
                onError={handleError}
                className="hover:scale-105 transition-transform duration-300 ease-in-out object-contain w-40 h-64"
                loading='lazy'
            />
        </div>
    );
};

export default ImageGallery;
