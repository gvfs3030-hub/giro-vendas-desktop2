# Build Windows pelo navegador do GitHub

## 1. Colocar o projeto no GitHub

Extraia este ZIP e envie o **conteúdo da pasta do projeto** para um repositório GitHub. A estrutura precisa manter:

```text
.github/workflows/build-windows.yml
package.json
app.json
App.tsx
src/
app/
tools/
```

Não é necessário criar a pasta `windows/` manualmente.

## 2. Executar a compilação

No GitHub:

1. Abra **Actions**.
2. Abra **Build Windows App**.
3. Clique em **Run workflow**.
4. Aguarde a execução terminar.
5. Na página da execução, abra **Artifacts** e baixe **GiroVendasDesktop-Windows-x64**.

## 3. Dentro do artifact

Use:

```text
GiroVendasDesktop-Windows-x64.zip
```

Extraia o ZIP mantendo todos os arquivos que estiverem ao lado de `GiroVendasDesktop.exe`.

O executável não deve ser separado das DLLs e demais arquivos da pasta de saída nativa.

## 4. O que o workflow faz automaticamente

- instala Node.js 22.11.0;
- instala as dependências do `package.json`;
- aplica o ajuste necessário ao pacote `@dr.pogodin/react-native-fs` para o projeto RNW;
- recria a pasta `windows/` com o template C++/New Architecture do RNW;
- prepara a fonte Ionicons no projeto nativo;
- registra a fonte como conteúdo de deployment;
- executa o autolinking do Windows;
- compila x64 em `ReleaseBundle`, com o bundle JavaScript incluído;
- publica a pasta completa do executável como artifact;
- publica MSIX/AppX somente se algum pacote for gerado pelo processo.

## 5. Se a execução falhar

Abra a execução no GitHub e copie o trecho a partir do primeiro `Error:` ou `BUILD FAILED` para análise. O workflow já imprime Node, npm, .NET e MSBuild para facilitar o diagnóstico.
