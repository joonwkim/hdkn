import React, { useMemo, useState } from 'react';
import { debounce } from 'lodash-es';
import './styles.css'

const EmbedYoutubeModal = ({ onClick }: { onClick: (payload: { value: string }) => void, }) => {
    const [url, setUrl] = useState('');
    const [isValid, setIsValid] = useState<boolean | null>(null);

    const validateText = useMemo(
        () => {
            const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/(watch\?v=|embed\/|v\/|.+\?v=)?([^&]{11})/;
            return debounce((inputText: string) => {
                setIsValid(youtubeRegex.test(inputText));
            }, 200);
        }, []);


    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (isValid && url) {
            const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|v\/|.+\?v=)|youtu\.be\/)([^&\n?#]+)/;
            const match = url.match(regex);
            const videoId = match ? match[1] : null;
            if (videoId) {
                onClick({ value: videoId });
            }
        }
    };
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const inputUrl = event.target.value;
        setUrl(inputUrl);
        validateText(inputUrl)
    };

    return (<div className="modal fade" id="insertYouTubeVideoModal" aria-hidden="true" aria-labelledby="insertInlineImageModalToggleLabel" tabIndex={-1}>
        <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
                <div className="modal-header">
                    <h1 className="modal-title fs-4" id="insertInlineImageModalToggleLabel">유튜브 비디오 삽입</h1>
                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div className="modal-body my-3">
                    <div className="container">
                        <form onSubmit={handleSubmit} id='insertYouTubeLinkForm'>
                            <input
                                type="text"
                                className='form-control'
                                id="youTobeUrl"
                                value={url}
                                placeholder="유튜브 주소입력창"
                                onChange={handleChange}
                                required
                            />
                            {isValid === null ? (
                                <p className='validUrl ms-2'>유효한 유튜브 주소를 입력하세요</p>
                            ) : isValid ? (
                                <p className='validUrl ms-2'>유효한 유튜브 주소 입니다.</p>
                            ) : (
                                <p className='error ms-2'>유효하지 않은 유튜브 주소 입니다.</p>
                            )}
                        </form>
                    </div>
                </div>
                <div className='modal-footer'>
                    <div className='me-5'>
                        <button type="submit" className="btn btn-outline-secondary border-0" form='insertYouTubeLinkForm' disabled={!isValid} data-bs-dismiss="modal" >확인</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    )
}
export default EmbedYoutubeModal