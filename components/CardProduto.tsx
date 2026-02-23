import { useRouter } from 'expo-router';
import React, { useContext, useState } from 'react';
import { Dimensions, Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ProdutoContext } from '../context/ProdutoContext';

interface Produto {
  codigo?: string;
  descricao?: string;
  estoque?: number | string;
  preco?: number | string;
  imagem?: string;
}

const larguraTela = Dimensions.get('window').width;
const larguraCartao = (larguraTela - 40) / 2;

export default function CardProduto({ produto }: { produto: Produto }) {
  const router = useRouter(); 
  const { isAdmin } = useContext(ProdutoContext);
  const [modalVisivel, setModalVisivel] = useState(false);

  const precoFormatado = produto?.preco 
    ? `R$ ${parseFloat(String(produto.preco)).toFixed(2).replace('.', ',')}` 
    : 'R$ 0,00';

  if (!produto || !produto.codigo) return null;

  return (
    <>
      <View style={styles.cartao}> 
        <View>
          <TouchableOpacity activeOpacity={0.8} onPress={() => setModalVisivel(true)}>
            <Image source={{ uri: produto.imagem }} style={styles.imagem} resizeMode="cover" />
          </TouchableOpacity>

          {isAdmin && (
            <TouchableOpacity style={styles.botaoEditar} onPress={() => router.push(`/editar-produto/${produto.codigo}` as any)}>
              <Text style={styles.textoIconeEditar}>✎</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.informacoes}>
          <Text style={styles.descricao} numberOfLines={2}>{produto?.descricao || 'Produto sem descrição'}</Text>
          <Text style={styles.codigo}>Cód: {produto.codigo}</Text>
          <Text style={styles.estoque}>Estoque: {produto?.estoque || 0} un.</Text>
          <Text style={styles.preco}>{precoFormatado}</Text>
        </View>
      </View>

      <Modal visible={modalVisivel} transparent={true} animationType="fade" onRequestClose={() => setModalVisivel(false)}>
        <View style={styles.fundoModal}>
          <TouchableOpacity style={styles.botaoFechar} onPress={() => setModalVisivel(false)}>
            <Text style={styles.textoFechar}>X FECHAR</Text>
          </TouchableOpacity>
          <Image source={{ uri: produto.imagem }} style={styles.imagemAmpliada} resizeMode="contain" />
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  cartao: { width: larguraCartao, backgroundColor: '#fff', borderRadius: 12, padding: 10, marginBottom: 15, elevation: 3 },
  imagem: { width: '100%', height: 120, borderRadius: 8, backgroundColor: '#eee' },
  botaoEditar: { position: 'absolute', top: 5, right: 5, backgroundColor: '#FFC107', width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff', elevation: 5 },
  textoIconeEditar: { fontSize: 16, color: '#000', fontWeight: 'bold' },
  informacoes: { flex: 1, marginTop: 10 }, 
  descricao: { fontSize: 14, fontWeight: '900', color: '#1a1a1a', marginBottom: 4 },
  codigo: { fontSize: 12, color: '#666' },
  estoque: { fontSize: 12, color: '#28a745', fontWeight: 'bold' },
  preco: { fontSize: 16, fontWeight: 'bold', color: '#007BFF', marginTop: 5 },
  fundoModal: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
  botaoFechar: { position: 'absolute', top: 50, right: 20, padding: 10, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8 },
  textoFechar: { color: '#fff', fontWeight: 'bold' },
  imagemAmpliada: { width: '95%', height: '80%' }
});