import { InsertTableCommandPayload } from '@lexical/table';
import React, { useState } from 'react'


const TableModal = ({ onClick }: { onClick: (payload: InsertTableCommandPayload) => void, }) => {
    const [rows, setRows] = useState<number>(5);
    const [columns, setColumns] = useState<number>(5);
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        onClick({ columns: columns.toString(), rows: rows.toString() })
    };
    const isButtonDisabled = rows === 0 || columns === 0;
    return (<div className="modal fade" id="insertTableModal" aria-hidden="true" aria-labelledby="insertTableModalToggleLabel" data-bs-target="#staticBackdrop" tabIndex={-1}>
        <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
                <div className="modal-header">
                    <h1 className="modal-title fs-5" id="insertTableModalToggleLabel">테이블 삽입</h1>
                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div className="modal-body">
                    <div className="container">
                        <form onSubmit={handleSubmit} id='insertTableForm'>
                            <div className="mb-3 d-flex">
                                <label htmlFor="tableColumns" className="form-label mt-1 col-3">행(Column): </label>
                                <div className='col-9'>
                                    <input
                                        id="tableColumns"
                                        type="number"
                                        className="form-control"
                                        value={columns}
                                        placeholder=' '
                                        onChange={(e) => setColumns(parseInt(e.target.value))}
                                    />
                                </div>
                            </div>
                            <div className="mb-3 d-flex">
                                <label htmlFor="tableRows" className="form-label mt-1 col-3">열(Row): </label>
                                <div className='col-9'>
                                    <input
                                        id="tableRows"
                                        type="number"
                                        className="form-control"
                                        value={rows}
                                        placeholder=' '
                                        onChange={(e) => setRows(parseInt(e.target.value))}
                                    />
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
                <div className='modal-footer'>
                    <div className='me-5'>
                        <button type="submit" className="btn btn-outline-secondary border-0" form='insertTableForm' data-bs-dismiss="modal" disabled={isButtonDisabled}>확인</button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    )
}
export default TableModal