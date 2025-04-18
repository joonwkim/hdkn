'use client'
import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

const InputWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const StyledTextarea = styled.textarea.attrs({
  className: 'form-control border-0 border-bottom border-secondary rounded-0 shadow-none',
})`
  resize: none;
  height: auto;
  line-height: 1.5;
  padding: 0.375rem 0;
  overflow:hidden;

  &:focus {
    outline: none;
    border-bottom-width: 2px;
  }
`;

type ExpandingTextareaProps = {
  text: string;
  handleSaveBtnClick: (comment: string) => void
}
const ExpandingTextarea = ({ text, handleSaveBtnClick }: ExpandingTextareaProps) => {

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [comment, setComment] = useState(text);
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    target.style.height = 'auto';
    target.style.height = `${target.scrollHeight}px`;

  };

  const onChange = (value: string) => {
    setComment(value);
    handleSaveBtnClick(value)
  }


  return (
    <InputWrapper>
      <StyledTextarea
        ref={textareaRef}
        rows={1}
        value={comment}
        onChange={(e) => onChange(e.target.value)}
        placeholder=" "
        onInput={handleInput}
      />
    </InputWrapper>
  );
};


export default ExpandingTextarea;
