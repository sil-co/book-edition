
const Loading = (
    { loadingTxt }: { loadingTxt: string }
) => {

    return (
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
                <div className="text-white text-2xl">{loadingTxt}</div>
            </div>
        </div>
    )
}

export default Loading;
