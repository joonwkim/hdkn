'use client'
import React, { useState } from 'react'
import { InlineImagePayload, Position } from '../nodes/InlineImageNode';
import './styles.css'

const InlineImageModal = ({ onClick }: { onClick: (payload: InlineImagePayload) => void, }) => {
    const [file, setFile] = useState<File | null>(null);
    const [altText, setAltText] = useState<string>('');
    const [width, setWidth] = useState<number>(200);

    const [fileError, setFileError] = useState<string>('');
    const [align, setAlign] = useState<Position>('left')
    const [showCaption, setShowCaption] = useState<boolean>(false)
    const [showImageWidthSize, setShowImageWidthSize] = useState<boolean>(false)

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const selectedFile = event.target.files[0];
            setFileError('');
            setFile(selectedFile);
            setAltText(selectedFile.name)
            // if (selectedFile.size > 1 * 1024 * 1024) {
            //     setFileError('File size must be 1 MB or less.');
            //     setFile(null);
            // } else {
            //     setFileError('');
            //     setFile(selectedFile);
            //     setAltText(selectedFile.name)
            // }
        }
    };

    const handleAltTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setAltText(event.target.value);
    };

    // const handleShowCaption = (value: boolean) => {
    //     setShowCaption(value);
    //     if (value) {
    //         setAltText('')
    //     } else if (file) {
    //         setAltText(file.name)
    //     }
    // }

    // const handleShowFullWidth = (value: boolean) => {
    //     setShowFullWidth(value)
    // }

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (file && altText) {
            const src = URL.createObjectURL(file);
            onClick({ src: src, altText: altText, width: width, showCaption: showCaption, position: align })
        }
        setFile(null)
        setAltText('');
        setShowCaption(false);
        setAlign('left')
    };

    const isButtonDisabled = !file || !altText

    return (
        <>
            <div className="modal fade" id="insertInlineImageModal" aria-hidden="true" aria-labelledby="insertImageUrlTitle" data-bs-backdrop="static" data-bs-target="#staticBackdrop" tabIndex={-1}>
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="insertImageUrlTitle">이미지 파일 삽입</h1>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <div className="container">
                                <form onSubmit={handleSubmit} id='insertInlineImageFileForm'>
                                    <div className="mb-3 d-flex">
                                        <label htmlFor="url" className="form-label mt-1 col-3">파일 올리기: </label>
                                        <div className='col-9'>
                                            <div className="custom-file">
                                                <input type="file" className="custom-file-input file-input" id="inlineCustomFile" onChange={handleFileChange} />
                                                {file !== null ? (<>    <label className="custom-file-label mt-1" htmlFor="inlineCustomFile">{file.name}</label></>) : (<>    <label className="custom-file-label mt-1" htmlFor="inlineCustomFile">이미지 파일을 선택하세요</label></>)}
                                            </div>
                                            {fileError && <div className="text-danger mt-2">{fileError}</div>}
                                        </div>

                                    </div>
                                    <div className="mb-3 d-flex">
                                        <label htmlFor="referrer" className="form-label col-5">이미지 설명문 보이기: </label>
                                        <div className='col-7'>
                                            <div className="form-check">
                                                <input className="form-check-input" type="checkbox" id="showCaptionInput" checked={showCaption} onChange={(e) => setShowCaption(e.target.checked)} />
                                            </div>

                                        </div>
                                    </div>
                                    {showCaption && (<div className="mb-3 d-flex">
                                        <label htmlFor="referrer" className="form-label mt-1 col-3">이미지 설명: </label>
                                        <div className='col-9'>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="altTextInput"
                                                value={altText}
                                                placeholder='이미지 설명'
                                                onChange={handleAltTextChange}
                                                required
                                            />
                                            <div className="form-text ms-2">이미지 설명을 입력하세요.</div>
                                        </div>
                                    </div>)}

                                    <div className="mb-3 d-flex">
                                        <label htmlFor="referrer" className="form-label col-5">이미지 폭 지정: </label>
                                        <div className='col-7'>
                                            <div className="form-check">
                                                <input className="form-check-input" type="checkbox" id="showFullWidthInput" checked={showImageWidthSize} onChange={(e) => setShowImageWidthSize(e.target.checked)} />
                                            </div>

                                        </div>
                                    </div>
                                    {showImageWidthSize && (<>
                                        <div className="mb-3 d-flex">
                                            <label htmlFor="referrer" className="form-label mt-1 col-3">정렬: </label>
                                            <div className='col-9'>
                                                <select className="form-select" aria-label="이미지 맞춤" value={align} onChange={(e) => setAlign(e.target.value as Position)}>
                                                    <option value='left'>왼쪽 맞춤</option>
                                                    <option value='right'>우측 맞춤</option>
                                                    <option value='full'>가운데 맞춤</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="mb-3 d-flex">
                                            <label htmlFor="referrer" className="form-label mt-1 col-3">이미지 폭(px): </label>
                                            <div className='col-9'>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    id="width"
                                                    value={width}
                                                    placeholder='이미지 설명'
                                                    onChange={(e) => setWidth(parseInt(e.target.value) || 200)}
                                                    required
                                                />
                                                <div className="form-text ms-2">이미지 크기는 폭의 비율에 따라 계산하여 자동으로 결정됩니다.</div>
                                            </div>
                                        </div>
                                    </>)}
                                </form>
                            </div>

                        </div>
                        <div className='modal-footer'>
                            <div className='me-5'>
                                <button type="submit" className="btn btn-outline-secondary border-0" form='insertInlineImageFileForm' data-bs-dismiss="modal" disabled={isButtonDisabled} >확인</button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

        </>


    )
}
export default InlineImageModal