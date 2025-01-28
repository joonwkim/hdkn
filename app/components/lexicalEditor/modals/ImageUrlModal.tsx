'use client'
// import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import React, { useState } from 'react'
import { InsertImagePayload } from '../plugins/ToolbarPlugin';
// import { $createImageNode } from '../nodes/ImageNode';
// import { $insertNodes } from 'lexical';
// import CustomImageNode from '../nodes/CustomImageNode';
// import { $createNodeSelection, $getRoot, $getSelection, $insertNodes, $setSelection } from 'lexical';
// import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
// import { InsertImagePayload } from '../plugins/ToolbarPlugin org';

const ImageUrlModal = ({ onClick }: { onClick: (payload: InsertImagePayload) => void, }) => {

    // const [editor] = useLexicalComposerContext();
    const [imageFormData, setFormData] = useState({ url: '', referrer: '' });
    const [isUrlValid, setIsUrlValid] = useState(false);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        onClick({ src: imageFormData.url, altText: imageFormData.referrer })

        // editor.update(() => {
        //     const imageNode = new CustomImageNode(imageFormData.url, imageFormData.referrer);

        //     // Insert the image node into the editor's root or at the current selection point
        //     const selection = $getSelection();
        //     if (selection) {
        //         $insertNodes([imageNode]);

        //         // Select the new node
        //         const nodeSelection = $createNodeSelection();
        //         nodeSelection.add(imageNode.getKey());
        //         $setSelection(nodeSelection);

        //     } else {
        //         // If no selection, append it to the root
        //         const root = $getRoot();
        //         root.append(imageNode);
        //     }
        // });


        setFormData({ url: '', referrer: '' });
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = event.target;
        setFormData({ ...imageFormData, [id]: value, });
        if (id === 'url') {
            validateUrl(value);
        }
    };

    const validateUrl = (url: string) => {
        if (url === "https://example.com/image.jpg") {
            setIsUrlValid(false);
        } else {
            const urlPattern = new RegExp(
                '^(https?:\\/\\/)' + // protocol (http or https)
                '((([a-zA-Z\\d]([a-zA-Z\\d-]*[a-zA-Z\\d])*)\\.?)+[a-zA-Z]{2,})' + // domain name
                '(\\:\\d+)?(\\/[-a-zA-Z\\d%_.~+]*)*' + // port and path
                '(\\?[;&a-zA-Z\\d%_.~+=-]*)?' + // query string
                '(\\#[-a-zA-Z\\d_]*)?$', // fragment locator
                'i' // case-insensitive
            );
            const isImageUrl = /\.(jpg|jpeg|png|gif)$/i.test(url); // Separate check for image URL
            const isValid = urlPattern.test(url) && isImageUrl;
            setIsUrlValid(isValid);
        }
    };

    return (
        <div className="modal fade" id="insertImageUrlModal" aria-hidden="true" aria-labelledby="insertImageUrlTitle" data-bs-backdrop="static" data-bs-target="#staticBackdrop" tabIndex={-1}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h1 className="modal-title fs-5" id="insertImageUrlTitle">이미지 URL 삽입</h1>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        <div className="container mt-5">
                            <form onSubmit={(handleSubmit)} id='insertImageUrlForm'>
                                <div className="mb-3 d-flex">
                                    <label htmlFor="url" className="form-label mt-1 col-3">이미지 URL</label>
                                    <div className='col-9'>
                                        <input
                                            type="text" // Changed to text for manual validation
                                            className={`form-control ${isUrlValid ? 'is-valid' : 'is-invalid'}`}
                                            id="url"
                                            placeholder="예시, https://example.com/image.jpg"
                                            value={imageFormData.url}
                                            onChange={handleInputChange}
                                            required
                                        />
                                        {isUrlValid ? (
                                            <div className="form-text ms-2">유효한 image URL</div>
                                        ) : (
                                            <div className="invalid-feedback ms-2">유효한 image URL을 입력하세요 (jpg, jpeg, png, gif).</div>
                                        )}


                                    </div>
                                </div>
                                <div className="mb-3 d-flex">
                                    <label htmlFor="referrer" className="form-label col-3">참고사항</label>
                                    <div className='col-9'>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="referrer"
                                            placeholder="공란 또는 참고사항"
                                            value={imageFormData.referrer}
                                            onChange={handleInputChange}
                                            required
                                        />
                                        <div className="form-text ms-2">참고사항을 입력하세요</div>
                                    </div>

                                </div>
                            </form>
                        </div>

                    </div>
                    <div className='modal-footer'>
                        <div className='me-5'>
                            <button type="submit" className="btn btn-outline-secondary border-0" form='insertImageUrlForm' data-bs-dismiss="modal" disabled={!isUrlValid}>확인</button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default ImageUrlModal