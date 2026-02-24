// app/editar-produto/[id].tsx
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ProdutoContext } from '../../context/ProdutoContext';

export default function EditarProdutoScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); 
  const { isAdmin } = useContext(ProdutoContext);

  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState('');
  const [estoque, setEstoque] = useState('');
  const [imagemAtual, setImagemAtual] = useState<string | null>(null);
  const [novaImagemUri, setNovaImagemUri] = useState<string | null>(null);
  
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (isAdmin === false || isAdmin === null) {
      Alert.alert('Acesso Negado', 'Apenas administradores podem editar.');
      router.replace('/catalogo');
    }
  }, [isAdmin]);

  useEffect(() => {
    const carregarProduto = async () => {
      try {
        const url = `https://www.jbbc.com.br/api_merchapp/produtos.php?busca=${id}&t=${new Date().getTime()}`;
        const resposta = await fetch(url);
        const json = await resposta.json();

        if (json.status === 'sucesso') {
          const produtoEncontrado = json.dados.find((p: any) => String(p.codigo) === String(id));
          
          if (produtoEncontrado) {
            setDescricao(produtoEncontrado.descricao || '');
            setPreco(produtoEncontrado.preco ? String(produtoEncontrado.preco).replace('.', ',') : '');
            setEstoque(produtoEncontrado.estoque ? String(produtoEncontrado.estoque) : '');
            setImagemAtual(produtoEncontrado.imagem);
          } else {
            Alert.alert('Erro', 'Produto não encontrado.');
            router.back();
          }
        }
      } catch (error) {
        Alert.alert('Erro', 'Falha ao carregar os dados.');
      } finally {
        setCarregando(false);
      }
    };

    if (id && isAdmin) carregarProduto();
  }, [id, isAdmin]);

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

        setNovaImagemUri(imagemComprimida.uri);
      } catch (error) {
        console.error("Erro ao comprimir imagem:", error);
        Alert.alert("Erro", "Não foi possível processar a imagem.");
      }
    }
  };
  const handleSalvar = async () => {
    if (!descricao || !preco || !estoque) {
      Alert.alert('Atenção', 'Preencha todos os campos obrigatórios.');
      return;
    }

    setSalvando(true);
    const precoFormatado = preco.replace(',', '.');
    const urlApi = 'https://www.jbbc.com.br/api_merchapp/editar.php';

    const dadosFormulario = new FormData();
    dadosFormulario.append('codigo', id as string);
    dadosFormulario.append('descricao', descricao.toUpperCase());
    dadosFormulario.append('preco', precoFormatado);
    dadosFormulario.append('estoque', estoque);
    if (novaImagemUri) {
      dadosFormulario.append('imagem', {
        uri: novaImagemUri,
        name: `${id}.jpg`,
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
        Alert.alert('Sucesso!', 'Produto atualizado.');
        router.replace('/catalogo');
      } else {
        Alert.alert('Erro', json.mensagem || 'Erro desconhecido no servidor.');
      }
    } catch (erro) {
      Alert.alert('Erro', 'Não foi possível comunicar com o servidor.');
    } finally {
      setSalvando(false);
    }
  };
  const confirmarExclusao = async () => {
    setSalvando(true);
    const urlApi = 'https://www.jbbc.com.br/api_merchapp/excluir.php';
    const form = new FormData();
    form.append('codigo', id as string);

    try {
      const resposta = await fetch(urlApi, { method: 'POST', body: form });
      const json = await resposta.json();
      if (json.status === 'sucesso') {
        Alert.alert('Excluído', 'Produto removido do sistema.');
        router.replace('/catalogo');
      } else {
        Alert.alert('Erro', json.mensagem);
      }
    } catch (erro) {
      Alert.alert('Erro', 'Não foi possível comunicar com o servidor.');
    } finally {
      setSalvando(false);
    }
  };

  const handleExcluir = () => {
    Alert.alert(
      'Atenção',
      'Tem certeza que deseja EXCLUIR este produto? A foto e os dados serão apagados permanentemente.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sim, Excluir', onPress: confirmarExclusao, style: 'destructive' }
      ]
    );
  };

  if (carregando) {
    return (
      <View style={styles.centralizado}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <Text style={styles.titulo}>Editar Produto</Text>
          <Text style={styles.subtitulo}>Atualize as informações do estoque</Text>
        </View>

        <View style={styles.formulario}>
          
          <View style={styles.areaFoto}>
            
            {novaImagemUri ? (
              <Image source={{ uri: novaImagemUri }} style={styles.previewFoto} resizeMode="cover" />
            ) : imagemAtual ? (
              <Image source={{ uri: `${imagemAtual}?t=${new Date().getTime()}` }} style={styles.previewFoto} resizeMode="cover" />
            ) : (
              <View style={styles.caixaSemFoto}>
                 <Text style={styles.iconeCamera}>📷</Text>
                 <Text style={styles.textoSemFoto}>Sem Foto</Text>
              </View>
            )}
            
            <TouchableOpacity style={styles.botaoFoto} onPress={escolherImagem}>
              <Text style={styles.textoBotaoFoto}>TROCAR FOTO</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Código do Produto (Não editável)</Text>
            <TextInput style={[styles.input, styles.inputBloqueado]} value={id as string} editable={false} />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Descrição do Produto</Text>
            <TextInput style={styles.input} value={descricao} onChangeText={setDescricao} placeholderTextColor="#a0aec0" />
          </View>

          <View style={styles.linhaDupla}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.label}>Preço (R$)</Text>
              <TextInput style={styles.input} value={preco} onChangeText={setPreco} keyboardType="numeric" placeholderTextColor="#a0aec0" />
            </View>

            <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
              <Text style={styles.label}>Estoque (Un.)</Text>
              <TextInput style={styles.input} value={estoque} onChangeText={setEstoque} keyboardType="numeric" placeholderTextColor="#a0aec0" />
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
                <Text style={styles.textoBotaoSalvar}>SALVAR</Text>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.botaoExcluir} onPress={handleExcluir} disabled={salvando}>
            <Text style={styles.textoBotaoExcluir}>🗑️ EXCLUIR PRODUTO</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f7f6' },
  centralizado: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f4f7f6' },
  
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
  inputBloqueado: { 
    backgroundColor: '#edf2f7', 
    color: '#a0aec0',
    borderColor: '#edf2f7'
  },
  
  linhaDupla: { flexDirection: 'row', justifyContent: 'space-between' },

  botoesContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 },
  
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

  botaoExcluir: { 
    backgroundColor: '#fff', 
    padding: 15, 
    borderRadius: 12, 
    alignItems: 'center', 
    marginTop: 25,
    borderWidth: 1,
    borderColor: '#fc8181'
  },
  textoBotaoExcluir: { color: '#e53e3e', fontWeight: 'bold', fontSize: 15 },
});
