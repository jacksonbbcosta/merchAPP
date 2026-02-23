// app/_layout.tsx
import { Stack } from 'expo-router';
import { ProdutoProvider } from '../context/ProdutoContext';

export default function RootLayout() {
  return (
    <ProdutoProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" /> 
        <Stack.Screen name="catalogo" />
        <Stack.Screen name="novo-produto" />
      </Stack>
    </ProdutoProvider>
  );
}