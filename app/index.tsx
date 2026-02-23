// app/index.tsx
import { useRouter } from 'expo-router';
import React, { useContext, useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProdutoContext } from '../context/ProdutoContext';

export default function LoginScreen() {
  const router = useRouter();
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  
  const { setIsAdmin } = useContext(ProdutoContext);

  const handleLogin = () => {
    const userDigitado = usuario.toLowerCase().trim();

    if (userDigitado === 'admin' && senha === 'admin') {
      setIsAdmin(true);
      router.replace('/catalogo');
    } 
    else if (userDigitado === 'user' && senha === 'user') {
      setIsAdmin(false);
      router.replace('/catalogo');
    } 
    else {
      Alert.alert(
        'Acesso Negado', 
        'Usuário ou senha incorretos.\n\nDica: Use admin/admin ou user/user'
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        
        <View style={styles.logoContainer}>
          <View style={styles.iconeLogo}>
            <Image 
              source={require('../assets/images/icon.png')} 
              style={styles.imagemLogo} 
              resizeMode="contain"
            />
          </View>
          <Text style={styles.tituloApp}>MerchApp</Text>
          <Text style={styles.subtituloApp}>Catálogo & Estoque</Text>
        </View>

        <View style={styles.cardLogin}>
          <Text style={styles.tituloLogin}>Bem-vindo de volta!</Text>
          <Text style={styles.subtituloLogin}>Faça login para acessar o sistema</Text>

          <TextInput 
            style={styles.input} 
            placeholder="👤  Usuário" 
            placeholderTextColor="#999"
            value={usuario} 
            onChangeText={setUsuario} 
            autoCapitalize="none" 
          />
          
          <TextInput 
            style={styles.input} 
            placeholder="🔒  Senha" 
            placeholderTextColor="#999"
            value={senha} 
            onChangeText={setSenha} 
            secureTextEntry 
          />

          <TouchableOpacity style={styles.botao} onPress={handleLogin}>
            <Text style={styles.textoBotao}>ENTRAR</Text>
          </TouchableOpacity>

          <Text style={styles.textoDica}>Credenciais de teste: admin/admin ou user/user</Text>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#007BFF' },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  
  logoContainer: { alignItems: 'center', marginBottom: 25 },
  iconeLogo: { 
    backgroundColor: '#fff', 
    width: 80, 
    height: 80, 
    borderRadius: 40, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 15, 
    shadowColor: '#000', 
    shadowOpacity: 0.2, 
    shadowRadius: 10, 
    elevation: 5,
    overflow: 'hidden'
  },
  imagemLogo: { 
    width: 75, 
    height: 75, 
  },
  tituloApp: { fontSize: 32, fontWeight: '900', color: '#fff', letterSpacing: 1 },
  subtituloApp: { fontSize: 16, color: '#e0f0ff', fontWeight: '500', marginTop: 5 },

  cardLogin: { 
    backgroundColor: '#fff', 
    width: '100%', 
    maxWidth: 400,
    padding: 30, 
    borderRadius: 20, 
    shadowColor: '#000', 
    shadowOpacity: 0.15, 
    shadowRadius: 15, 
    elevation: 10,
    alignItems: 'center'
  },
  tituloLogin: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  subtituloLogin: { fontSize: 14, color: '#666', marginBottom: 25 },

  input: { 
    width: '100%', 
    backgroundColor: '#f8f9fa', 
    padding: 15, 
    borderRadius: 12, 
    marginBottom: 15, 
    borderWidth: 1, 
    borderColor: '#eee',
    fontSize: 16,
    color: '#333'
  },
  
  botao: { 
    width: '100%', 
    backgroundColor: '#007BFF', 
    padding: 15, 
    borderRadius: 12, 
    alignItems: 'center', 
    marginTop: 10,
    shadowColor: '#007BFF',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3
  },
  textoBotao: { color: '#fff', fontWeight: 'bold', fontSize: 16, letterSpacing: 0.5 },

  textoDica: { marginTop: 20, fontSize: 12, color: '#999', textAlign: 'center' }
});