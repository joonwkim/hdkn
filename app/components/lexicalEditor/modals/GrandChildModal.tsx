import React, { useEffect, useRef } from 'react';

interface GrandChildModalProps {
    closeGrandChild: () => void;
}

const GrandChildModal: React.FC<GrandChildModalProps> = ({ closeGrandChild }) => {
    const modalRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (modalRef.current) {
            import('bootstrap/dist/js/bootstrap.bundle.min.js').then(() => {
                const modal = new window.bootstrap.Modal(modalRef.current!);
                modal.show();
            });
        }
    }, []);

    return (
        <div ref={modalRef} className="modal fade" tabIndex={-1}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Grandchild Modal</h5>
                        <button type="button" className="btn-close" onClick={closeGrandChild}>x</button>
                    </div>
                    <div className="modal-body">
                        <p>This is the Grandchild Modal content.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GrandChildModal;
