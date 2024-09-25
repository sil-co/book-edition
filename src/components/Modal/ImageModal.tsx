
const ImageModal = (
    {
        closeModal,
        imageModalSrc,
    }: {
        closeModal?: () => void;
        imageModalSrc: string;
    }
) => {

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
            onClick={(e) => {
                if (e.target === e.currentTarget && closeModal) { closeModal(); }
            }}>
            <div className="relative bg-gray-200 p-1 rounded-lg">
                <button
                    onClick={(e) => {
                        if (e.target === e.currentTarget && closeModal) { closeModal(); }
                    }}
                    className="absolute top-2 right-2 text-black bg-gray-200 rounded-full w-10 h-10 font-bold hover:bg-gray-300"
                >
                    ×
                </button>
                <img src={imageModalSrc} alt="Enlarged Preview" className="w-full h-auto max-h-[90vh]" />
            </div>
        </div>
    )
}

export default ImageModal;
