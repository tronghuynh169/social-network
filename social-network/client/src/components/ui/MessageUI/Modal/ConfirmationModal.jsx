import React from "react";

const ConfirmationModal = ({
    content,
    onClose,
    onConfirm,
    showConfirmButton = true,
}) => {
    return (
        <div className="fixed inset-0 bg-opacity-10 backdrop-brightness-50 modal-overlay flex items-center justify-center z-50">
            <div className="bg-[var(--secondary-color)] rounded-lg max-w-sm w-full pt-4 shadow-lg">
                <p className="text-[var(--text-secondary-color)] text-center mb-4 py-3">
                    {content}
                </p>
                <div className="gap-4 mt-4 text-center border-t border-[var(--button-color)]">
                    {showConfirmButton && (
                        <div
                            onClick={onConfirm}
                            className="text-[var(--text-button-color)] hover:bg-opacity-90 px-4 py-3 rounded-lg cursor-pointer"
                        >
                            Xác nhận
                        </div>
                    )}
                    <div
                        onClick={onClose}
                        className="hover:bg-opacity-90 px-4 py-3 rounded-lg cursor-pointer border-t border-[var(--button-color)]"
                    >
                        Hủy
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
