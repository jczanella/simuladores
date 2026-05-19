# Diretrizes — Simuladores de Financiamento

## Visão geral do projeto

Aplicação web de simuladores de financiamento, publicada como PWA (Progressive Web App) no GitHub Pages. Funciona offline e pode ser instalada na tela inicial de celulares.

- **URL pública:** `https://jczanella.github.io/simuladores/`
- **Repositório:** `https://github.com/jczanella/simuladores`
- **Branch:** `main`
- **GitHub user:** `jczanella` / `juliozanella@gmail.com`

---

## Regra de publicação

**Toda alteração feita nos arquivos do projeto deve ser publicada no GitHub imediatamente após a conclusão**, seguindo o procedimento de deploy descrito abaixo. Não é necessário perguntar — publicar faz parte da tarefa.

**Exceção:** se o usuário pedir explicitamente para **não** publicar (ex: "quero homologar antes", "não faça o deploy agora"), salvar apenas localmente e aguardar confirmação.

---

## Estrutura de arquivos

```
Simuladores/
├── index.html              # Central de simuladores (menu principal)
├── CE_maisinovacao.html    # Simulador +Inovação (Linha CE / Construção BNDES)
├── textodeprotecao.txt     # Texto legal de proteção (usado em todos os simuladores)
├── manifest.json           # Configuração PWA (ícone, nome, cores)
├── sw.js                   # Service Worker (cache offline + atualização automática)
├── icon-192.png            # Ícone do app 192×192
├── icon-512.png            # Ícone do app 512×512
└── CLAUDE.md               # Este arquivo
```

---

## Regras de identidade / marca

- **Nunca** incluir "PME Máquinas" ou "PME Máquinas e Equipamentos" em nenhum texto visível, `<title>`, metadado ou comentário de código.
- O nome institucional correto nos títulos é apenas **"Simuladores"** ou o nome do simulador específico.
- Cor principal: `#1b3c6b` (azul escuro). Usar em headers, botões primários, cabeçalhos de tabela.

---

## Design system

### Fontes
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```
Usar `font-family: 'Inter', Arial, sans-serif` em todo o body.  
Números em tabelas: sempre `font-variant-numeric: tabular-nums` para alinhamento correto das colunas.

### Variáveis CSS obrigatórias
```css
:root {
  --blue:       #1b3c6b;
  --blue-light: #2451a0;
  --blue-pale:  #e8eef7;
  --bg:         #f5f7fa;
  --card:       #ffffff;
  --text:       #1a1a2e;
  --text-soft:  #5a6377;
  --border:     #dde3ed;
  --radius:     14px;
  --shadow:     0 2px 8px rgba(27,60,107,.10);
}
```

### Tags PWA — obrigatórias no `<head>` de todo simulador
```html
<link rel="icon" type="image/png" href="icon-192.png">
<link rel="apple-touch-icon" href="icon-192.png">
<link rel="manifest" href="manifest.json">
<meta name="theme-color" content="#1b3c6b">
```

### Registro do Service Worker — obrigatório antes do `</body>`
```html
<script>
if('serviceWorker' in navigator){
  window.addEventListener('load',()=>{
    navigator.serviceWorker.register('/simuladores/sw.js');
  });
}
</script>
```

---

## Padrão de layout de cada simulador

### Header
```html
<header>
  <div class="header-text">
    <h1>Nome do Simulador</h1>
    <p>Descrição curta — Linha / Programa</p>
  </div>
  <a href="index.html" class="btn btn-ghost" style="padding:8px 14px;font-size:.82rem;">
    <svg viewBox="0 0 24 24"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
    Voltar ao Início
  </a>
</header>
```
- **Sem ícone SVG no header** dos simuladores individuais.
- Botão "Voltar ao Início" apenas no header (não duplicar no formulário).

### Botões
- `.btn-primary` — Simular (ação principal)
- `.btn-secondary` — Gerar PDF
- `.btn-ghost` — Voltar ao Início (no header)

---

## Lógica de cálculo financeiro (Linha CE — +Inovação)

> Estas fórmulas foram validadas contra o Excel oficial do banco (`MAIS INOVAÇÃO CE.xlsm`). Não alterar sem reverificar.

### Taxa de juros
```js
// Conversão entre taxas
function aaParaAm(aa){ return Math.pow(1+aa, 1/12) - 1; }
function amParaAa(am){ return Math.pow(1+am, 12) - 1; }

