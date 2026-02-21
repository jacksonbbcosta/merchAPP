// app/novo-produto.tsx
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useContext, useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { ProdutoContext } from '../context/ProdutoContext';

export default function NovoProdutoScreen() {
  const router = useRouter();
  const { adicionarProduto, produtos } = useContext(ProdutoContext);

  const [codigo, setCodigo] = useState('');
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [estoque, setEstoque] = useState('');
  const [imagemUri, setImagemUri] = useState<string | null>(null);

  const escolherImagem = async () => {
    let resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.8,
    });

    if (!resultado.canceled) {
      setImagemUri(resultado.assets[0].uri);
    }
  };

  const handleSalvar = () => {
    if (!codigo || !nome || !preco || !estoque || !imagemUri) {
      Alert.alert('Atenção', 'Por favor, preencha todos os campos e ESCOLHA UMA FOTO antes de salvar.');
      return;
    }

    const codigoJaExiste = produtos.find((p: any) => p.id === codigo);
    if (codigoJaExiste) {
      Alert.alert('Erro', 'Já existe um produto cadastrado com este código!');
      return;
    }

    const novoProduto = {
      id: codigo,
      nome: nome.toUpperCase(),
      preco: `R$ ${preco}`,
      estoque: parseInt(estoque),
      imagem: { uri: imagemUri } 
    };

    adicionarProduto(novoProduto);
    Alert.alert('Sucesso!', 'Novo produto adicionado ao catálogo com foto.');
    router.back();
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
    >
      <ScrollView style={styles.container}>
        <Text style={styles.titulo}>Cadastrar Produto</Text>

        <View style={styles.formulario}>
          
          <View style={styles.areaFoto}>
            {imagemUri ? (
              <Image source={{ uri: imagemUri }} style={styles.previewFoto} resizeMode="cover" />
            ) : (
              <View style={styles.caixaSemFoto}>
                <Text style={styles.textoSemFoto}>Nenhuma foto selecionada</Text>
              </View>
            )}
            
            <TouchableOpacity style={styles.botaoFoto} onPress={escolherImagem}>
              <Text style={styles.textoBotaoFoto}>
                {imagemUri ? 'TROCAR FOTO' : 'ESCOLHER FOTO'}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Código do Produto</Text>
          <TextInput style={styles.input} placeholder="Ex: 9988776" value={codigo} onChangeText={setCodigo} keyboardType="numeric" />

          <Text style={styles.label}>Nome do Produto</Text>
          <TextInput style={styles.input} placeholder="Ex: DISPLAY PROMOCIONAL" value={nome} onChangeText={setNome} />

          <Text style={styles.label}>Preço (Use vírgula)</Text>
          <TextInput style={styles.input} placeholder="Ex: 45,90" value={preco} onChangeText={setPreco} keyboardType="numeric" />

          <Text style={styles.label}>Estoque Inicial</Text>
          <TextInput style={styles.input} placeholder="Ex: 10" value={estoque} onChangeText={setEstoque} keyboardType="numeric" />

          <View style={styles.botoesContainer}>
            <TouchableOpacity style={styles.botaoCancelar} onPress={() => router.back()}>
              <Text style={styles.textoBotaoCancelar}>CANCELAR</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.botaoSalvar} onPress={handleSalvar}>
              <Text style={styles.textoBotaoSalvar}>SALVAR</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8' },
  titulo: { fontSize: 24, fontWeight: 'bold', color: '#333', marginTop: 30, marginBottom: 20, textAlign: 'center' },
  formulario: { backgroundColor: '#fff', marginHorizontal: 20, padding: 20, borderRadius: 15, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 3, marginBottom: 30 },
  
  areaFoto: { alignItems: 'center', marginBottom: 20 },
  previewFoto: { width: 140, height: 200, borderRadius: 10, marginBottom: 10 }, 
  caixaSemFoto: { width: 140, height: 200, borderRadius: 10, backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: '#ccc', borderStyle: 'dashed' },
  textoSemFoto: { fontSize: 12, color: '#888', textAlign: 'center', padding: 5 },
  botaoFoto: { backgroundColor: '#007BFF', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8 },
  textoBotaoFoto: { color: '#fff', fontWeight: 'bold', fontSize: 12 },

  label: { fontSize: 14, fontWeight: 'bold', color: '#555', marginBottom: 5 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, height: 45, paddingHorizontal: 15, marginBottom: 20, fontSize: 16, backgroundColor: '#fafafa' },
  botoesContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  botaoCancelar: { flex: 1, backgroundColor: '#ddd', padding: 15, borderRadius: 8, alignItems: 'center', marginRight: 10 },
  textoBotaoCancelar: { color: '#555', fontWeight: 'bold', fontSize: 16 },
  botaoSalvar: { flex: 1, backgroundColor: '#28a745', padding: 15, borderRadius: 8, alignItems: 'center', marginLeft: 10 },
  textoBotaoSalvar: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});