'use client';

import { useEffect, useRef } from 'react';
import { Popover } from 'bootstrap';

interface ThreeDotsPopoverProps {
    onEdit: () => void;
    onDelete: () => void;
}

export default function ThreeDotsPopover({ onEdit, onDelete }: ThreeDotsPopoverProps) {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const popoverRef = useRef<Popover | null>(null);

    useEffect(() => {
        if (buttonRef.current) {
            popoverRef.current = new Popover(buttonRef.current, {
                trigger: 'focus', // auto-dismiss on outside click
                html: true,
                content: renderContent(),
                placement: 'bottom-end',
            });
        }

        return () => {
            popoverRef.current?.dispose();
        };
    }, []);

    // We pass event handler names as global functions via the window object
    useEffect(() => {
        (window as any).handleEdit = onEdit;
        (window as any).handleDelete = onDelete;
    }, [onEdit, onDelete]);

    const renderContent = () => {
        return `
      <div class="d-flex flex-column">
        <button class="btn btn-link text-start text-primary p-1" onclick="handleEdit()">Edit</button>
        <button class="btn btn-link text-start text-danger p-1" onclick="handleDelete()">Delete</button>
      </div>
    `;
    };

    return (
        <button
            ref={buttonRef}
            type="button"
            className="btn btn-light btn-sm"
            data-bs-toggle="popover"
            title=""
        >
            ⋯
        </button>
    );
}
