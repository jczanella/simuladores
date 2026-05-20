# Diretrizes — Simuladores de Financiamento

## Diretriz de manutenção deste arquivo

**Sempre que surgir uma informação, orientação ou diretriz importante — seja descoberta durante o desenvolvimento, corrigida após verificação com o Excel oficial, ou fornecida explicitamente pelo usuário — atualizar este arquivo imediatamente, antes do deploy.** Este arquivo é a memória permanente do projeto e deve refletir o estado atual do conhecimento acumulado.

Exemplos do que deve ser salvo aqui:
- Regras de cálculo financeiro validadas contra o Excel do banco
- Diferenças de comportamento entre simuladores (ex: com/sem linha de carência)
- Correções de fórmulas ou lógica descobertas em sessões anteriores
- Padrões de UI/UX confirmados em produção

**Regra crítica — não inventar restrições:** Nunca assumir limites, mínimos, máximos ou comportamentos que não foram especificados pelo usuário ou encontrados no Excel oficial. Se não há base, perguntar antes de implementar.

---

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
├── CE_pronampce.html       # Simulador Pronamp CE (10% a.a., semestral/anual)
├── CE_cdccampanha.html     # Simulador CDC Campanha
├── textodeprotecao.txt     # Texto legal de proteção (usado em todos os simuladores)
├── manifest.json           # Configuração PWA (ícone, nome, cores)
├── sw.js                   # Service Worker (cache offline + atualização automática)
├── icon-192.png            # Ícone do app 192×192
├── icon-512.png            # Ícone do app 512×512
├── MAIS INOVAÇÃO CE.xlsm   # Excel oficial do banco — +Inovação (referência de cálculo)
├── Pronamp CE.xlsm         # Excel oficial do banco — Pronamp CE (referência de cálculo)
└── CLAUDE.md               # Este arquivo
```

---

## Regras de identidade / marca

- **Nunca** incluir "PME Máquinas" ou "PME Máquinas e Equipamentos" em nenhum texto visível, `<title>`, metadado ou comentário de código.
- O nome institucional correto nos títulos é apenas **"Simuladores"** ou o nome do simulador específico.
- Cor principal: `#1b3c6b` (azul escuro). Usar em headers, botões primários, cabeçalhos de tabela.

### Ícones dos cards (index.html)

Os ícones dos cards usam `fill:var(--blue)` — apenas formas sólidas, sem stroke. Para criar ícones reconhecíveis como silhuetas, sobrepor múltiplas formas simples (`<circle>`, `<rect>`, `<path>`) dentro do mesmo `<svg>`: como todas recebem o mesmo fill, as sobreposições se fundem num único blob de cor, formando a silhueta desejada.

Ícones definidos por simulador:
- **+Inovação** — prédio/construção: `<path d="M3 21V7l9-4 9 4v14H3zm2-2h4v-4H5v4zm6 0h4v-4h-4v4zm6 0h2v-4h-2v4zM5 13h4V9H5v4zm6 0h4V9h-4v4zm6 0h2V9h-2v4z"/>`
- **Pronamp CE** — trator (silhueta composta):
  ```html
  <circle cx="15.5" cy="16.5" r="4.5"/>   <!-- roda traseira -->
  <circle cx="5.5"  cy="17.5" r="2.5"/>   <!-- roda dianteira -->
  <path d="M3 11.5h14v5H3z"/>             <!-- chassi -->
  <path d="M9.5 6h6v6.5h-6z"/>            <!-- cabine -->
  <path d="M3.5 9.5h7v3h-7z"/>            <!-- capô -->
  <path d="M5 3.5h1.5v7H5z"/>             <!-- escapamento -->
  ```
- **CDC Campanha** — cifrão/dinheiro (existente no arquivo)

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

Os campos de taxa são **bidirecionais e sempre sincronizados**: alterar a taxa a.a. reflete na a.m. e vice-versa. Além dos inputs digitáveis, cada campo deve ter um `<select>` com as taxas pré-definidas do programa.

### Dropdown de taxas pré-definidas
```js
const TAXAS_AA = [0.126, 0.1598];  // taxas anuais disponíveis (12,60% e 15,98%)

// Popula ambos os selects dinamicamente; opções em mesma ordem (índice compartilhado)
TAXAS_AA.forEach((aa, i) => {
  selectAno.add(new Option(format2(aa*100)+'% a.a.', i));
  selectMes.add(new Option(format2(aaParaAm(aa)*100)+'% a.m.', i));
});

// Aplica taxa por índice — atualiza globals, inputs e ambos os selects
function applyTaxa(idx) {
  taxaAnualReal  = TAXAS_AA[idx];
  taxaMensalReal = aaParaAm(taxaAnualReal);
  taxaAno.value  = format2(taxaAnualReal * 100);
  taxaMes.value  = format2(taxaMensalReal * 100);
  selectAno.selectedIndex = idx;
  selectMes.selectedIndex = idx;
}
applyTaxa(0);  // padrão: primeira taxa da lista

selectAno.onchange = () => applyTaxa(parseInt(selectAno.value));
selectMes.onchange = () => applyTaxa(parseInt(selectMes.value));
```

