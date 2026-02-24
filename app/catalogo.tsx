// app/catalogo.tsx
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useContext, useState } from 'react'; // ✅ Adicionado useCallback
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import CardProduto from '../components/CardProduto';
import { ProdutoContext } from '../context/ProdutoContext';

export default function CatalogoScreen() {
  const router = useRouter();
  const { isAdmin } = useContext(ProdutoContext);

  const [produtos, setProdutos] = useState<any[]>([]);
  const [totalProdutos, setTotalProdutos] = useState(0);
  const [pesquisa, setPesquisa] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [carregandoMais, setCarregandoMais] = useState(false);
  const [pagina, setPagina] = useState(1);
  const [fimDosDados, setFimDosDados] = useState(false);
  
  const [cacheBuster, setCacheBuster] = useState(new Date().getTime());

  useFocusEffect(
    useCallback(() => {
      if (isAdmin !== null && isAdmin !== undefined) {
        buscarProdutos(1, true);
      }
    }, [isAdmin])
  );

  const buscarProdutos = async (numeroPagina = 1, recarregar = false) => {
    if (fimDosDados && !recarregar) return;

    try {
      const limite = 20;
      
      const url = `https://www.jbbc.com.br/api_merchapp/produtos.php?pagina=${numeroPagina}&limite=${limite}&busca=${pesquisa}&t=${new Date().getTime()}`;
      
      const resposta = await fetch(url);
      const json = await resposta.json();

      if (json.status === 'sucesso') {
        setTotalProdutos(json.total || 0);

        if (json.dados.length < limite) {
          setFimDosDados(true); 
        }

        if (recarregar) {
          setProdutos(json.dados);
          setCacheBuster(new Date().getTime());
        } else {
          setProdutos([...produtos, ...json.dados]);
        }
      }
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
    } finally {
      setCarregando(false);
      setCarregandoMais(false);
    }
  };

  const executarPesquisa = () => {
    setPagina(1);
    setFimDosDados(false);
    setCarregando(true);
    buscarProdutos(1, true);
  };

  const carregarMais = () => {
    if (!carregandoMais && !fimDosDados) {
      setCarregandoMais(true);
      const novaPagina = pagina + 1;
      setPagina(novaPagina);
      buscarProdutos(novaPagina);
    }
  };

  const onRefresh = () => {
    setPesquisa('');
    setFimDosDados(false);
    setPagina(1);
    setCarregando(true);
    setTimeout(() => buscarProdutos(1, true), 100); 
  };

  if (carregando && pagina === 1) {
    return (
      <View style={styles.centralizado}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.tituloHeader}>Catálogo Merchandising</Text>
          <Text style={styles.subtituloHeader}>
            {pesquisa === '' ? `${totalProdutos} no estoque` : `${totalProdutos} resultados encontrados`}
          </Text>
        </View>

        <View style={styles.containerPesquisa}>
          <TextInput 
            style={styles.inputPesquisa}
            placeholder="Pesquisar no estoque"
            placeholderTextColor="#888"
            value={pesquisa}
            onChangeText={setPesquisa}
            onSubmitEditing={executarPesquisa} 
            returnKeyType="search" 
          />
          
          <TouchableOpacity style={styles.botaoLupa} onPress={executarPesquisa}>
            <Text style={styles.iconeLupa}>🔍</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={produtos}
        keyExtractor={(item, index) => item?.codigo ? String(item.codigo) : String(index)}
        renderItem={({ item }) => (
            <CardProduto 
                produto={{
                    ...item,
                    imagem: item.imagem ? `${item.imagem}?t=${cacheBuster}` : null
                }} 
            />
        )}
        numColumns={2} 
        columnWrapperStyle={styles.linhaGrid} 
        onEndReached={carregarMais}
        onEndReachedThreshold={0.5} 
        refreshControl={<RefreshControl refreshing={carregando} onRefresh={onRefresh} />}
        ListFooterComponent={carregandoMais ? <ActivityIndicator size="small" color="#007BFF" style={styles.footerLoading} /> : null}
        contentContainerStyle={styles.listaPadding}
        ListEmptyComponent={
          !carregando ? <Text style={styles.textoVazio}>Nenhum produto encontrado.</Text> : null
        }
      />

      {isAdmin && (
        <TouchableOpacity 
          style={styles.fab} 
          activeOpacity={0.8}
          onPress={() => router.push('/novo-produto' as any)}
        >
          <Text style={styles.fabIcon}>+</Text>
        </TouchableOpacity>
      )}
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8' },
  centralizado: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 50, 
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    elevation: 4,
    zIndex: 10,
  },
  headerTop: {
    alignItems: 'center',
    marginBottom: 15,
  },
  tituloHeader: { fontSize: 22, fontWeight: '900', color: '#1a1a1a', textAlign: 'center' },
  subtituloHeader: { fontSize: 13, color: '#666', marginTop: 2, textAlign: 'center' },
  
  containerPesquisa: {
    flexDirection: 'row', 
    backgroundColor: '#f1f3f5',
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 45,
    alignItems: 'center', 
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  inputPesquisa: { 
    flex: 1, 
    fontSize: 15, 
    color: '#333' 
  },
  botaoLupa: {
    paddingLeft: 10,
    paddingVertical: 5,
  },
  iconeLupa: {
    fontSize: 20,
  },

  linhaGrid: { justifyContent: 'space-between', paddingHorizontal: 15 }, 
  listaPadding: { paddingVertical: 15, paddingBottom: 100 }, 
  footerLoading: { marginVertical: 20 },
  textoVazio: { textAlign: 'center', marginTop: 50, color: '#888', fontSize: 16 },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 25,
    backgroundColor: '#007BFF',
    width: 65,
    height: 65,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    zIndex: 20,
  },
  fabIcon: { color: '#fff', fontSize: 34, fontWeight: '300', lineHeight: 36 }
});
