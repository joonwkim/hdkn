import React, { useState } from 'react';
import ParentModal from './ParentModal';
import GrandChildModal from './GrandChildModal';

const ModalManager: React.FC = () => {
    const [isGrandChildModalVisible, setIsGrandChildModalVisible] = useState(false);

    const closeParentModal = () => {
        setIsGrandChildModalVisible(false);
    };

    const openGrandChildModal = () => {
        setIsGrandChildModalVisible(true);
    };

    return (
        <div>
            {/* Parent Modal */}
            <ParentModal closeParent={closeParentModal} openGrandChild={openGrandChildModal} />

            {/* Grandchild Modal */}
            {isGrandChildModalVisible && (
                <GrandChildModal closeGrandChild={() => setIsGrandChildModalVisible(false)} />
            )}
        </div>
    );
};

export default ModalManager;
