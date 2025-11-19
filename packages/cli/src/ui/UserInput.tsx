import React, { useState } from 'react';
import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';

interface UserInputProps {
  message: string;
  onSubmit: (value: string) => void;
}

export const UserInput: React.FC<UserInputProps> = ({ message, onSubmit }) => {
  const [value, setValue] = useState('');

  const handleSubmit = () => {
    onSubmit(value);
  };

  return (
    <Box borderStyle="round" paddingX={1}>
      <Box marginRight={1}>
        <Text color="green">{message}</Text>
      </Box>
      <TextInput value={value} onChange={setValue} onSubmit={handleSubmit} />
    </Box>
  );
};
