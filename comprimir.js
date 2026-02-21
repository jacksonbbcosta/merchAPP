const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Defina as pastas de entrada e saída
// Se suas fotos estiverem em outra pasta, é só mudar o nome aqui embaixo:
const pastaEntrada = './assets/imagens/produtos'; 
const pastaSaida = './assets/imagens_comprimidas';

// Cria a pasta de saída se ela não existir
if (!fs.existsSync(pastaSaida)) {
  fs.mkdirSync(pastaSaida, { recursive: true });
}

console.log('Iniciando compressão das imagens... 🚀');

fs.readdir(pastaEntrada, (err, arquivos) => {
  if (err) {
    return console.log('❌ Erro ao ler a pasta. Verifique se o caminho está certo:', err);
  }

  arquivos.forEach(arquivo => {
    const caminhoEntrada = path.join(pastaEntrada, arquivo);
    const caminhoSaida = path.join(pastaSaida, arquivo);

    // Filtra apenas arquivos de imagem
    if (arquivo.match(/\.(jpg|jpeg|png)$/i)) {
      sharp(caminhoEntrada)
        .resize({ width: 800 }) // Limita a largura a 800px (ótimo para celular)
        .jpeg({ quality: 70 })  // Transforma em JPEG e reduz a qualidade para 70%
        .toFile(caminhoSaida.replace(/\.png$/i, '.jpg')) // Garante que a extensão final seja .jpg
        .then(() => console.log(`✅ Sucesso: ${arquivo}`))
        .catch(erro => console.log(`❌ Erro na imagem ${arquivo}:`, erro));
    }
  });
});