// Taxa padrão do programa (atualizar conforme circular do BNDES)
let taxaAnualReal  = 0.126;   // 12,6% a.a.
let taxaMensalReal = aaParaAm(taxaAnualReal);
```

### Fórmula de juros por período
```js
// Idêntica ao Excel: ROUND((1+taxa_anual)^(dias/diasAno) - 1, 6) × saldo
function diasNoAno(data) {
  let a = data.getFullYear();
  return (a % 4 === 0 && (a % 100 !== 0 || a % 400 === 0)) ? 366 : 365;
}
function jurosPeriodo(saldo, taxaAnual, dias, dataRef) {
  let dn   = diasNoAno(dataRef);
  let rate = Math.round((Math.pow(1 + taxaAnual, dias / dn) - 1) * 1e6) / 1e6;
  return round2(saldo * rate);
}
```
**Importante:** usar `taxaAnualReal` (não mensal) e `dataRef` = data do vencimento da parcela.

### Carência (+Inovação)
```js
// 1º vencimento = dia 15 do mesmo mês (se dia < 16) ou do próximo (se dia >= 16)
// Pagamento da carência = 1º vencimento + 3 meses
let mesesCarencia = base.getDate() < 16 ? 3 : 4;
let data0 = gerarData(base, mesesCarencia);

// Juros de carência = acumulado sobre TODOS os dias de carência (não só 1 período)
let dias0 = Math.floor((data0 - base) / 86400000);
let j0    = jurosPeriodo(saldo, taxaAnualReal, dias0, data0);
```

### Amortização SAC
```js
let parcelas = prazoV - 3;          // ex: 60 - 3 = 57
let amort    = round2(saldo / parcelas);
```

### Datas e feriados
```js
// Ajustar sempre para próximo dia útil (considera fins de semana + feriados nacionais)
function gerarData(base, mes) {
  let d = new Date(base);
  d.setMonth(d.getMonth() + mes);
  d.setDate(15);
  return proximoDiaUtil(d);  // ver lista FERIADOS abaixo
}
```
A lista `FERIADOS` (constante `Set`) cobre 2026–2031 e foi extraída do Excel oficial do banco. **Ao criar simuladores com prazo além de 2031, expandir a lista** consultando o Excel ou calendário ANBIMA.

---

## Campos de taxa — comportamento obrigatório
```js
// Exibe sempre em percentual (não em decimal)
taxaMes.value = format2(taxaMensalReal * 100);   // ex: "0,99"

// Ao entrar no campo: 6 casas decimais do percentual
taxaMes.onfocus = () => taxaMes.value = (taxaMensalReal * 100).toFixed(6).replace(".", ",");

// Ao sair: volta para 2 casas decimais
taxaMes.onblur = () => taxaMes.value = format2(taxaMensalReal * 100);

// Ao digitar: interpreta como percentual
taxaMes.oninput = () => {
  taxaMensalReal = parseBR(taxaMes.value) / 100;
  taxaAnualReal  = amParaAa(taxaMensalReal);
  taxaAno.value  = format2(taxaAnualReal * 100);
};
```

### Campos de Entrada (%) e Entrada (R$) — comportamento obrigatório

Os dois campos são bidirecionais. A **Linha CE / BNDES não permite percentual decimal** (ex: 10,1% → deve ser arredondado para 10%). O arredondamento acontece sempre no `onblur` (ao sair do campo), não durante a digitação — isso evita sobrescrever o campo enquanto o usuário ainda digita (problema crítico no celular).

```js
// Campo ENTRADA (%) → atualiza R$ enquanto digita; arredonda e sincroniza ao sair
percEntrada.oninput = () => {
  let p = parseFloat(percEntrada.value);
  if (p > 100) { percEntrada.value = 100; p = 100; }
  let v = parseBR(valor.value);
  if (!v || isNaN(p)) return;
  valorEntrada.value = format2(v * p / 100);
};
percEntrada.onblur = () => {
  let p = parseFloat(percEntrada.value);
  if (isNaN(p)) return;
  p = Math.min(Math.max(Math.round(p), 0), 100);  // arredonda para inteiro
  percEntrada.value = p;
  let v = parseBR(valor.value);
  if (v) valorEntrada.value = format2(v * p / 100);
};

