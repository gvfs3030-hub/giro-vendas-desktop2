# Relatório de revisão — Giro Vendas Desktop

## Problemas encontrados no projeto original

1. O workflow usava Node 20, enquanto o projeto está em React Native 0.84. O RN 0.84 exige Node.js 22.11 ou superior.
2. O runner não fixava explicitamente uma imagem com Visual Studio compatível com RNW 0.84.
3. A build original não forçava `ReleaseBundle`; isso é relevante quando a finalidade é obter uma saída standalone que não dependa do Metro.
4. O caminho da fonte Windows em `src/platform/icons.tsx` estava sem o `/` inicial usado pela referência de fonte do RNVI para Windows.
5. A fonte `Ionicons.ttf` não estava presente no repositório nem havia etapa determinística para colocá-la no projeto Windows gerado.
6. O projeto não tinha `package-lock.json`, reduzindo a reprodutibilidade das instalações por npm.
7. O ZIP original não continha uma pasta `windows/`; o workflow precisava, portanto, gerar a parte nativa antes da compilação.

## Alterações aplicadas

- Node mínimo atualizado para `22.11.0`.
- Dependências diretas ajustadas para versões exatas já declaradas, reduzindo variação durante `npm install`.
- Workflow atualizado para `windows-2025-vs2026`.
- Workflow com `init-windows --template cpp-app --overwrite`.
- Workflow com `autolink-windows`.
- Build configurada para x64 + ReleaseBundle.
- Adicionado `tools/prepare-windows-assets.js`.
- Ionicons copiado para `windows/GiroVendasDesktop/Assets/Ionicons.ttf` durante o build.
- Ionicons registrado no `.vcxproj` como `DeploymentContent`.
- Checksums SFNT do TTF recalculados na cópia usada no Windows.
- `src/platform/icons.tsx` usa `/Assets/Ionicons.ttf#Ionicons` no Windows.
- `react-native.config.js` impede autolinking desnecessário do `react-native-vector-icons` nativo no Windows; o app usa apenas os dados do pacote e a fonte local.
- Artifact reorganizado em uma pasta portátil e compactado como `GiroVendasDesktop-Windows-x64.zip`.
- Workflow falha explicitamente se o executável principal não for encontrado.

## Validação feita

- JSON de `package.json` validado.
- Sintaxe JavaScript de `tools/patch-rnfs.js` validada.
- Sintaxe JavaScript de `tools/prepare-windows-assets.js` validada.
- Sintaxe YAML do workflow validada.
- Imports principais revisados sem sinais de dependências Expo/Expo Router em runtime; o projeto usa camadas desktop próprias.

## Limitação da validação

A compilação final não foi executada neste ambiente porque a revisão acontece em Linux e o build RNW exige runner Windows/MSBuild. A etapa de instalação npm local também não conseguiu concluir dentro do ambiente de inspeção. Portanto, o pacote entregue contém o workflow corrigido para que a compilação real aconteça no GitHub Actions.
