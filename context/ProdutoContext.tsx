// context/ProdutoContext.tsx
import React, { createContext, useState } from 'react';
import { PRODUTOS } from '../data/dadosProdutos';

export const ProdutoContext = createContext<any>(null);

export function ProdutoProvider({ children }: { children: React.ReactNode }) {
  const [produtos, setProdutos] = useState(PRODUTOS);
  
  // NOVO: Estado para saber se é Admin (verdadeiro) ou Usuário Normal (falso)
  const [isAdmin, setIsAdmin] = useState(false);

  const adicionarProduto = (novoProduto: any) => {
    setProdutos((listaAtual) => [novoProduto, ...listaAtual]);
  };

  const atualizarEstoque = (id: string, novoEstoque: number) => {
    setProdutos((listaAtual) =>
      listaAtual.map((produto) =>
        produto.id === id ? { ...produto, estoque: novoEstoque } : produto
      )
    );
  };

  // NOVO: Função para excluir o produto
  const excluirProduto = (id: string) => {
    setProdutos((listaAtual) => listaAtual.filter((produto) => produto.id !== id));
  };

  return (
    <ProdutoContext.Provider value={{ 
      produtos, 
      adicionarProduto, 
      atualizarEstoque, 
      excluirProduto, 
      isAdmin, 
      setIsAdmin // Passamos a função de login para o resto do app
    }}>
      {children}
    </ProdutoContext.Provider>
  );
}