// Campo ENTRADA (R$) → mostra % arredondado enquanto digita; sincroniza R$ ao sair
// IMPORTANTE: NÃO sobrescrever valorEntrada.value no oninput — quebra digitação no celular
valorEntrada.oninput = () => {
  let v = parseBR(valor.value);
  let e = parseBR(valorEntrada.value);
  if (!v || !e) { percEntrada.value = ''; return; }
  percEntrada.value = Math.min(Math.round(e / v * 100), 100);
};
valorEntrada.onblur = () => {
  let v = parseBR(valor.value);
  let e = parseBR(valorEntrada.value);
  if (!v || !e) return;
  let p = Math.min(Math.round(e / v * 100), 100);  // arredonda para inteiro
  percEntrada.value = p;
  valorEntrada.value = format2(v * p / 100);        // ajusta R$ para o % inteiro
};
```

---

## Padrão de tabela de simulação

### HTML
- `font-variant-numeric: tabular-nums` na tag `<table>`
- `<thead>` com background `var(--blue)`, texto branco
- Linhas zebradas: `tbody tr:nth-child(even)` com `#f8f9fc`
- Linha de carência (parcela 0): classe `carencia`, fundo `#fffbea`, texto âmbar
- `<tfoot>` com **6 células individuais** (sem `colspan`) alinhadas à sua coluna:
  ```html
  <tfoot>
    <tr>
      <td>—</td>         <!-- # -->
      <td>TOTAL</td>     <!-- Data -->
      <td>—</td>         <!-- Saldo -->
      <td>R$ X</td>      <!-- Amortização -->
      <td>R$ X</td>      <!-- Juros -->
      <td>R$ X</td>      <!-- Valor Parcela -->
    </tr>
  </tfoot>
  ```

### Texto de proteção
Sempre incluir após a tabela, lendo de `textodeprotecao.txt`. No HTML como div `.protecao`, no PDF como bloco "INFORMAÇÕES IMPORTANTES".

---

## Padrão de PDF (jsPDF + autoTable)

### Cabeçalho
Faixa azul estreita (8 mm) com:
- Esquerda: nome do simulador e linha/programa (bold)
- Direita: data e hora da simulação

```js
doc.setFillColor(27, 60, 107);
doc.rect(0, 0, W, 8, "F");
// título à esquerda, data à direita
```

### Bloco de parâmetros
Logo abaixo da faixa, fundo `#f8f9fc` com borda, 8 campos em 2 linhas × 4 colunas:
Valor do Bem | Entrada | Saldo Financiado | Prazo
Taxa de Juros | CET | Total de Juros | Total Pago

### Tabela
```js
// Coluna # pequena; 5 colunas restantes com largura IGUAL
const colNum  = 10;
const colRest = (W - marginL - marginR - colNum) / 5;

columnStyles: {
  0: { halign: "center", cellWidth: colNum  },
  1: { halign: "left",   cellWidth: colRest },  // Data
  2: { halign: "right",  cellWidth: colRest },  // Saldo
  3: { halign: "right",  cellWidth: colRest },  // Amortização
  4: { halign: "right",  cellWidth: colRest },  // Juros
  5: { halign: "right",  cellWidth: colRest, fontStyle: "bold" },  // Valor
}
```

### Linha de total no PDF
Última linha do `body` (não usar `foot` do autoTable). Estilizar via `didParseCell`:
```js
if (data.row.index === rows.length - 1) {
  data.cell.styles.fillColor = [27, 60, 107];
  data.cell.styles.textColor = [255, 255, 255];
  data.cell.styles.fontStyle = "bold";
}
```

