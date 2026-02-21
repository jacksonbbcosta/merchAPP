// app/_layout.tsx
import { Stack } from 'expo-router';
import { ProdutoProvider } from '../context/ProdutoContext'; // Importamos o Provider

export default function Layout() {
  return (
    // Abraçamos o aplicativo todo com o Provider!
    <ProdutoProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {/* As telas continuarão sendo injetadas aqui automaticamente */}
      </Stack>
    </ProdutoProvider>
  );
}