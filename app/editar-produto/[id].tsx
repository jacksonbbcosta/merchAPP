// app/editar-produto/[id].tsx
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
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.8,
    });
    if (!resultado.canceled) setNovaImagemUri(resultado.assets[0].uri);
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
      const resposta = await fetch(urlApi, { method: 'POST', body: dadosFormulario });
      const json = await resposta.json();

      if (json.status === 'sucesso') {
        Alert.alert('Sucesso!', 'Produto atualizado.');
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

  // FUNÇÃO DE EXCLUSÃO
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
      <ScrollView style={styles.container}>
        <Text style={styles.titulo}>Editar Produto</Text>

        <View style={styles.formulario}>
          
          <View style={styles.areaFoto}>
            {novaImagemUri ? (
              <Image source={{ uri: novaImagemUri }} style={styles.previewFoto} resizeMode="cover" />
            ) : imagemAtual ? (
              <Image source={{ uri: `${imagemAtual}?t=${new Date().getTime()}` }} style={styles.previewFoto} resizeMode="cover" />
            ) : (
              <View style={styles.caixaSemFoto}><Text style={styles.textoSemFoto}>Sem Foto</Text></View>
            )}
            
            <TouchableOpacity style={styles.botaoFoto} onPress={escolherImagem}>
              <Text style={styles.textoBotaoFoto}>TROCAR FOTO</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Código do Produto (Não editável)</Text>
          <TextInput style={[styles.input, styles.inputBloqueado]} value={id as string} editable={false} />

          <Text style={styles.label}>Descrição do Produto</Text>
          <TextInput style={styles.input} value={descricao} onChangeText={setDescricao} />

          <Text style={styles.label}>Preço Unitário (Use vírgula)</Text>
          <TextInput style={styles.input} value={preco} onChangeText={setPreco} keyboardType="numeric" />

          <Text style={styles.label}>Quantidade em Estoque</Text>
          <TextInput style={styles.input} value={estoque} onChangeText={setEstoque} keyboardType="numeric" />

          <View style={styles.botoesContainer}>
            <TouchableOpacity style={styles.botaoCancelar} onPress={() => router.back()} disabled={salvando}>
              <Text style={styles.textoBotaoCancelar}>CANCELAR</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.botaoSalvar} onPress={handleSalvar} disabled={salvando}>
              <Text style={styles.textoBotaoSalvar}>{salvando ? 'SALVANDO...' : 'SALVAR'}</Text>
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
  container: { flex: 1, backgroundColor: '#f0f4f8' },
  centralizado: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  titulo: { fontSize: 24, fontWeight: 'bold', color: '#333', marginTop: 30, marginBottom: 20, textAlign: 'center' },
  formulario: { backgroundColor: '#fff', marginHorizontal: 20, padding: 20, borderRadius: 15, elevation: 3, marginBottom: 30 },
  areaFoto: { alignItems: 'center', marginBottom: 20 },
  previewFoto: { width: 140, height: 200, borderRadius: 10, marginBottom: 10 }, 
  caixaSemFoto: { width: 140, height: 200, borderRadius: 10, backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: '#ccc', borderStyle: 'dashed' },
  textoSemFoto: { fontSize: 12, color: '#888' },
  botaoFoto: { backgroundColor: '#FFC107', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8 }, 
  textoBotaoFoto: { color: '#000', fontWeight: 'bold', fontSize: 12 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#555', marginBottom: 5 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, height: 45, paddingHorizontal: 15, marginBottom: 20, fontSize: 16, backgroundColor: '#fafafa' },
  inputBloqueado: { backgroundColor: '#e9ecef', color: '#6c757d' }, 
  botoesContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  botaoCancelar: { flex: 1, backgroundColor: '#ddd', padding: 15, borderRadius: 8, alignItems: 'center', marginRight: 10 },
  textoBotaoCancelar: { color: '#555', fontWeight: 'bold', fontSize: 16 },
  botaoSalvar: { flex: 1, backgroundColor: '#28a745', padding: 15, borderRadius: 8, alignItems: 'center', marginLeft: 10 },
  textoBotaoSalvar: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  
  botaoExcluir: { backgroundColor: '#dc3545', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 25 },
  textoBotaoExcluir: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});