// components/CardProduto.tsx
import { useRouter } from 'expo-router'; // 1. Importamos o router
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function CardProduto({ produto }) {
  const router = useRouter(); // 2. Iniciamos o router

  return (
    // 3. Trocamos a View por TouchableOpacity e adicionamos o onPress
    <TouchableOpacity 
      style={styles.cartao} 
      activeOpacity={0.7} // Deixa o clique um pouco mais suave
      onPress={() => router.push(`/produto/${produto.id}`)} // Vai para a tela passando o ID!
    >
      
      {produto.imagem ? (
        <Image source={produto.imagem} style={styles.imagem} resizeMode="cover" />
      ) : (
        <View style={[styles.imagem, styles.caixaSemFoto]}>
          <Text style={styles.textoSemFoto}>Sem Foto</Text>
        </View>
      )}
      
      <View style={styles.informacoes}>
        <Text style={styles.nome} numberOfLines={2}>{produto.nome}</Text>
        <Text style={styles.codigo}>Cód: {produto.id}</Text>
        <Text style={styles.estoque}>Estoque: {produto.estoque} un.</Text>
        <Text style={styles.preco}>{produto.preco}</Text>
      </View>
    </TouchableOpacity>
  );
}

// ... (Mantenha o mesmo StyleSheet de antes aqui embaixo)
const styles = StyleSheet.create({
  cartao: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 10, padding: 10, marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  imagem: { width: 90, height: 90, borderRadius: 8, backgroundColor: '#eee' },
  caixaSemFoto: { justifyContent: 'center', alignItems: 'center', backgroundColor: '#e0e0e0' },
  textoSemFoto: { fontSize: 12, color: '#888', fontWeight: 'bold' },
  informacoes: { flex: 1, marginLeft: 15, justifyContent: 'center' },
  nome: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  codigo: { fontSize: 12, color: '#888', marginBottom: 4 },
  estoque: { fontSize: 14, color: '#28a745', fontWeight: '600', marginBottom: 4 },
  preco: { fontSize: 18, fontWeight: 'bold', color: '#007BFF' },
});