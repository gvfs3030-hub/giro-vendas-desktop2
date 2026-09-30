# Giro Vendas — Desktop (Windows)

Este repositório contém a versão Windows do Giro Vendas usando React Native 0.84 + React Native for Windows 0.84.

## Build pelo GitHub Actions

O caminho principal deste projeto é compilar pelo próprio GitHub, sem precisar instalar Visual Studio localmente.

1. Suba o conteúdo deste projeto para um repositório do GitHub.
2. Abra a aba **Actions**.
3. Selecione **Build Windows App**.
4. Clique em **Run workflow**.
5. Quando terminar, abra a execução concluída e baixe o artifact **GiroVendasDesktop-Windows-x64**.

O artifact contém:

- `GiroVendasDesktop-Windows-x64.zip`: build portátil com `GiroVendasDesktop.exe` e as DLLs/arquivos que acompanham o executável.
- `packages/`: somente quando a geração do projeto produzir um pacote `.msix`/`.appx`.

### Ambiente usado pelo workflow

O workflow usa a imagem `windows-2025-vs2026`, Node 22.11.0 e SDK do Windows disponível no runner. Isso é intencional: React Native 0.84 exige Node.js 22.11 ou superior, e React Native Windows 0.84 requer Visual Studio 2026.

### Por que o build usa ReleaseBundle?

`ReleaseBundle` gera a versão standalone, com o bundle JavaScript dentro da saída nativa, para o aplicativo não depender do Metro em execução.

## Ícones

O projeto usa o mapa de glifos de Ionicons e desenha o caractere diretamente em `<Text>`. Durante a preparação do build:

- `Ionicons.ttf` é copiado de `react-native-vector-icons` para `windows/GiroVendasDesktop/Assets/`.
- O arquivo é incluído no projeto nativo como conteúdo de deployment.
- Os checksums SFNT do TTF são recalculados na cópia utilizada pelo Windows.
- O URI Windows usado pelo app é `/Assets/Ionicons.ttf#Ionicons`.

## Banco, PDFs e arquivos

A camada `src/platform/` mantém as partes específicas do Windows isoladas:

- `sqlJsEngine.ts`: SQLite via `sql.js`, sem módulo nativo.
- `pdfBuilders.ts` e `printing.ts`: PDF via `pdf-lib`.
- `fs.ts`: persistência em disco via `@dr.pogodin/react-native-fs`.
- `icons.tsx`: Ionicons usando fonte local.

## Observação

A build nativa do Windows precisa acontecer em um runner Windows com Visual Studio/SDK compatíveis; o ambiente Linux usado para revisar este arquivo não consegue executar o MSBuild do projeto Windows. A validação feita aqui foi estrutural/estática, além da conferência com a documentação oficial do RN/RNW.

## Comandos locais no Windows

Depois de `npm install`:

```powershell
npm run prepare-windows-assets
npm run windows
```

Para recriar a pasta `windows/` do zero:

```powershell
Remove-Item -Recurse -Force windows
npx react-native init-windows --template cpp-app --overwrite --no-telemetry
npm run prepare-windows-assets
npm run windows
```
