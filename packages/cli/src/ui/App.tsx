import React from 'react';
import { Box, Text } from 'ink';
import { TitledBox } from '@mishieck/ink-titled-box';

import type { AppState, AppMessage } from '@mcpscript/runtime';
import { UserInput } from './UserInput.js';

interface AppProps {
  state: AppState;
}

export const App: React.FC<AppProps> = ({ state }) => {
  return (
    <Box flexDirection="column">
      {state.messages.length > 0 &&
        state.messages.map((msg: AppMessage, index: number) =>
          msg.title ? (
            <TitledBox
              key={index}
              borderStyle="round"
              titles={[msg.title]}
              marginBottom={1}
              paddingX={1}
            >
              <Text>{msg.body}</Text>
            </TitledBox>
          ) : (
            <Box
              key={index}
              borderStyle="round"
              flexDirection="column"
              marginBottom={1}
              paddingX={1}
            >
              <Text>{msg.body}</Text>
            </Box>
          )
        )}
      {state.userInput && (
        <UserInput
          message={state.userInput.message}
          onSubmit={state.userInput.onSubmit}
        />
      )}
    </Box>
  );
};
