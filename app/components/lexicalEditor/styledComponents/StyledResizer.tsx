import styled from 'styled-components';

const StyledResizer = styled.div`
  background-color: ${({ theme }) => theme?.backgroundColor || 'none'}; 
  cursor: ${({ theme }) => theme?.cursor || 'default'}; 
  height: ${({ theme }) => theme?.height || '50px'}; 
  left: ${({ theme }) => theme?.left || '0px'}; 
  top: ${({ theme }) => theme?.top || '0px'}; 
  width: ${({ theme }) => theme?.width || '50px'}; 
  position: absolute;
  transition: all 0.3s ease;
`;

export default StyledResizer;
