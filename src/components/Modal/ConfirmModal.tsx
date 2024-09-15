import { useState } from "react";

const ConfirmModal = ({ message, onConfirm, onCancel }: {
    message: string,
    onConfirm: () => void,
    onCancel: () => void,
}) => {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 ease-in-out">
                <p className="text-gray-800 text-lg font-semibold mb-6 text-center">{message}</p>
                <div className="flex justify-center space-x-4">
                    <button
                        className="px-5 py-2 bg-gray-400 text-white font-medium rounded-lg hover:bg-gray-500 hover:shadow-lg transition duration-300"
                        onClick={onCancel}
                    >
                        Cancel
                    </button>
                    <button
                        className="px-5 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 hover:shadow-lg transition duration-300"
                        onClick={onConfirm}
                    >
                        OK
                    </button>
                </div>
            </div>
        </div>

    );
};

export default ConfirmModal

const UsageExample = () => {
    const [showModal, setShowModal] = useState(false);

    const handleDelete = () => {
        setShowModal(true);
    };

    const handleConfirm = () => {
        setShowModal(false);
        // 確認後の処理
        alert("Confirmed!");
    };

    const handleCancel = () => {
        setShowModal(false);
        // キャンセル時の処理
        alert("Cancelled!");
    };

    return (
        <div>
            <div className="p-4">
                <button
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                    onClick={handleDelete}
                >
                    Delete
                </button>

                {showModal && (
                    <ConfirmModal
                        message="Are you sure you want to delete this?"
                        onConfirm={handleConfirm}
                        onCancel={handleCancel}
                    />
                )}
            </div>
        </div>
    );
}


