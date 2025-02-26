import { useEffect, useState } from 'react';
import { TextField, TextFieldProps } from '@mui/material';
import { useField } from '@unform/core';


type TVTextFieldProps = TextFieldProps & {
  name: string;
}
export const VTextField: React.FC<TVTextFieldProps> = ({ name, ...rest }) => {
  const { fieldName, registerField, defaultValue, error, clearError } = useField(name);

  const [value, setValue] = useState(defaultValue || '');


  useEffect(() => {
    registerField({
      name: fieldName,
      getValue: () => value,
      setValue: (_, newValue) => setValue(newValue),
    });
  }, [registerField, fieldName, value]);

  const formatCpf = (cpf: string) => {
    let cleanCpf = cpf.replace(/\D/g, '');

    if (cleanCpf.length > 3 && cleanCpf.length <= 6) {
      cleanCpf = `${cleanCpf.slice(0, 3)}.${cleanCpf.slice(3)}`;
    } else if (cleanCpf.length > 6 && cleanCpf.length <= 9) {
      cleanCpf = `${cleanCpf.slice(0, 3)}.${cleanCpf.slice(3, 6)}.${cleanCpf.slice(6)}`;
    } else if (cleanCpf.length > 9) {
      cleanCpf = `${cleanCpf.slice(0, 3)}.${cleanCpf.slice(3, 6)}.${cleanCpf.slice(6, 9)}-${cleanCpf.slice(9, 11)}`;
    }

    return cleanCpf;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value: newValue } = e.target;

    if (name === 'cpf') {
      const formattedValue = formatCpf(newValue);
      setValue(formattedValue);
    } else {
      setValue(newValue);
    }

    rest.onChange?.(e);
  };

  const adjustValue = (e : string) => {

    if (name === 'cpf') {
      return formatCpf(e);
    } else {
      return e;
    }
  };

  return (
    <TextField
      {...rest}

      error={!!error}
      helperText={error}
      defaultValue={defaultValue}

      value={adjustValue(value)}
      onChange={handleChange}
      onKeyDown={(e) => { error && clearError(); rest.onKeyDown?.(e); }}
    />
  );
};
