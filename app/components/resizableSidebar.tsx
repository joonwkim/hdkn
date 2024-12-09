'use client'
import React, { useState, useRef, useEffect } from 'react';
import styles from '../styles/ResizableSidebar.module.css'; // Import the CSS module

const MIN_WIDTH = 200; // Minimum sidebar width in pixels
const MAX_WIDTH = 600; // Maximum sidebar width in pixels


const ResizableSidebar: React.FC = () => {
    const [sidebarWidth, setSidebarWidth] = useState(250); // Initial sidebar width
    const sidebarRef = useRef<HTMLDivElement>(null); // Reference to the sidebar div

    const isResizing = useRef(false); // To track if the user is dragging

    // Handle mouse move while resizing
    const handleMouseMove = (e: MouseEvent) => {
        if (isResizing.current && sidebarRef.current) {
            const newWidth = e.clientX;
            if (newWidth > MIN_WIDTH && newWidth < MAX_WIDTH) {
                setSidebarWidth(newWidth);  // Set sidebar width dynamically
            }
        }
    };

    // Handle mouse up (stop resizing)
    const handleMouseUp = () => {
        isResizing.current = false;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    };

    // Handle mouse down (start resizing)
    const handleMouseDown = () => {
        isResizing.current = true;
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    // Dynamically set the sidebar width using useEffect
    useEffect(() => {
        if (sidebarRef.current) {
            sidebarRef.current.style.width = `${sidebarWidth}px`;
        }
    }, [sidebarWidth]);

    return (
        <div className={styles.dFlex}>
            <div ref={sidebarRef} className={styles.sidebar}            >
                <div>
                    <h5>TreeView with Multiple Root Nodes</h5>

                </div>
            </div>

            <div onMouseDown={handleMouseDown} className={styles.resizer} />


        </div>
    );
};

export default ResizableSidebar;
