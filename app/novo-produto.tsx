// app/novo-produto.tsx
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ProdutoContext } from '../context/ProdutoContext';

export default function NovoProdutoScreen() {
  const router = useRouter();
  const { isAdmin } = useContext(ProdutoContext);

  const [codigo, setCodigo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState('');
  const [estoque, setEstoque] = useState('');
  const [imagemUri, setImagemUri] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (isAdmin === false || isAdmin === null) {
      Alert.alert('Acesso Negado', 'Apenas administradores podem adicionar produtos.');
      router.replace('/catalogo');
    }
  }, [isAdmin]);

  const escolherImagem = async () => {
    let resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false, 
      quality: 1,
    });

    if (!resultado.canceled) {
      const uriOriginal = resultado.assets[0].uri;

      try {
        const imagemComprimida = await ImageManipulator.manipulateAsync(
          uriOriginal,
          [],
          { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
        );

        setImagemUri(imagemComprimida.uri);
      } catch (error) {
        console.error("Erro ao comprimir imagem:", error);
        Alert.alert("Erro", "Não foi possível processar a imagem.");
      }
    }
  };

  const handleSalvar = async () => {
    if (!codigo || !descricao || !preco || !estoque) {
      Alert.alert('Atenção', 'Preencha todos os campos obrigatórios.');
      return;
    }

    setSalvando(true);
    const precoFormatado = preco.replace(',', '.');
    
    const urlApi = 'https://www.jbbc.com.br/api_merchapp/adicionar.php'; 

    const dadosFormulario = new FormData();
    dadosFormulario.append('codigo', codigo.trim());
    dadosFormulario.append('descricao', descricao.toUpperCase());
    dadosFormulario.append('preco', precoFormatado);
    dadosFormulario.append('estoque', estoque);

    if (imagemUri) {
      dadosFormulario.append('imagem', {
        uri: imagemUri,
        name: `${codigo}.jpg`,
        type: 'image/jpeg',
      } as any);
    }

    try {
      const resposta = await fetch(urlApi, {
        method: 'POST',
        body: dadosFormulario,
        headers: {
          'Accept': 'application/json',
        }
      });

      const json = await resposta.json();

      if (json.status === 'sucesso') {
        Alert.alert('Sucesso!', 'Produto cadastrado com sucesso!');
        router.replace('/catalogo'); 
      } else {
        Alert.alert('Erro', json.mensagem || 'Falha ao salvar no servidor.');
      }
      
    } catch (erro) {
      Alert.alert('Erro de Conexão', 'Não foi possível conectar ao servidor.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <Text style={styles.titulo}>Novo Produto</Text>
          <Text style={styles.subtitulo}>Preencha os dados para cadastrar no estoque</Text>
        </View>

        <View style={styles.formulario}>
          
          <View style={styles.areaFoto}>
            {imagemUri ? (
              <Image source={{ uri: imagemUri }} style={styles.previewFoto} resizeMode="cover" />
            ) : (
              <TouchableOpacity activeOpacity={0.7} style={styles.caixaSemFoto} onPress={escolherImagem}>
                <Text style={styles.iconeCamera}>📷</Text>
                <Text style={styles.textoSemFoto}>Toque para adicionar foto</Text>
              </TouchableOpacity>
            )}
            
            {imagemUri && (
              <TouchableOpacity style={styles.botaoFoto} onPress={escolherImagem}>
                <Text style={styles.textoBotaoFoto}>TROCAR FOTO</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Código do Produto</Text>
            <TextInput 
                style={styles.input} 
                value={codigo} 
                onChangeText={setCodigo} 
                placeholder="Ex: 12345" 
                keyboardType="numeric" 
                placeholderTextColor="#a0aec0" 
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Descrição do Produto</Text>
            <TextInput 
                style={styles.input} 
                value={descricao} 
                onChangeText={setDescricao} 
                placeholder="Ex: COQUETELEIRA AZUL" 
                placeholderTextColor="#a0aec0" 
            />
          </View>

          <View style={styles.linhaDupla}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.label}>Preço (R$)</Text>
              <TextInput 
                style={styles.input} 
                value={preco} 
                onChangeText={setPreco} 
                placeholder="0,00" 
                keyboardType="numeric" 
                placeholderTextColor="#a0aec0" 
            />
            </View>

            <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
              <Text style={styles.label}>Estoque (Un.)</Text>
              <TextInput 
                style={styles.input} 
                value={estoque} 
                onChangeText={setEstoque} 
                placeholder="0" 
                keyboardType="numeric" 
                placeholderTextColor="#a0aec0" 
            />
            </View>
          </View>

          <View style={styles.botoesContainer}>
            <TouchableOpacity style={styles.botaoCancelar} onPress={() => router.back()} disabled={salvando}>
              <Text style={styles.textoBotaoCancelar}>CANCELAR</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.botaoSalvar} onPress={handleSalvar} disabled={salvando}>
              {salvando ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.textoBotaoSalvar}>SALVAR PRODUTO</Text>
              )}
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f7f6' },
  
  header: { alignItems: 'center', marginTop: 40, marginBottom: 20 },
  titulo: { fontSize: 26, fontWeight: '900', color: '#1a202c' },
  subtitulo: { fontSize: 14, color: '#718096', marginTop: 4 },

  formulario: { 
    backgroundColor: '#fff', 
    marginHorizontal: 20, 
    padding: 25, 
    borderRadius: 20, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3, 
    marginBottom: 40 
  },
  
  areaFoto: { alignItems: 'center', marginBottom: 25 },
  previewFoto: { width: 150, height: 150, borderRadius: 16, marginBottom: 15, backgroundColor: '#edf2f7' }, 
  caixaSemFoto: { 
    width: 150, 
    height: 150, 
    borderRadius: 16, 
    backgroundColor: '#f8fafc', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 10, 
    borderWidth: 2, 
    borderColor: '#e2e8f0', 
    borderStyle: 'dashed' 
  },
  iconeCamera: { fontSize: 32, marginBottom: 8 },
  textoSemFoto: { fontSize: 12, color: '#a0aec0', fontWeight: '600', textAlign: 'center', paddingHorizontal: 10 },
  
  botaoFoto: { backgroundColor: '#e2e8f0', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 }, 
  textoBotaoFoto: { color: '#4a5568', fontWeight: 'bold', fontSize: 12 },
  
  inputGroup: { marginBottom: 18 },
  label: { fontSize: 13, fontWeight: 'bold', color: '#4a5568', marginBottom: 8, marginLeft: 4 },
  input: { 
    borderWidth: 1, 
    borderColor: '#e2e8f0', 
    borderRadius: 12, 
    height: 50, 
    paddingHorizontal: 15, 
    fontSize: 16, 
    backgroundColor: '#f8fafc',
    color: '#2d3748'
  },
  
  linhaDupla: { flexDirection: 'row', justifyContent: 'space-between' },

  botoesContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 },
  
  botaoCancelar: { 
    flex: 1, 
    backgroundColor: '#fff', 
    padding: 15, 
    borderRadius: 12, 
    alignItems: 'center', 
    marginRight: 10,
    borderWidth: 1, 
    borderColor: '#cbd5e0'
  },
  textoBotaoCancelar: { color: '#718096', fontWeight: 'bold', fontSize: 15 },
  
  botaoSalvar: { 
    flex: 1, 
    backgroundColor: '#007BFF', 
    padding: 15, 
    borderRadius: 12, 
    alignItems: 'center', 
    marginLeft: 10,
    shadowColor: '#007BFF',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4
  },
  textoBotaoSalvar: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});