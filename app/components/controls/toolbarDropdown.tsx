'use client'
import { useEffect, useState } from 'react';
import { DropdownItem } from '../lexicalEditor/data/toolbarData';

interface ToolbarDropdownProps {
    dropdownItems?: DropdownItem[],
    selectedItem: DropdownItem | undefined;
    updateSelectionChange?: boolean,
    handleDropdownSelect: (item: DropdownItem) => void,
}

const ToolbarDropdown = ({ dropdownItems, selectedItem, updateSelectionChange, handleDropdownSelect }: ToolbarDropdownProps) => {
    const [selectedDropdown, setSelectedDropDown] = useState<DropdownItem | undefined>()

    useEffect(() => {
        if (selectedItem && dropdownItems?.some(item => item.id === selectedItem.id)) {
            setSelectedDropDown(selectedItem)
        } else if (dropdownItems?.some(item => item.active === true)) {
            setSelectedDropDown(dropdownItems?.find(item => item.active === true));
        } else {
            setSelectedDropDown(dropdownItems ? dropdownItems[0] : undefined)
        }
    }, [dropdownItems, selectedItem])

    const handleSelect = (item: DropdownItem) => {
        setSelectedDropDown(item)
        handleDropdownSelect(item);
    };

    return (
        <div className="btn-group" role="group" aria-label="Second group">
            <div className="btn-group" role="group">
                {updateSelectionChange ? (
                    <button type="button" className="btn btn-outline-secondary dropdown-toggle border-0" data-bs-toggle="dropdown" aria-expanded="false" title="Options">
                        <i className={`bi ${selectedDropdown?.icon} me-2`}></i>{selectedDropdown?.name}<i className='bi bi-chevron ms-2'></i>
                    </button>
                ) : (
                    <button type="button" className="btn btn-outline-secondary dropdown-toggle border-0" data-bs-toggle="dropdown" aria-expanded="false" title="Options">
                        <i className='bi bi-plus'></i>삽입<i className='bi bi-chevron ms-2'></i>
                    </button>)}
                <ul className="dropdown-menu">
                    {dropdownItems?.map((item, index) => (
                        <li key={index} >
                            {item.isModal ? (<>
                                <button className={`dropdown-item${item.active === true ? ' active' : ''}`} data-bs-target={item.databstarget} data-bs-toggle={item.databstoggle}>
                                    <i className={`bi ${item.icon}`}></i> {item.name}
                                </button>
                            </>) : (<>
                                <button className={`dropdown-item${item.active === true ? ' active' : ''}`} onClick={() => handleSelect(item)}>
                                    <i className={`bi ${item.icon}`}></i> {item.name}
                                </button>
                            </>)}
                        </li>
                    ))}
                </ul>             
            </div>
        </div>
    );
};

export default ToolbarDropdown;
