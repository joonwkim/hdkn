import exp from "constants";
import styled from "styled-components";

export const Cross = styled.img`
    width:${props => props.width}px;
    height:${props => props.height}px;
    object-fit:contain;

`;

export const Modal = styled.div`
    position: fixed;
    left: 0;
    top: 0;
    z-index: 10;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.5);;
`;

export const ModalContainer = styled.div`
    width: 650px;
    height: 750px;

    background: rgba(255, 255, 255);
    box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
    border-radius: 25px;
    opacity: 1;
    position: fixed;

    padding-left: 60px;
    padding-right: 60px;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
`;

export const ModalTitle = styled.div`
    font-style: normal;
    font-weight: 700;
    font-size: 30px;
    color: #000000;
    margin-top: 50px;
`;

export const ModalText = styled.div`
    font-style: normal;
    font-weight: 500;
    font-size: 18px;
    color: #000000;
    margin-top: 100px;
    height: 400px;
    overflow: scroll;
`;

export const TermsNumber = styled.div`
    font-style: normal;
    font-weight: 600;
    font-size: 20px;
    color: #000000;
    /* margin-top: 50px; */
`;

export const ModalOkButton = styled.button`
    width: 156px;
    height: 50px;
    background: #6F8DDE;
    /* box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25); */
    border-radius: 5px;    
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 50px;
    cursor: pointer;

    display: flex;
    align-items: center;
    justify-content: center;

    > span {
        color: white;
        font-weight: 600;
        font-size: 20px;
    }
`;
