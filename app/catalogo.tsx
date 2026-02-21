// app/catalogo.tsx
import { useRouter } from 'expo-router';
import React, { useContext, useState } from 'react';
import { FlatList, Platform, SafeAreaView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import CardProduto from '../components/CardProduto';
import { ProdutoContext } from '../context/ProdutoContext';

export default function CatalogoScreen() {
  const router = useRouter();
  const [busca, setBusca] = useState('');

  const { produtos, isAdmin } = useContext(ProdutoContext);

  const produtosFiltrados = produtos.filter((produto: any) => {
    const textoBusca = busca.toLowerCase();
    const nomeProduto = produto.nome.toLowerCase();
    return produto.id.includes(textoBusca) || nomeProduto.includes(textoBusca);
  });

  return (
    // SafeAreaView garante que o conteúdo não fique debaixo do Notch/Câmera no iPhone
    <SafeAreaView style={styles.areaSegura}>
      <View style={styles.container}>
        
        {/* CABEÇALHO */}
        <View style={styles.cabecalho}>
          <View>
            <Text style={styles.titulo}>MERCHANDISING</Text>
            {/* Aviso visual bacana de quem está logado */}
            {isAdmin ? (
              <Text style={styles.badgeAdmin}>Modo Administrador ativado</Text>
            ) : (
              <Text style={styles.badgeUser}>Modo Visualização</Text>
            )}
          </View>
          
          {isAdmin && (
            <TouchableOpacity style={styles.botaoAdd} onPress={() => router.push('/novo-produto')}>
              <Text style={styles.textoBotaoAdd}>+ NOVO</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* BARRA DE PESQUISA MELHORADA */}
        <View style={styles.areaBusca}>
          <TextInput
            style={styles.inputBusca}
            placeholder="🔍 Buscar por nome ou código..."
            placeholderTextColor="#999"
            value={busca}
            onChangeText={setBusca}
          />
        </View>

        {/* LISTA DE PRODUTOS */}
        <FlatList
          data={produtosFiltrados}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <CardProduto produto={item} />}
          contentContainerStyle={styles.lista}
          showsVerticalScrollIndicator={false} // Esconde aquela barra de rolagem feia do lado
          ListEmptyComponent={
            <View style={styles.caixaVazia}>
              <Text style={styles.textoVazio}>Nenhum produto encontrado.</Text>
              <Text style={styles.subtextoVazio}>Tente buscar por outro nome ou código.</Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // areaSegura garante o distanciamento no iPhone, e o StatusBar.currentHeight garante no Android!
  areaSegura: { 
    flex: 1, 
    backgroundColor: '#f0f4f8', 
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 
  },
  container: { flex: 1, backgroundColor: '#f0f4f8' },
  
  // CABEÇALHO
  cabecalho: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 15, paddingBottom: 15 },
  titulo: { fontSize: 26, fontWeight: '900', color: '#1a1a1a', letterSpacing: -0.5 },
  badgeAdmin: { color: '#28a745', fontSize: 12, fontWeight: 'bold', marginTop: 2 },
  badgeUser: { color: '#6c757d', fontSize: 12, fontWeight: '600', marginTop: 2 },
  
  // BOTÃO NOVO
  botaoAdd: { backgroundColor: '#1a1a1a', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  textoBotaoAdd: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  
  // BARRA DE BUSCA
  areaBusca: { paddingHorizontal: 20, marginBottom: 15 },
  inputBusca: { 
    backgroundColor: '#fff', 
    height: 50, 
    borderRadius: 12, 
    paddingHorizontal: 20, 
    fontSize: 16, 
    shadowColor: '#000', 
    shadowOpacity: 0.05, 
    shadowRadius: 8, 
    elevation: 2, 
    borderWidth: 1, 
    borderColor: '#f0f0f0' 
  },
  
  // LISTA
  lista: { paddingHorizontal: 20, paddingBottom: 30 },
  
  // ESTADO VAZIO (QUANDO A BUSCA NÃO ACHA NADA)
  caixaVazia: { alignItems: 'center', marginTop: 60, padding: 20 },
  textoVazio: { fontSize: 18, fontWeight: 'bold', color: '#555', marginBottom: 5 },
  subtextoVazio: { fontSize: 14, color: '#888', textAlign: 'center' }
});