### Tamanho condensado para caber em 2 páginas (prazo 60 meses)
- `fontSize: 6.8` nas células
- `cellPadding: 1.8`
- Faixa + bloco de parâmetros: ~42 mm antes da tabela

---

## Adicionando um novo simulador

### 1. Criar o arquivo HTML
Copiar `CE_maisinovacao.html` como base e adaptar:
- Atualizar `<title>`, nome no header e descrição
- Ajustar taxas, fórmulas e lógica de carência conforme o produto
- Manter todas as tags PWA e o registro do Service Worker

### 2. Atualizar `index.html`
Adicionar um card na seção correspondente:
```html
<a href="NOME_DO_ARQUIVO.html" class="card">
  <div class="card-icon">
    <svg viewBox="0 0 24 24"><!-- ícone SVG --></svg>
  </div>
  <strong>Nome do Simulador</strong>
  <span>Descrição curta</span>
</a>
```

### 3. Atualizar `sw.js`
Adicionar o novo arquivo à lista `ARQUIVOS` para que fique disponível offline:
```js
const ARQUIVOS = [
  '/simuladores/',
  '/simuladores/index.html',
  '/simuladores/CE_maisinovacao.html',
  '/simuladores/NOVO_SIMULADOR.html',  // ← adicionar aqui
  '/simuladores/manifest.json',
  '/simuladores/icon-192.png',
  '/simuladores/icon-512.png',
];
```
> **Importante:** sempre que mudar `sw.js`, o nome `CACHE` **não precisa** ser alterado — o browser detecta automaticamente qualquer mudança no arquivo.

---

## Deploy no GitHub

```powershell
# 1. Clonar
git clone https://github.com/jczanella/simuladores.git C:\Users\User\temp_gh_simuladores

# 2. Limpar e copiar arquivos
Get-ChildItem C:\Users\User\temp_gh_simuladores -Force |
  Where-Object { $_.Name -ne ".git" } | Remove-Item -Recurse -Force

# (copiar todos os arquivos da pasta local para o clone)

# 3. Commit e push
Set-Location C:\Users\User\temp_gh_simuladores
git add -A
git commit -m "Descrição das mudanças"
git push origin main

# 4. Limpar clone temporário
Set-Location C:\Users\User
cmd /c "rmdir /s /q C:\Users\User\temp_gh_simuladores"
```

**Arquivos que sempre devem ir para o repositório:**
`index.html`, `CE_maisinovacao.html`, `textodeprotecao.txt`, `manifest.json`, `sw.js`, `icon-192.png`, `icon-512.png` — e qualquer novo simulador criado.

O GitHub Pages publica automaticamente em até 2 minutos após o push.

---

## Utilitários JS reutilizáveis

```js
// Formatação
function parseBR(v)  { return Number((v||"").replace(/\./g,"").replace(",",".")||0); }
function round2(v)   { return Math.round(v * 100) / 100; }
function format2(v)  { return v.toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2}); }

// Máscara de campo monetário
function mask(el) {
  el.addEventListener("input", () => {
    let raw = el.value.replace(/\D/g, "");
    if (!raw) { el.value = ""; return; }
    el.value = Number(raw).toLocaleString("pt-BR");
  });
}

// CET pela TIR (Newton-Raphson)
function calcularCET(fluxo) {
  let taxa = 0.01;
  for (let k = 0; k < 100; k++) {
    let f = 0, df = 0;
    for (let t = 0; t < fluxo.length; t++) {
      f  += fluxo[t] / Math.pow(1 + taxa, t);
      df += -t * fluxo[t] / Math.pow(1 + taxa, t + 1);
    }
    let nt = taxa - f / df;
    if (Math.abs(nt - taxa) < 1e-7) break;
    taxa = nt;
  }
  return taxa;
}
// Uso: fluxo[0] = -saldo_financiado (negativo), fluxo[1..n] = parcelas pagas
// Retorna taxa mensal → cetAnual = Math.pow(1 + cetMensal, 12) - 1
```