### Inputs digitáveis (sincronização livre)
```js
// Ao digitar taxa a.m.: recalcula a.a.
taxaMes.oninput = () => {
  taxaMensalReal = parseBR(taxaMes.value) / 100;
  taxaAnualReal  = amParaAa(taxaMensalReal);
  taxaAno.value  = format2(taxaAnualReal * 100);
};
// Ao digitar taxa a.a.: recalcula a.m.
taxaAno.oninput = () => {
  taxaAnualReal  = parseBR(taxaAno.value) / 100;
  taxaMensalReal = aaParaAm(taxaAnualReal);
  taxaMes.value  = format2(taxaMensalReal * 100);
};

// Ao entrar: exibe 6 casas decimais para precisão
taxaMes.onfocus = () => taxaMes.value = (taxaMensalReal * 100).toFixed(6).replace(".", ",");
taxaAno.onfocus = () => taxaAno.value = (taxaAnualReal  * 100).toFixed(6).replace(".", ",");
// Ao sair: volta para 2 casas decimais
taxaMes.onblur = () => taxaMes.value = format2(taxaMensalReal * 100);
taxaAno.onblur = () => taxaAno.value = format2(taxaAnualReal  * 100);
```

### HTML dos campos de taxa
```html
<div class="field">
  <label>Taxa a.m. (%)</label>
  <select id="selectMes"></select>
  <div class="taxa-unit" style="margin-top:6px">
    <input id="taxaMes">
    <span>a.m.</span>
  </div>
</div>
<div class="field">
  <label>Taxa a.a. (%)</label>
  <select id="selectAno"></select>
  <div class="taxa-unit" style="margin-top:6px">
    <input id="taxaAno">
    <span>a.a.</span>
  </div>
</div>
```

**Regras:**
- O `<select>` fica **acima** do input no mesmo campo
- Selecionar no dropdown de a.a. atualiza automaticamente o dropdown e input de a.m. (e vice-versa)
- Ao digitar um valor livre nos inputs, o dropdown pode não refletir (fica no último valor selecionado) — isso é aceitável
- A taxa padrão ao abrir o simulador deve ser sempre a **primeira opção** de `TAXAS_AA`

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

## Lógica de cálculo financeiro (Linha CE — Pronamp CE)

> Fórmulas validadas contra o Excel oficial do banco (`Pronamp CE.xlsm`). Não alterar sem reverificar.

### Diferenças críticas em relação ao +Inovação

| Aspecto | +Inovação | Pronamp CE |
|---|---|---|
| Linha de carência | Sim — parcela 0 paga só juros, saldo não cai | **Não** — 1ª parcela já inclui amort + juros |
| Fórmula de juros | `ROUND(rate, 6) × saldo` | `saldo × ((1+taxa)^(dias/diasAno) − 1)` pura |
| Periodicidade | Mensal | Semestral (6 meses) ou Anual (12 meses) |
| Taxa | Variável (12,6% ou 15,98%) | Fixa: 10% a.a., não editável |
| Prazo máximo | 60 meses | 96 meses (carência + parcelas) |

### Taxa de juros
```js
const TAXA_ANUAL = 0.10;  // 10% a.a. fixa — não editável pelo usuário
```

### Fórmula de juros por período (SEM ROUND intermediário)
```js
// Idêntica ao Excel Pronamp CE: saldo × (1+taxa)^(dias/diasAno) − saldo
function jurosPeriodo(saldo, taxaAnual, dias, dataRef) {
  let dn = diasNoAno(dataRef);           // 365 ou 366 conforme ano do vencimento
  let rate = Math.pow(1+taxaAnual, dias/dn) - 1;  // sem ROUND intermediário
  return round2(saldo * rate);
}
```

### Número de parcelas e prazo total
```js
// Fórmula: floor((96 − carência) / período) + 1
// Ex: carência=12, anual → floor(84/12)+1 = 8 parcelas; última em mês 96
function calcNParcelas(mesesCar, periodoMeses) {
  return Math.floor((96 - mesesCar) / periodoMeses) + 1;
}
// Prazo total = mês do ÚLTIMO vencimento (≤ 96)
function calcPrazoTotal(mesesCar, periodoMeses) {
  return mesesCar + (calcNParcelas(mesesCar, periodoMeses) - 1) * periodoMeses;
}
```

