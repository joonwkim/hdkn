import styled from "styled-components";
import { PositionProps } from "../plugins/TableHoverActionsPlugin";

const StyledAddColumnButton = styled.button<PositionProps>`
  position: absolute;
  background-color: #eee;
  border: 0;
  cursor: pointer;
  animation: table-controls 0.2s ease forwards;

  height: ${(props) => `${props.height}px` || '0px'};
  top: ${(props) => `${props.top}px` || '0px'};
  left: ${(props) => `${props.left}px` || '0px'};
  width: ${(props) => `${props.width}px` || '0px'};

  /* Background image */
  &:after {
    background-image: url('/images/icons/plus.svg');
    background-size: contain;
    background-position: center;
    background-repeat: no-repeat;
    display: block;
    content: ' ';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0.4;
  }

  /* Change background color on hover without hiding the button */
  &:hover {
    background-color: #c9dbf0;
  }

  /* Increase the opacity of the background image on hover */
  &:hover:after {
    opacity: 0.6;
  }

  @keyframes table-controls {
    from {
      opacity: 0;
      transform: scale(0.9);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
`;

export default StyledAddColumnButton;