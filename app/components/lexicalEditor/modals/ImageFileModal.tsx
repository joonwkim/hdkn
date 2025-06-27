import React, { useState } from 'react'
import { InsertImagePayload } from '../plugins/ToolbarPlugin';
import './styles.css'
import { uploadToCloudinary } from '@/app/actions/cloudinary';
import { Position, } from '../nodes/ImageNode';

const InsertImageFileModal = ({ onClick }: { onClick: (payload: InsertImagePayload) => void, }) => {
    const [file, setFile] = useState<File | null>(null);
    const [altText, setAltText] = useState<string>('');
    const [fileError, setFileError] = useState<string>('');
    const [imageWidth, setImageWidth] = useState<undefined | number>();
    const [imageHeight, setImageHeight] = useState<undefined | number>();
    const [position, setPosition] = useState<Position>(undefined)

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const selectedFile = event.target.files[0];
            setFileError('');
            setFile(selectedFile);
        }
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (file) {
            const formData = new FormData();
            formData.append('file', file)
            formData.append('filename', file.name)
            if (file.size > 1024 * 1024 * 2) {
                alert('2mb 이하 파일을 삽입할 수 있습니다. 파일 크기:' + file.size);
            } else {
                try {
                    const ci = await uploadToCloudinary(formData)
                    if (ci) {
                        const payload: InsertImagePayload = {
                            src: ci.secure_url,
                            altText: ci.filename,
                            width: ci.width,
                            height: ci.height,
                            position: position,
                            formData: formData,
                        };
                        // console.log('payload:', payload)
                        onClick(payload)
                    }
                } catch (error) {
                    throw error;
                }
            }
        }
        setFile(null)
    };

    const isButtonDisabled = !file;

    return (
        <div className="modal fade" id="insertImageFileModal" aria-hidden="true" aria-labelledby="insertImageUrlTitle" data-bs-backdrop="static" data-bs-target="#staticBackdrop" tabIndex={-1}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h1 className="modal-title fs-5" id="insertImageUrlTitle">이미지 파일 삽입</h1>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        <div className="container">
                            <form onSubmit={handleSubmit} id='insertImageFileForm'>
                                <div className="mb-3 d-flex">
                                    <label htmlFor="inlineCustomFile" className="form-label mt-1 col-3">파일 올리기: </label>
                                    <div className='col-9'>
                                        <div className="custom-file">
                                            <input type="file" className="custom-file-input file-input" id="inlineCustomFile" onChange={handleFileChange} />
                                            {file !== null ? (<>    <label className="custom-file-label mt-1" htmlFor="inlineCustomFile">{file?.name}</label></>) : (<>    <label className="custom-file-label mt-1" htmlFor="inlineCustomFile">이미지 파일을 선택하세요</label></>)}
                                        </div>
                                        {fileError && <div className="text-danger mt-2">{fileError}</div>}
                                    </div>

                                </div>
                                <div className="mb-3 d-flex">
                                    <label htmlFor="caption" className="form-label mt-1 col-3">이미지 대체 이름: </label>
                                    <div className='col-9'>
                                        <input
                                            id="caption"
                                            type="text"
                                            className="form-control"
                                            value={altText}
                                            placeholder='이미지 대체 이름을 입력하세요'
                                            onChange={(e) => setAltText(e.target.value)}
                                        />
                                        {/* <div className="form-text ms-2">이미지만 표출됩니다.</div> */}
                                    </div>
                                </div>
                                <div className="mb-3 d-flex">
                                    <label htmlFor="imageWidth" className="form-label mt-1 col-3">이미지 폭(px): </label>
                                    <div className='col-9'>
                                        <input
                                            id="imageWidth"
                                            type="number"
                                            className="form-control"
                                            value={imageWidth ?? ''}
                                            placeholder=' '
                                            onChange={(e) => setImageWidth(e.target.value ? parseInt(e.target.value) : undefined)}
                                        />
                                        <div className="form-text ms-2">공란시 폭의 너비로 자동 결정됩니다.</div>
                                    </div>
                                </div>
                                {imageWidth && (<>
                                    <div className="mb-3 d-flex">
                                        <label htmlFor="positionSelect" className="form-label mt-1 col-3">정렬: </label>
                                        <div className='col-9'>
                                            <select id='positionSelect' className="form-select" aria-label="이미지 맞춤" value={position} onChange={(e) => setPosition(e.target.value as Position)}>
                                                <option value='left'>왼쪽 맞춤</option>
                                                <option value='right'>우측 맞춤</option>
                                                <option value='full'>가운데 맞춤</option>
                                            </select>
                                        </div>
                                    </div>
                                </>)}
                                <div className="mb-3 d-flex">
                                    <label htmlFor="imageHeight" className="form-label mt-1 col-3">이미지 높이(px): </label>
                                    <div className='col-9'>
                                        <input
                                            id="imageHeight"
                                            type="number"
                                            className="form-control"
                                            value={imageHeight ?? ''}
                                            placeholder=' '
                                            onChange={(e) => setImageHeight(e.target.value ? parseInt(e.target.value) : undefined)}
                                        />
                                        <div className="form-text ms-2">공란시 폭의 너비로 자동 결정됩니다.</div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                    <div className='modal-footer'>
                        <div className='me-5'>
                            <button type="submit" className="btn btn-outline-secondary border-0" form='insertImageFileForm' data-bs-dismiss="modal" disabled={isButtonDisabled} >확인</button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default InsertImageFileModal