### Geração de datas (Pronamp CE)
```js
// 1ª parcela: parte de base (hoje) + mesesCar meses
let data0 = gerarData(base, mesesCar);

// Parcelas seguintes: partem de data0 com múltiplos do período
// i=1 → gerarData(data0, 1×período), i=2 → gerarData(data0, 2×período) ...
// gerarData seta o dia para 15 e ajusta para próximo dia útil — igual ao +Inovação
```

**Por que partir de `data0` e não de `base` nas parcelas seguintes?**
Porque `gerarData` seta o dia para 15 após adicionar os meses. Usando `data0` como base, os meses se alinham corretamente para o dia 15 de cada vencimento, independente de ajustes de dia útil que possam ter deslocado `data0` para além do dia 15.

### Loop de simulação (sem linha de carência)
```js
let anterior = base;  // inicia em hoje (não em data0)

for (let i = 0; i < nParcelas; i++) {
  let dataAtual = (i === 0) ? data0 : gerarData(data0, i * periodoMeses);
  let dias = Math.floor((dataAtual - anterior) / 86400000);
  let juros = jurosPeriodo(saldo, TAXA_ANUAL, dias, dataAtual);
  let amortI = (i === nParcelas - 1) ? round2(saldo) : amort;  // última absorve arredondamento
  let parcela = round2(juros + amortI);
  // ... push na tabela, atualiza saldo, anterior = dataAtual
}
```

### Campos de entrada (Pronamp CE)
- **Carência**: selecionável 3–18 meses, padrão 12 meses. Primeiro vencimento = dia 15 (ou próximo dia útil), `mesesCar` meses após a data da simulação.
- **Prazo da Operação**: select de 1–8 anos, padrão 8 anos (sempre o máximo disponível). O mínimo é dinâmico: `ceil((mesesCar + periodoMeses) / 12)` — ou seja, o menor ano inteiro que comporta pelo menos 1 parcela. O select é reconstruído sempre que carência ou periodicidade mudam.
- **Periodicidade**: Anual (padrão) ou Semestral. O select deve listar Anual primeiro.
- **Taxa**: 10% a.a. fixa, campo `readonly`, não editável.
- **Não há pagamento separado de carência** — a 1ª parcela paga amortização + juros acumulados de toda a carência.

### CET com fluxo esparso (periodicidade não-mensal)
Para simuladores com pagamentos semestrais ou anuais, o fluxo para o CET é indexado por mês com zeros nos meses sem pagamento:

```js
let fluxo = new Array(prazoTotal + 1).fill(0);
fluxo[0] = -saldoInicial;

// Para cada parcela i (0-based):
fluxo[mesesCar + i * periodoMeses] += parcela;

// CET — Newton-Raphson, pulando meses zerados para eficiência
function calcularCET(fluxo) {
  let taxa = 0.01;
  for (let k = 0; k < 200; k++) {
    let f = 0, df = 0;
    for (let t = 0; t < fluxo.length; t++) {
      if (fluxo[t] === 0) continue;  // pula meses sem pagamento
      f  += fluxo[t] / Math.pow(1+taxa, t);
      df += -t * fluxo[t] / Math.pow(1+taxa, t+1);
    }
    if (Math.abs(df) < 1e-12) break;
    let nt = taxa - f / df;
    if (Math.abs(nt - taxa) < 1e-8) break;
    taxa = nt;
  }
  return taxa;
}
```

### Verificação contra o Excel (PowerShell COM)
Quando há dúvida sobre fórmulas, ler o Excel oficial diretamente via PowerShell:

```powershell
$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$excel.DisplayAlerts = $false
$wb = $excel.Workbooks.Open($path, 0, $true)  # somente leitura
$sheet = $wb.Sheets.Item("SIMULADOR")

# Ler células
$sheet.Cells.Item($row, $col).Text    # valor formatado
$sheet.Cells.Item($row, $col).Formula # fórmula

$wb.Close($false)
$excel.Quit()
[System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null
```

**Importante:** cada chamada PowerShell é uma nova sessão — abrir o workbook e ler os dados em um único bloco de comando.

---

## Adicionando um novo simulador

### 1. Criar o arquivo HTML
Escolher o template mais adequado como base:
- `CE_maisinovacao.html` — para simuladores mensais com linha de carência separada (só juros na carência)
- `CE_pronampce.html` — para simuladores semestrais/anuais sem linha de carência separada

Adaptar:
- Atualizar `<title>`, nome no header e descrição
- Ajustar taxas, fórmulas e lógica de carência conforme o produto
- Verificar os valores gerados contra o Excel oficial do banco antes do deploy
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
`index.html`, `CE_maisinovacao.html`, `CE_pronampce.html`, `CE_cdccampanha.html`, `textodeprotecao.txt`, `manifest.json`, `sw.js`, `icon-192.png`, `icon-512.png` — e qualquer novo simulador criado.

**Os arquivos `.xlsm` (Excel do banco) ficam apenas localmente** — não vão para o repositório GitHub.

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
