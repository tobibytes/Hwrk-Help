import styled from 'styled-components';
import type { InputHTMLAttributes } from 'react';

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {}

export function Switch(props: SwitchProps) {
  return (
    <SwitchRoot data-checked={props.checked ? 'true' : 'false'}>
      <SwitchInput type="checkbox" {...props} />
      <SwitchThumb />
    </SwitchRoot>
  );
}

const SwitchRoot = styled.label`
  position: relative;
  display: inline-flex;
  width: 42px;
  height: 24px;
  border-radius: 9999px;
  background: ${({ theme }) => theme.colors.gray[300]};
  transition: ${({ theme }) => theme.transitions.all};
  cursor: pointer;

  &[data-checked='true'] {
    background: ${({ theme }) => theme.colors.primary[600]};
  }
`;

const SwitchInput = styled.input`
  position: absolute;
  inset: 0;
  opacity: 0;
  margin: 0;
`;

const SwitchThumb = styled.span`
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  border-radius: 9999px;
  background: ${({ theme }) => theme.colors.white};
  box-shadow: ${({ theme }) => theme.shadows.base};
  transition: ${({ theme }) => theme.transitions.transform};

  ${SwitchRoot}[data-checked='true'] & {
    transform: translateX(18px);
  }
`;
