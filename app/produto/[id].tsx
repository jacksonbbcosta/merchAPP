// app/produto/[id].tsx
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useContext, useState } from 'react';
import { Alert, Dimensions, Image, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { ProdutoContext } from '../../context/ProdutoContext';

// Pegamos a largura e altura da tela para ajustar a imagem perfeitamente
const { height } = Dimensions.get('window');

export default function DetalhesProduto() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const { produtos, atualizarEstoque, excluirProduto, isAdmin } = useContext(ProdutoContext);
  const produto = produtos.find((item: any) => item.id === id);

  const [novoEstoque, setNovoEstoque] = useState(produto ? produto.estoque.toString() : '0');
  const [modalVisivel, setModalVisivel] = useState(false);

  if (!produto) return null;

  // FUNÇÕES NOVAS PARA OS BOTÕES DE + E -
  const incrementar = () => {
    const val = parseInt(novoEstoque) || 0;
    setNovoEstoque((val + 1).toString());
  };

  const decrementar = () => {
    const val = parseInt(novoEstoque) || 0;
    if (val > 0) setNovoEstoque((val - 1).toString());
  };

  const handleSalvarEstoque = () => {
    const quantidade = parseInt(novoEstoque);
    if (isNaN(quantidade) || quantidade < 0) {
      Alert.alert('Erro', 'Estoque inválido.'); return;
    }
    atualizarEstoque(produto.id, quantidade);
    Alert.alert('Sucesso!', 'Estoque atualizado.');
  };

  const handleExcluir = () => {
    Alert.alert('Atenção', 'Tem certeza que deseja excluir este produto?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => {
          excluirProduto(produto.id);
          router.back();
        }
      }
    ]);
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1, backgroundColor: '#f0f4f8' }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* BOTÃO FLUTUANTE DE VOLTAR NO TOPO */}
      <TouchableOpacity style={styles.botaoVoltarFlutuante} onPress={() => router.back()}>
        <Text style={styles.textoBotaoFlutuante}>← Voltar</Text>
      </TouchableOpacity>

      {/* AGORA TUDO ESTÁ DENTRO DO SCROLL (A IMAGEM ROLA JUNTO) */}
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        
        {/* IMAGEM (Ocupa um espaço grande, mas rola pra cima) */}
        <TouchableOpacity activeOpacity={0.9} onPress={() => setModalVisivel(true)} style={styles.areaImagem}>
          {produto.imagem ? (
            <Image source={produto.imagem} style={styles.imagemGrande} resizeMode="cover" />
          ) : (
            <View style={[styles.imagemGrande, styles.caixaSemFoto]}>
              <Text style={styles.textoSemFoto}>Sem Imagem</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* MODAL DE FOTO TELA CHEIA */}
        <Modal visible={modalVisivel} transparent={true} animationType="fade">
          <View style={styles.modalFundo}>
            <TouchableOpacity style={styles.botaoFecharModal} onPress={() => setModalVisivel(false)}>
              <Text style={styles.textoBotaoFechar}>X</Text>
            </TouchableOpacity>
            {produto.imagem && (
              <Image source={produto.imagem} style={styles.imagemTelaCheia} resizeMode="contain" />
            )}
          </View>
        </Modal>

        {/* CAIXA DE DETALHES INFERIOR */}
        <View style={styles.caixaDetalhes}>
            
          <View style={styles.cabecalhoProduto}>
            <Text style={styles.codigo}>CÓDIGO: {produto.id}</Text>
            <Text style={styles.nome}>{produto.nome}</Text>
          </View>
          
          <View style={styles.linhaCards}>
            <View style={styles.cardInfo}>
              <Text style={styles.cardLabel}>Preço Unitário</Text>
              <Text style={styles.preco}>{produto.preco}</Text>
            </View>
            
            <View style={styles.cardInfo}>
              <Text style={styles.cardLabel}>Estoque Atual</Text>
              <Text style={[styles.numeroEstoqueApenasVisual, produto.estoque === 0 ? styles.estoqueZerado : null]}>
                {produto.estoque} un.
              </Text>
            </View>
          </View>

          {/* PAINEL DE ADMINISTRAÇÃO REFORMULADO */}
          {isAdmin && (
            <View style={styles.painelAdmin}>
              <Text style={styles.tituloAdmin}>⚙️ PAINEL ADMINISTRATIVO</Text>
              <Text style={styles.textoEstoqueAdmin}>Atualizar Estoque Rápido:</Text>
              
              {/* NOVO CONTROLE DE ESTOQUE COM BOTÕES + E - */}
              <View style={styles.stepperContainer}>
                <TouchableOpacity style={styles.stepperBotao} onPress={decrementar}>
                  <Text style={styles.stepperTexto}>-</Text>
                </TouchableOpacity>
                
                <TextInput 
                  style={styles.inputEstoque} 
                  value={novoEstoque} 
                  onChangeText={setNovoEstoque} 
                  keyboardType="numeric" 
                />
                
                <TouchableOpacity style={styles.stepperBotao} onPress={incrementar}>
                  <Text style={styles.stepperTexto}>+</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.botaoSalvarGrande} onPress={handleSalvarEstoque}>
                <Text style={styles.textoBotaoSalvar}>💾 SALVAR NOVO ESTOQUE</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.botaoExcluir} onPress={handleExcluir}>
                <Text style={styles.textoBotaoExcluir}>🗑️ EXCLUIR PRODUTO</Text>
              </TouchableOpacity>
            </View>
          )}

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  // BOTÃO FLUTUANTE
  botaoVoltarFlutuante: { position: 'absolute', top: 50, left: 20, zIndex: 10, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 20 },
  textoBotaoFlutuante: { color: '#fff', fontWeight: 'bold', fontSize: 14 },

  // ÁREA DA IMAGEM
  areaImagem: { height: height * 0.45, backgroundColor: '#ddd' }, // Ocupa 45% da tela inicial
  imagemGrande: { width: '100%', height: '100%' },
  caixaSemFoto: { justifyContent: 'center', alignItems: 'center', backgroundColor: '#e0e0e0' },
  textoSemFoto: { color: '#888', fontWeight: 'bold' },

  // CAIXA DE CONTEÚDO
  caixaDetalhes: { 
    flex: 1, backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30, 
    marginTop: -30, padding: 25, paddingBottom: 50, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 8 
  },
  
  cabecalhoProduto: { marginBottom: 20 },
  codigo: { fontSize: 12, color: '#888', fontWeight: 'bold', marginBottom: 4, letterSpacing: 1 },
  nome: { fontSize: 24, fontWeight: '900', color: '#222' },

  linhaCards: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  cardInfo: { flex: 1, backgroundColor: '#f8f9fa', padding: 15, borderRadius: 12, marginHorizontal: 5, borderWidth: 1, borderColor: '#eee', alignItems: 'center' },
  cardLabel: { fontSize: 12, color: '#666', marginBottom: 5, textTransform: 'uppercase', fontWeight: '600' },
  preco: { fontSize: 22, fontWeight: 'bold', color: '#007BFF' },
  numeroEstoqueApenasVisual: { fontSize: 22, fontWeight: 'bold', color: '#28a745' },
  estoqueZerado: { color: '#dc3545' },

  // PAINEL DE ADMINISTRAÇÃO E STEPPER
  painelAdmin: { backgroundColor: '#fff3cd', padding: 20, borderRadius: 15, borderWidth: 1, borderColor: '#ffeeba', marginBottom: 20 },
  tituloAdmin: { fontSize: 14, fontWeight: 'bold', color: '#856404', marginBottom: 15, textAlign: 'center' },
  textoEstoqueAdmin: { fontSize: 14, color: '#856404', marginBottom: 10, fontWeight: '600', textAlign: 'center' },
  
  stepperContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  stepperBotao: { backgroundColor: '#ffeeba', width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#ffc107' },
  stepperTexto: { fontSize: 24, fontWeight: 'bold', color: '#856404' },
  inputEstoque: { width: 80, height: 50, backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 10, textAlign: 'center', fontSize: 22, fontWeight: 'bold', marginHorizontal: 15 },
  
  botaoSalvarGrande: { backgroundColor: '#28a745', padding: 15, borderRadius: 10, alignItems: 'center', marginBottom: 15 },
  textoBotaoSalvar: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  
  botaoExcluir: { backgroundColor: '#dc3545', padding: 15, borderRadius: 10, alignItems: 'center' },
  textoBotaoExcluir: { color: '#fff', fontSize: 14, fontWeight: 'bold' },

  // MODAL DE FOTO
  modalFundo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center' },
  imagemTelaCheia: { width: '100%', height: '80%' },
  botaoFecharModal: { position: 'absolute', top: 50, right: 20, zIndex: 10, padding: 15, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 30 },
  textoBotaoFechar: { color: '#fff', fontSize: 20, fontWeight: 'bold' }
});