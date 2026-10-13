export type BlogImage = {
  src: string;
  alt: string;
  credit: string;
  creditUrl: string;
};

export type BlogSection = {
  heading: string;
  paragraphs: string[];
};

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  toolHref: string;
  toolLabel: string;
  publishedAt: string;
  readingMinutes: number;
  cover: BlogImage;
  sections: BlogSection[];
  keywords?: string[];
};

export type BlogMonthGroup = {
  key: string;
  label: string;
  posts: BlogPost[];
};

const cover = (slug: string) => `/blog/${slug}.jpg`;

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "do-figma-ao-cursor-mcp-oficial",
    title:
      "Do Figma ao Cursor: MCP Oficial, Configuração e o que Realmente Funciona na Prática",
    description:
      "Como conectar o Cursor ao MCP oficial da Figma para ler designs com contexto real (nodes, tokens, screenshots) e implementar telas fiéis ao layout — sem depender de prints ou de um MCP próprio.",
    toolHref: "/json",
    toolLabel: "Abrir formatador de JSON da devKit",
    publishedAt: "2026-08-25",
    readingMinutes: 8,
    keywords: [
      "mcp figma cursor",
      "mcp oficial figma",
      "configurar mcp cursor",
      "figma desktop mcp",
      "cursor ide figma",
      "model context protocol",
      "mcp.json cursor",
      "figma oauth mcp",
      "integração figma cursor",
      "get_design_context",
    ],
    cover: {
      src: cover("do-figma-ao-cursor-mcp-oficial"),
      alt: "Do Figma ao Cursor com MCP oficial da Figma",
      credit: "Neto Orlando / Medium",
      creditUrl:
        "https://medium.com/@orlandoneto23/do-figma-ao-cursor-mcp-oficial-configura%C3%A7%C3%A3o-e-o-que-realmente-funciona-na-pr%C3%A1tica-38bfcb86666e",
    },
    sections: [
      {
        heading: "Introdução",
        paragraphs: [
          "Nesses dias eu precisava que o Cursor lesse um arquivo inteiro do Figma e construísse todas as telas exatamente como estavam no design — sem eu precisar ficar enviando prints de cada atributo, cor ou espaçamento. Eu queria que esse processo fosse automático: a IA lendo o Figma diretamente, com contexto real, e implementando isso no código. Foi por isso que decidi usar o MCP oficial da Figma dentro do Cursor. Neste artigo, explico como isso funciona, como configurei e o que de fato é usado na prática.",
        ],
      },
      {
        heading: "TL;DR",
        paragraphs: [
          "• O projeto não tem um MCP próprio. Não existe pasta src/mcp, pacote npm interno ou API que \"leia Figma\" por conta própria.\n• O que existe é um arquivo .cursor/mcp.json apontando para o servidor MCP oficial da Figma.\n• Existem dois servidores oficiais: remoto (HTTP + OAuth) e local (Figma Desktop + Dev Mode).\n• Na prática, o remoto é o que funciona melhor na maioria dos casos — não depende do Figma Desktop aberto.\n• O Agent do Cursor passa a enxergar ferramentas como get_design_context, get_screenshot, get_metadata, download_assets e get_variable_defs.",
        ],
      },
      {
        heading: "O ponto mais importante",
        paragraphs: [
          "Não existe MCP próprio neste projeto.",
          "Não há pasta tipo src/mcp, nem pacote npm interno, nem API que \"leia Figma\". O que existe é um arquivo de configuração no Cursor apontando para o servidor da Figma.",
          "Config do projeto: `.cursor/mcp.json` (raiz do repositório).",
          "Config global do Cursor: `C:\\Users\\<seu-usuario>\\.cursor\\mcp.json`.",
          "Servidor de verdade: MCP oficial da Figma. Código próprio de MCP: nenhum.",
          "Quando o Agent precisa do Figma, o Cursor chama esse endpoint HTTP. No painel de MCPs ele costuma aparecer como figma / user-figma.",
        ],
      },
      {
        heading: "O cenário que levou à configuração",
        paragraphs: [
          "Já existia um frontend em Next.js rodando. O design novo veio pronto no Figma. Sem MCP, o Agent não conseguia ler frames, cores, tipografia ou assets com fidelidade — no máximo abria a página web publicada ou trabalhava a partir de um screenshot solto, o que gerava telas “parecidas”, nunca fiéis.",
          "O objetivo era simples de enunciar e chato de fazer manualmente: a IA do Cursor deveria ler o arquivo do Figma com contexto real (nodes, inspeção, tokens de design, screenshots) e implementar isso diretamente no código já existente, sem eu precisar descrever cor por cor, espaçamento por espaçamento.",
        ],
      },
      {
        heading: "O que é o MCP (Model Context Protocol)",
        paragraphs: [
          "MCP (Model Context Protocol) é o padrão que o Cursor usa para conectar ferramentas externas ao Agent. Sem MCP, a IA só enxerga o que você cola na conversa. Com o MCP do Figma, ela ganha acesso a ferramentas como:",
          "• get_design_context\n• get_screenshot\n• get_metadata\n• download_assets\n• get_variable_defs\n• use_figma\n• Code Connect e skills de design-to-code",
        ],
      },
      {
        heading: "Dois servidores oficiais da Figma (não confundir)",
        paragraphs: [
          "A Figma oferece dois caminhos para o MCP. Vale entender a diferença antes de configurar.",
        ],
      },
      {
        heading: "1. Remoto (o que acabei usando)",
        paragraphs: [
          "• Tipo: HTTP\n• Autenticação: OAuth feito direto no Cursor (não grava token no mcp.json)\n• Funciona mesmo com o Figma Desktop fechado, desde que a conta tenha acesso ao arquivo\n• Conjunto mais amplo de ferramentas disponíveis\n• É a opção que a própria Figma recomenda na maioria dos casos",
        ],
      },
      {
        heading: "2. Local (Desktop)",
        paragraphs: [
          "• Roda dentro do Figma Desktop\n• Exige o Dev Mode ligado (Shift + D)\n• No painel de inspeção: Enable desktop MCP server\n• URL típica: http://127.0.0.1:3845/mcp\n• Sem OAuth — depende do aplicativo estar aberto na máquina\n• Exige seat Full ou Dev no plano da Figma",
          "No começo, tentei o modo local. O endpoint 127.0.0.1:3845 não respondeu de primeira — Desktop fechado, Dev Mode desligado e o MCP local ainda não habilitado. Migrei para o remoto oficial, que resolveu de forma mais estável.",
        ],
      },
      {
        heading: "Onde fica a configuração no projeto",
        paragraphs: [
          "Arquivo na raiz do repositório do front-end: `.cursor/mcp.json`",
          "{\n  \"mcpServers\": {\n    \"figma\": {\n      \"url\": \"https://mcp.figma.com/mcp\",\n      \"type\": \"http\"\n    }\n  }\n}",
          "Isso só diz ao Cursor: “quando precisar de Figma, use este servidor HTTP”.",
          "Existe a mesma entrada no MCP global da máquina: `C:\\Users\\<seu-usuario>\\.cursor\\mcp.json`",
          "Nesse arquivo global, o figma convive com outros servidores MCP que eu já usava. A configuração do projeto vale só para aquele workspace; a global vale para qualquer pasta aberta no Cursor.",
        ],
      },
      {
        heading: "Como foi feito, na prática: só configuração",
        paragraphs: [
          "Não houve implementação de servidor nenhum. O fluxo foi este:",
          "• Colei o link do Figma no chat — o Agent, sem MCP, não conseguia ler o arquivo.\n• Criei o .cursor/mcp.json apontando para o Desktop (127.0.0.1:3845).\n• Testei o endpoint local — falhou.\n• Atualizei o JSON para o servidor remoto oficial, com \"type\": \"http\".\n• No Cursor: Settings → MCP → Connect / OAuth na conta Figma.\n• Status ficou verde — o Agent passou a enxergar as ferramentas.",
          "Nenhum código próprio “constrói” o MCP. O código do servidor é da Figma. O que fica versionado é só a URL de conexão e a autenticação feita via OAuth.",
        ],
      },
      {
        heading: "Passo a passo para configurar o MCP da Figma no Cursor",
        paragraphs: [
          "Abaixo, o fluxo completo — do Desktop (opcional) até o link certo do frame no chat.",
        ],
      },
      {
        heading: "1. (Opcional) Figma Desktop + Dev Mode",
        paragraphs: [
          "Só necessário se for usar o MCP local:",
          "• Baixe o app em figma.com/downloads.\n• Faça login na conta com acesso ao arquivo.\n• Abra o arquivo no Desktop.\n• Ative o Dev Mode (Shift + D).\n• No painel de inspeção, marque Enable desktop MCP server.\n• Copie a URL exibida (geralmente http://127.0.0.1:3845/mcp).",
        ],
      },
      {
        heading: "2. Criar o mcp.json no projeto",
        paragraphs: [
          "Na raiz do repositório, crie `.cursor/mcp.json`.",
          "Remoto (recomendado):",
          "{\n  \"mcpServers\": {\n    \"figma\": {\n      \"url\": \"https://mcp.figma.com/mcp\",\n      \"type\": \"http\"\n    }\n  }\n}",
          "Local (alternativa):",
          "{\n  \"mcpServers\": {\n    \"figma-desktop\": {\n      \"url\": \"http://127.0.0.1:3845/mcp\"\n    }\n  }\n}",
          "Os dois podem coexistir no mesmo arquivo, com nomes diferentes.",
        ],
      },
      {
        heading: "3. Ativar no Cursor",
        paragraphs: [
          "• Salve o JSON e reinicie o Cursor.\n• Vá em Settings → Cursor Settings → MCP.\n• Ligue o toggle do figma.\n• Clique em Connect → autorize via OAuth no navegador.\n• Confira o status: deve aparecer ready / verde.\n• No chat do Agent, teste com: \"liste as ferramentas MCP do Figma\".",
          "Atalho opcional no chat: /add-plugin figma (plugin oficial com skills prontas).",
        ],
      },
      {
        heading: "4. Enviar o design certo",
        paragraphs: [
          "O “envio” do design é o link do frame em Dev Mode — não um PDF nem um export qualquer:",
          "• O fileKey e o node-id vêm direto da URL do Figma.\n• node-id=12-34 vira 12:34 quando usado pelas ferramentas do MCP.\n• Prefira sempre o link do frame da tela específica, não só a página raiz (0-1).",
        ],
      },
      {
        heading: "Como o Agent usa isso depois de conectado",
        paragraphs: [
          "Uma ordem que funciona bem na prática:",
          "• Validar se o MCP está autenticado e ativo.\n• Ler o link e listar frames, cores e tipografia.\n• Comparar com os tokens e componentes que já existem no repositório.\n• Implementar uma tela por vez (por exemplo: home → autenticação → páginas internas).\n• Reaproveitar o que o projeto já tem (styled-components, shells, tokens) — o output do Figma é referência de design, não código final para simplesmente colar.",
          "Um exemplo real desse reaproveitamento: o arquivo do Figma às vezes só tinha os botões “Entrar” e “Criar conta” no cabeçalho, sem uma tela dedicada para login e cadastro. Nesses casos, as páginas foram montadas seguindo o mesmo padrão visual (tokens, raio de borda, gradiente), reaproveitando o shell de autenticação e os estilos já existentes — mesmo sem um frame específico desenhado no Figma para aquela tela.",
        ],
      },
      {
        heading: "Erros comuns ao configurar o MCP da Figma",
        paragraphs: [
          "• MCP não aparece: mcp.json no repositório errado ou Cursor não foi reiniciado. Se o arquivo não carrega, vale validar a sintaxe do JSON antes de reiniciar — um formatador de JSON online resolve isso em segundos.\n• 127.0.0.1:3845 recusa conexão: Desktop fechado, Dev Mode desligado ou MCP local ainda não habilitado.\n• Servidor aparece verde mas não lê o arquivo: a conta autenticada via OAuth não tem permissão de visualização no Figma.\n• Link sem node-id: o Agent pede o link específico da seleção, não da página inteira.\n• Código genérico demais: falta usar variables / Code Connect habilitado no Dev Mode.\n• Firewall bloqueando localhost na porta 3845: só ocorre no modo desktop.\n• Logs para depurar: no Cursor, vá em Output → MCP Logs.",
        ],
      },
      {
        heading: "Checklist rápido",
        paragraphs: [
          "Antes de pedir para o Agent implementar qualquer tela, confirme: mcp.json versionado, status ready no painel de MCP, OAuth feito com a conta certa, acesso real ao arquivo no Figma e o link do frame (com node-id) colado no chat.",
        ],
      },
      {
        heading: "Perguntas frequentes sobre MCP do Figma no Cursor",
        paragraphs: [
          "Preciso escrever um servidor MCP para conectar o Figma ao Cursor? Não. A Figma já disponibiliza um servidor MCP oficial, remoto ou local. Basta apontar o .cursor/mcp.json para ele e autenticar via OAuth.",
          "Qual a diferença entre o MCP remoto e o local da Figma? O remoto roda via HTTP com OAuth e funciona mesmo com o Figma Desktop fechado. O local depende do Figma Desktop aberto, com Dev Mode ativo, e não usa OAuth.",
          "Por que o Cursor não lê o arquivo mesmo com o MCP conectado? Geralmente porque a conta autenticada não tem acesso de visualização ao arquivo no Figma, ou porque o link enviado não contém um node-id válido.",
          "O código gerado a partir do Figma já sai pronto para produção? Não deve ser tratado assim. O ideal é usar o MCP como referência de design (cores, tipografia, espaçamento, variáveis) e implementar reaproveitando os componentes e padrões que já existem no projeto.",
        ],
      },
      {
        heading: "Conclusão",
        paragraphs: [
          "“Ter MCP de Figma” aqui significa uma coisa bem específica: apontar o Cursor para o servidor oficial da Figma e autenticar. O servidor é da Figma — o que fica sob controle do time é só o mcp.json versionado e o uso do Agent com links corretos do Dev Mode. Nenhuma linha de código própria foi escrita para \"ler\" o Figma; toda a inteligência de leitura de design já vem pronta no protocolo.",
          "Ferramentas rápidas tipo formatador de JSON, gerador de UUID e decodificador de JWT eu deixo salvas na devKit — uso no dia a dia.",
        ],
      },
    ],
  },
  {
    slug: "pare-de-usar-cpfs-reais-em-testes",
    title:
      "Pare de usar CPFs reais em seus testes: a importância dos dados sintéticos no desenvolvimento de software",
    description:
      "Como gerar um CPF para testes pode impactar a segurança, a produtividade e a qualidade do software — e por que dados sintéticos são a prática certa.",
    toolHref: "/cpf",
    toolLabel: "Abrir gerador de CPF da devKit",
    publishedAt: "2026-08-11",
    readingMinutes: 8,
    keywords: [
      "dados sintéticos",
      "CPF para testes",
      "não usar CPF real",
      "gerador de CPF",
      "LGPD testes",
      "massa de dados QA",
      "CPF sintético",
    ],
    cover: {
      src: cover("pare-de-usar-cpfs-reais-em-testes"),
      alt: "Desenvolvedor trabalhando com dados de teste no notebook",
      credit: "Neto Orlando / Medium",
      creditUrl:
        "https://medium.com/@orlandoneto23/pare-de-usar-cpfs-reais-em-seus-testes-a-import%C3%A2ncia-dos-dados-sint%C3%A9ticos-no-desenvolvimento-de-7028b99995c6",
    },
    sections: [
      {
        heading: "Os dados do teste passam despercebidos",
        paragraphs: [
          "Desenvolver software vai muito além de escrever código. Durante o desenvolvimento de uma aplicação, passamos boa parte do tempo criando cenários de teste, simulando integrações, validando regras de negócio e garantindo que tudo funcione antes de chegar à produção.",
          "Mas existe um detalhe que, muitas vezes, passa despercebido: os dados utilizados durante os testes.",
          "Se você trabalha com sistemas brasileiros, provavelmente já precisou preencher um formulário com nome, CPF, telefone, e-mail e endereço. Até aí, tudo bem. O problema começa quando você precisa informar um CPF válido.",
        ],
      },
      {
        heading: "O erro que muitos desenvolvedores cometem",
        paragraphs: [
          "Ao longo da carreira como engenheiro de software, é comum ver abordagens como: usar o próprio CPF, o de um familiar, pesquisar “CPF válido” no Google, copiar um número de fórum ou inventar uma sequência qualquer.",
          "À primeira vista parece uma solução rápida. Nenhuma delas é uma boa prática.",
        ],
      },
      {
        heading: "Por que isso é um problema?",
        paragraphs: [
          "Imagine um ambiente de homologação compartilhado. Durante meses, vários desenvolvedores usam o mesmo CPF em testes diferentes. Um teste altera os dados. Outro exclui o cadastro. Uma integração externa sincroniza aquela informação. Uma demonstração para o cliente exibe um documento de uma pessoa real.",
          "Agora imagine esse ambiente acessado por dezenas de pessoas. O risco aumenta. Dependendo do projeto, dados reais também conflitam com políticas internas de segurança e privacidade — e com a LGPD.",
        ],
      },
      {
        heading: "A importância dos dados sintéticos",
        paragraphs: [
          "Grandes empresas dificilmente usam dados reais no desenvolvimento. Elas trabalham com dados sintéticos: informações criadas só para teste, com características parecidas com as reais, mas que não pertencem a ninguém.",
          "Assim você valida o sistema sem comprometer a privacidade de terceiros. É por isso que QA, engenharia e DevOps adotam essa prática.",
        ],
      },
      {
        heading: "O que torna um CPF válido?",
        paragraphs: [
          "Muita gente acha que CPF válido é só onze dígitos. Os dois últimos são dígitos verificadores, calculados a partir dos nove primeiros. É esse algoritmo que impede números aleatórios.",
          "Por isso 12345678900 é inválido — mesmo tendo onze dígitos.",
        ],
      },
      {
        heading: "Então vou implementar o algoritmo?",
        paragraphs: [
          "Pode. Há implementações em JavaScript, Java, Kotlin, C#, Python e outras linguagens. O objetivo, porém, é desenvolver a funcionalidade — não perder tempo gerando documento de teste.",
          "Depois ainda falta formatar, gerar centenas, evitar repetição, compartilhar com a equipe e reutilizar em testes automatizados. Tudo isso só para massa de dados.",
        ],
      },
      {
        heading: "Foi exatamente por isso que surgiu a devKit",
        paragraphs: [
          "Em vários projetos as mesmas tarefas se repetiam: CPF, CNPJ, UUID, JWT, Base64, QR Code, JSON, hashes e arquivos de teste — sempre em sites diferentes. A devKit reúne ferramentas gratuitas para desenvolvedores e analistas de qualidade, no navegador, sem login.",
        ],
      },
      {
        heading: "Gerando um CPF em segundos",
        paragraphs: [
          "O gerador de CPF da devKit cria documentos sintéticos válidos no navegador. Sem instalação, sem cadastro e sem enviar os números a um servidor.",
          "Em poucos segundos você gera quantos CPFs precisar para os testes. Abra o gerador de CPF da devKit e copie o resultado para o formulário, o Postman ou o teste automatizado.",
        ],
      },
      {
        heading: "Exemplo prático",
        paragraphs: [
          "Uma API de cadastro espera algo como POST /clientes com nome e CPF. O teste não deve travar num dígito verificador inválido — ele deve validar o comportamento da aplicação.",
          "Em JavaScript, o caso fica: const cliente = { nome: \"Maria\", cpf: gerarCpfValido() }. Com documentos matematicamente válidos, o teste cobre o fluxo real, não só o erro de entrada.",
        ],
      },
      {
        heading: "Onde usar",
        paragraphs: [
          "Desenvolvimento web, React, React Native, APIs REST, microsserviços, Postman, Insomnia, Cypress, Playwright, Selenium, testes unitários e de integração, homologação e demonstrações para clientes.",
        ],
      },
      {
        heading: "Pequenas ferramentas economizam horas",
        paragraphs: [
          "Produtividade não é só framework grande. Gerar um CPF parece simples — multiplique por dezenas de desenvolvedores, centenas de testes, vários projetos e anos de trabalho. São horas em tarefa repetitiva.",
          "O gerador de CPF foi o primeiro passo da devKit. A ideia é reunir num só lugar o que quem desenvolve software usa o tempo todo: geradores, validadores e utilitários de teste.",
        ],
      },
      {
        heading: "Conclusão",
        paragraphs: [
          "Boas práticas não são só código limpo e arquitetura. Incluem a forma de criar e manipular dados no ciclo de desenvolvimento.",
          "Dados sintéticos são uma decisão simples que melhora segurança, facilita testes e evita o uso de informação real. Um gerador de CPF não existe só para poupar tempo: ajuda a equipe a construir aplicações mais consistentes, profissionais e seguras.",
        ],
      },
    ],
  },
  {
    slug: "gerador-de-cpf-para-testes",
    title: "Gerador de CPF: quando usar, como funciona e por que ele é útil",
    description:
      "Entenda o que é um gerador de CPF, como os dígitos verificadores funcionam, quando usar em QA e desenvolvimento — e o que não fazer com CPFs sintéticos.",
    toolHref: "/cpf",
    toolLabel: "Abrir gerador de CPF da devKit",
    publishedAt: "2026-08-03",
    readingMinutes: 8,
    keywords: [
      "gerador de CPF",
      "gerar CPF",
      "CPF válido para testes",
      "gerador CPF online",
      "CPF fictício",
      "dígitos verificadores CPF",
      "CPF para QA",
    ],
    cover: {
      src: cover("gerador-de-cpf-para-testes"),
      alt: "Documentos e calculadora sobre mesa",
      credit: "Kelly Sikkema / Unsplash",
      creditUrl: "https://unsplash.com/photos/4jymgQTVzFo",
    },
    sections: [
      {
        heading: "O que é um gerador de CPF?",
        paragraphs: [
          "O CPF (Cadastro de Pessoas Físicas) é um dos documentos mais usados no Brasil. Desenvolvedores, QA, estudantes e empresas precisam de números para testar sistemas sem usar dados reais — e é aí que entra o gerador de CPF.",
          "A ferramenta cria números com formato válido, seguindo o algoritmo dos dígitos verificadores: 11 dígitos, regras matemáticas corretas e aprovação em sistemas que só checam o formato. O CPF gerado não representa necessariamente uma pessoa real; serve para teste e desenvolvimento.",
          "No devKit, a geração roda só no navegador. Nada é enviado a um servidor de consulta da Receita.",
        ],
      },
      {
        heading: "Para que serve um gerador de CPF?",
        paragraphs: [
          "Desenvolvimento: testar formulários de cadastro, APIs e autenticação sem dados pessoais reais.",
          "QA: validar cadastro de clientes, máscaras de formulário, integrações, fluxos de compra e emissão de documentos.",
          "Estudos: praticar validações e apps sem expor informações de terceiros.",
          "Demonstrações: apresentar software em reuniões ou treinamentos com CPFs fictícios.",
        ],
      },
      {
        heading: "Como funciona a geração do CPF?",
        paragraphs: [
          "O CPF tem 11 números: os nove primeiros formam a base; os dois últimos são os dígitos verificadores, calculados por um algoritmo que ajuda a detectar erro de digitação.",
          "O gerador monta a base (com opção de UF/região no devKit) e calcula os DVs para o número passar na validação de formato. Os outros dígitos da frente são aleatórios; com estado “Indiferente”, a região também é sorteada.",
        ],
      },
      {
        heading: "Gerar um CPF significa documento verdadeiro?",
        paragraphs: [
          "Não. Essa é a dúvida mais comum. O gerador só cria uma sequência que respeita as regras de validação. Isso não significa que o número esteja cadastrado na Receita Federal ou pertença a alguém.",
          "Não use CPF gerado em produção, compras, abertura de contas ou qualquer ato que exija documento real.",
        ],
      },
      {
        heading: "Vantagens de usar um gerador",
        paragraphs: [
          "Economia de tempo: CPFs válidos em segundos, em vez de inventar números à mão.",
          "Menos erro: DVs calculados automaticamente, evitando falhas nos testes.",
          "Privacidade: dados fictícios no lugar de CPF de clientes ou colaboradores.",
          "Automação: gera em lote (até 100 no devKit) para popular fixtures e massa de teste.",
        ],
      },
      {
        heading: "Boas práticas",
        paragraphs: [
          "Use só em desenvolvimento, testes ou demonstrações. Nunca para fraude ou cadastro indevido.",
          "Prefira CPF fictício sempre que atender o objetivo do teste. Respeite a LGPD e evite dados reais desnecessários.",
          "Combine com o validador de CPF do devKit para conferir máscaras, colagem e mensagens de erro da sua UI.",
        ],
      },
      {
        heading: "Perguntas frequentes",
        paragraphs: [
          "O CPF gerado é válido? Sim para o algoritmo de dígitos — passa em validações de formato. Não é “válido” como cadastro oficial.",
          "Pertence a uma pessoa? Não necessariamente. O gerador não consulta bases oficiais.",
          "Posso usar em produção? Não. Só desenvolvimento, testes, aprendizado e demos.",
          "É gratuito? No devKit, a geração de CPF para testes é gratuita e roda no navegador.",
        ],
      },
    ],
  },
  {
    slug: "validador-de-cpf",
    title: "Validador de CPF: confira os dígitos no navegador",
    description:
      "Verifique se o CPF tem estrutura e dígitos verificadores corretos — com ou sem pontuação, 100% no browser, sem consulta à Receita.",
    toolHref: "/cpf/validar",
    toolLabel: "Abrir validador de CPF da devKit",
    publishedAt: "2026-08-03",
    readingMinutes: 7,
    keywords: [
      "validador de CPF",
      "validar CPF",
      "CPF online",
      "dígitos verificadores CPF",
      "checar CPF",
      "CPF com máscara",
      "algoritmo CPF",
      "validação CPF navegador",
    ],
    cover: {
      src: cover("validador-de-cpf"),
      alt: "Pessoa trabalhando com documentos e laptop",
      credit: "Scott Graham / Unsplash",
      creditUrl: "https://unsplash.com/photos/OQMZwNd3ThU",
    },
    sections: [
      {
        heading: "O que é um validador de CPF?",
        paragraphs: [
          "CPF digitado errado gera falha de cadastro, duplicidade e integração quebrada. O validador confere se o número segue o algoritmo oficial dos dígitos verificadores — no navegador, sem enviar dados a servidor.",
          "Aceita CPF com pontuação (123.456.789-09) ou só números (12345678909). A formatação é removida antes da checagem.",
        ],
      },
      {
        heading: "Como funciona a validação?",
        paragraphs: [
          "Remove pontos e hífen, confere 11 dígitos, rejeita sequências inválidas (ex.: todos iguais), calcula o 1º e o 2º DV e compara com o informado. Se tudo passar, o CPF é matematicamente válido.",
        ],
      },
      {
        heading: "O que significa CPF válido?",
        paragraphs: [
          "Significa só que o algoritmo de DV está correto. Não garante cadastro na Receita, titularidade nem situação regular. Ideal para depurar máscaras, inputs e mensagens de erro no front-end.",
        ],
      },
      {
        heading: "Quando usar e por que validar antes do envio",
        paragraphs: [
          "Desenvolvimento, formulários, testes automatizados, homologação, APIs, conferência de digitação, importações e apps web. Validar no cliente reduz erro de digitação, cadastros inválidos e retrabalho — e melhora a qualidade dos dados.",
          "No devKit a checagem é 100% local: privacidade, resposta instantânea e uso em desktop ou mobile. Para gerar CPF de teste, use o gerador em /cpf.",
        ],
      },
      {
        heading: "Perguntas frequentes",
        paragraphs: [
          "Consulta a Receita? Não. Armazena o CPF? Não. Aceita máscara? Sim. Válido = existe? Não — só consistência matemática.",
        ],
      },
    ],
  },
  {
    slug: "gerador-e-validador-de-cnpj",
    title:
      "CNPJ sintético e validação para formulários: gere e valide CNPJs de teste no navegador",
    description:
      "Gere CNPJ com dígitos verificadores válidos, com ou sem máscara, em lote e com exportação — e valide formato em /cnpj/validar.",
    toolHref: "/cnpj",
    toolLabel: "Abrir gerador de CNPJ da devKit",
    publishedAt: "2026-08-03",
    readingMinutes: 8,
    keywords: [
      "gerador de CNPJ",
      "CNPJ sintético",
      "validar CNPJ",
      "CNPJ para testes",
      "gerador CNPJ online",
      "dígitos verificadores CNPJ",
      "CNPJ fictício",
      "CNPJ formulário",
    ],
    cover: {
      src: cover("gerador-e-validador-de-cnpj"),
      alt: "Prédios corporativos",
      credit: "Sean Pollock / Unsplash",
      creditUrl: "https://unsplash.com/photos/PhYq704ffdA",
    },
    sections: [
      {
        heading: "O que é um CNPJ sintético?",
        paragraphs: [
          "Em ERPs, CRMs e cadastros empresariais, testar com CNPJ de empresa real gera risco de privacidade e ruído nos dados. A alternativa é um CNPJ sintético: número para desenvolvimento e QA que passa no algoritmo oficial de dígitos verificadores, sem representar empresa existente.",
          "Desenvolvedores, QA e automação usam esse tipo de documento para validar formulários e regras de negócio sem dados reais.",
        ],
      },
      {
        heading: "Como funciona a validação?",
        paragraphs: [
          "A validação confere 14 dígitos, estrutura, DVs e formato do algoritmo. Remove pontos, barra e hífen, calcula os dois verificadores e compara com o número informado. Validar formato não consulta a Receita nem confirma existência da empresa.",
          "No devKit, o gerador está em /cnpj e o validador dedicado em /cnpj/validar — ambos no navegador.",
        ],
      },
      {
        heading: "Gere CNPJs válidos no navegador",
        paragraphs: [
          "Gere com ou sem máscara, em lote, copie com um clique e exporte TXT, CSV ou JSON. O processamento é local. Os números seguem o padrão comum de matriz (filial 0001) usado em geradores de teste.",
        ],
      },
      {
        heading: "Quando usar e vantagens",
        paragraphs: [
          "Desenvolvimento, testes automatizados e unitários, homologação, demos, empresas fictícias, APIs e validação de máscaras. Benefícios: menos exposição de dados reais, testes repetíveis, automação, alinhamento à LGPD e consistência entre times.",
        ],
      },
      {
        heading: "Perguntas frequentes",
        paragraphs: [
          "Pertence a uma empresa? Não — só teste. Passa na validação de DV? Sim. Produção? Não. Precisa instalar? Não — roda no browser, inclusive com a página já carregada.",
          "Conclusão: gerar e validar CNPJ sintético evita dados reais, melhora segurança e garante documentos matematicamente válidos nos formulários de cadastro.",
        ],
      },
    ],
  },
  {
    slug: "gerador-de-pessoa",
    title:
      "Gerador de pessoa: dados fictícios completos para popular formulários",
    description:
      "Crie perfis sintéticos com nome, CPF, RG, endereço, telefone e e-mail no navegador — ideal para cadastro, seeds e QA.",
    toolHref: "/pessoa",
    toolLabel: "Abrir gerador de pessoa da devKit",
    publishedAt: "2026-08-03",
    readingMinutes: 7,
    keywords: [
      "gerador de pessoa",
      "pessoa fictícia",
      "dados fictícios",
      "gerar CPF RG endereço",
      "massa de teste",
      "faker brasileiro",
      "popular formulário",
      "persona para testes",
    ],
    cover: {
      src: cover("gerador-de-pessoa"),
      alt: "Equipe colaborando em escritório",
      credit: "Annie Spratt / Unsplash",
      creditUrl: "https://unsplash.com/photos/QckxruozjRg",
    },
    sections: [
      {
        heading: "O que um bom gerador de pessoa entrega?",
        paragraphs: [
          "Preencher à mão nome, CPF, RG, endereço, telefone e e-mail atrasa o teste de cadastros. Um gerador de pessoa cria perfis sintéticos completos em segundos — prontos para formulários, massa de teste, seeds e mocks no navegador.",
          "No devKit o perfil típico inclui nome, CPF (com DV válido), RG, CNH, data de nascimento, endereço (rua, número, bairro, cidade, UF e CEP), telefone, celular, e-mail e filiação. Tudo inventado, com formato correto para fixtures. Endereço e CEP são sintéticos — não há consulta aos Correios.",
        ],
      },
      {
        heading: "Por que usar dados fictícios?",
        paragraphs: [
          "Protege privacidade, acelera o preenchimento, gera vários perfis rápido e evita dados sensíveis reais em desenvolvimento, homologação e QA. CPF/RG passam na validação matemática que a maioria dos formulários checa.",
        ],
      },
      {
        heading: "Como gerar no devKit",
        paragraphs: [
          "Opcionalmente filtre por sexo, idade e UF, clique em gerar e copie campo a campo, tudo de uma vez ou baixe JSON. Use só o que a aplicação precisa. Para CPF ou RG isolados, há ferramentas dedicadas no devKit.",
        ],
      },
      {
        heading: "Dicas e casos de uso",
        paragraphs: [
          "Use só em testes, desenvolvimento e demos. Nunca para cadastro real ou fraude. Prefira documentos com DV válido. Varie sexo, idade e UF para cobrir mais cenários. Em automação, salve os dados se precisar de resultados reproduzíveis.",
          "Útil em cadastro e checkout, usuários de homologação, seeds de banco, planilhas, protótipos e validação de máscaras (CPF, CEP etc.).",
        ],
      },
      {
        heading: "Conclusão",
        paragraphs: [
          "Um gerador de pessoa com CPF, RG, endereço e contatos elimina o inventário manual e preenche formulários no formato certo. Gere perfis, copie os campos e teste sem expor dados reais.",
        ],
      },
    ],
  },
  {
    slug: "gerador-de-rg",
    title: "Gerador de RG fictício para formulários: crie documentos sintéticos para testes",
    description:
      "Gere RG sintético com ou sem pontuação para formulários, fixtures e QA. Formato útil para testes — não é documento oficial.",
    toolHref: "/rg",
    toolLabel: "Abrir gerador de RG da devKit",
    publishedAt: "2026-08-03",
    readingMinutes: 6,
    keywords: [
      "gerador de RG",
      "RG fictício",
      "gerar RG",
      "RG para testes",
      "RG sintético",
      "documento identidade teste",
      "RG formulário",
      "RG online",
    ],
    cover: {
      src: cover("gerador-de-rg"),
      alt: "Documento de identidade sobre mesa",
      credit: "Kelly Sikkema / Unsplash",
      creditUrl: "https://unsplash.com/photos/JIUjvqe2ZHg",
    },
    sections: [
      {
        heading: "O que é um gerador de RG fictício?",
        paragraphs: [
          "Em formulários brasileiros, o campo RG quase sempre aparece junto do CPF. Inventar um número à mão atrasa o QA e pode falhar em máscaras. Um gerador de RG fictício cria valores sintéticos com ou sem pontuação para staging, seeds e demos.",
          "Importante: o RG real varia por estado (formato e regras). O devKit gera um padrão útil para fixtures — com dígito verificador no estilo comum de testes — e não representa documento emitido por órgão oficial.",
        ],
      },
      {
        heading: "Para que serve?",
        paragraphs: [
          "Preencher cadastros em desenvolvimento, popular massa de teste, validar máscaras (XX.XXX.XXX-X) e campos sem pontuação, e evitar dados pessoais reais em homologação. Combine com o gerador de CPF ou de pessoa quando precisar do perfil completo.",
        ],
      },
      {
        heading: "Com ou sem pontuação",
        paragraphs: [
          "Com pontuação: formato comum XX.XXX.XXX-X (o DV pode ser X). Sem pontuação: só os dígitos, para APIs e bancos que armazenam o valor limpo. No devKit, marque a opção e gere — a cópia já sai no formato escolhido.",
        ],
      },
      {
        heading: "Boas práticas e FAQ",
        paragraphs: [
          "Use só em testes, staging e demos. Não use para abrir contas, solicitar documentos oficiais ou qualquer ato que exija identidade real. Respeite a LGPD: prefira dados sintéticos sempre que bastarem.",
          "O RG gerado é “válido”? Passa em checagens simples de formato/DV usadas em muitos formulários de teste, mas não é documento oficial. Varia por UF? Sim — o gerador oferece um padrão prático, não cobre todas as regras estaduais. Precisa instalar? Não — roda no navegador.",
        ],
      },
    ],
  },
  {
    slug: "gerador-de-uuid",
    title: "UUID v4 para IDs e fixtures: gere um ou vários no navegador",
    description:
      "Gere UUID v4 aleatórios em lote no browser para seeds, mocks, fixtures e chaves únicas — sem instalar nada.",
    toolHref: "/uuid",
    toolLabel: "Abrir gerador de UUID da devKit",
    publishedAt: "2026-08-03",
    readingMinutes: 6,
    keywords: [
      "gerador UUID",
      "UUID v4",
      "UUID online",
      "gerar UUID",
      "UUID fixtures",
      "UUID seeds",
      "identificador único",
      "UUID em lote",
    ],
    cover: {
      src: cover("gerador-de-uuid"),
      alt: "Circuito eletrônico em close",
      credit: "Possessed Photography / Unsplash",
      creditUrl: "https://unsplash.com/photos/g2E2ZQ5SNvU",
    },
    sections: [
      {
        heading: "O que é UUID v4?",
        paragraphs: [
          "Quem cria testes e bases de exemplo precisa de IDs únicos o tempo todo. UUID v4 é uma forma prática de gerar identificadores para seeds, mocks, fixtures e chaves — e no devKit você gera um ou vários direto no navegador.",
          "UUID (Universally Unique Identifier) tem 128 bits no formato xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx. A versão v4 é aleatória (com bits de versão/variante fixos). A chance de colisão é baixíssima — ideal para IDs de registro, chaves em banco, fixtures, mocks de API e sistemas distribuídos.",
        ],
      },
      {
        heading: "Por que gerar UUID v4 no navegador?",
        paragraphs: [
          "Rápido, sem terminal nem código na hora. Gera um ou vários de uma vez para planilhas, JSON, seeds e massa de teste. Após carregar a página, pode funcionar offline. Ideal quando você só precisa de IDs únicos sem montar ambiente.",
        ],
      },
      {
        heading: "Como gerar e quando usar",
        paragraphs: [
          "No devKit, escolha a quantidade, gere e copie — inclusive todos de uma vez para popular fixtures. Use em seeds de banco, objetos de teste, mocks de API, chaves no front-end e dados de exemplo em JSON/CSV.",
        ],
      },
      {
        heading: "Dicas práticas",
        paragraphs: [
          "Prefira v4 quando não precisar de ordenação temporal (para isso há UUID v7 ou ULID). Em testes reproduzíveis, gere uma vez e reutilize os mesmos valores. Evite confiar só no cliente para IDs críticos de produção sem validação no backend. Em lote, a geração múltipla poupa tempo. Confira o formato clássico com hífens (36 caracteres).",
        ],
      },
      {
        heading: "Conclusão",
        paragraphs: [
          "Gerar UUID v4 no browser é simples e eficiente para seeds, mocks e fixtures. Em poucos cliques você tem IDs prontos para colar no código, banco ou arquivo de teste — sem instalação e com resultado imediato.",
        ],
      },
    ],
  },
  {
    slug: "gerador-de-senha",
    title:
      "Gerador de senha forte para testes: crie senhas configuráveis no navegador",
    description:
      "Gere senhas com tamanho, maiúsculas, números e símbolos configuráveis — localmente no browser, ideal para QA e formulários.",
    toolHref: "/senha",
    toolLabel: "Abrir gerador de senha da devKit",
    publishedAt: "2026-08-03",
    readingMinutes: 6,
    keywords: [
      "gerador de senha",
      "senha forte",
      "gerador senha online",
      "senha para testes",
      "senha configurável",
      "gerar senha QA",
      "password generator",
      "senha com símbolos",
    ],
    cover: {
      src: cover("gerador-de-senha"),
      alt: "Cadeado e segurança digital",
      credit: "FlyD / Unsplash",
      creditUrl: "https://unsplash.com/photos/iIJrUoeRoCQ",
    },
    sections: [
      {
        heading: "Por que usar um gerador de senha para testes?",
        paragraphs: [
          "Em cadastro, APIs e ambientes de desenvolvimento você precisa de senhas fortes e variadas. Montar à mão combinações longas com maiúsculas, números e símbolos é lento e sujeito a erro. No devKit, o gerador roda no navegador — sem instalar e sem enviar dados a servidor.",
          "Gera senhas fortes rápido, com charset sob controle; serve para validar regras de formulário; funciona localmente; e evita senhas fracas ou repetidas no dia a dia de QA.",
        ],
      },
      {
        heading: "O que você pode configurar",
        paragraphs: [
          "Tamanho (8, 12, 16, 24 ou mais), maiúsculas (A–Z), minúsculas (a–z), números (0–9) e símbolos. Assim você simula desde testes básicos até políticas rigorosas de complexidade da aplicação.",
          "Para senhas reais do dia a dia, prefira um gerenciador de senhas dedicado. O gerador da devKit é pensado para fixtures e testes.",
        ],
      },
      {
        heading: "Como gerar no navegador",
        paragraphs: [
          "Defina o comprimento, marque maiúsculas, números e símbolos conforme o cenário, gere e copie com um clique. Use em formulários, usuários fictícios e validação de regras de complexidade.",
        ],
      },
      {
        heading: "Dicas e casos de uso",
        paragraphs: [
          "Varie cenários (fraca, forte, com símbolos). Use 12+ caracteres ao testar requisitos reais. Não reutilize senhas de teste em produção. Prefira ferramentas 100% no browser.",
          "Útil em cadastro/login, regras de complexidade, homologação, APIs e autenticação, demos e protótipos.",
        ],
      },
      {
        heading: "Conclusão",
        paragraphs: [
          "Um gerador configurável no navegador economiza tempo e garante testes com combinações reais de charset. Defina tamanho e tipos, gere e copie — senhas prontas para qualquer cenário de QA.",
        ],
      },
    ],
  },
  {
    slug: "gerador-de-codigo-de-barras",
    title:
      "Código de barras online: EAN, Code 128 e mais — gere no navegador e baixe em SVG ou PNG",
    description:
      "Crie códigos de barras (EAN, Code 128, Code 39 e outros) no browser e baixe em SVG ou PNG para etiquetas, estoque e testes.",
    toolHref: "/codigo-barras",
    toolLabel: "Abrir gerador de código de barras da devKit",
    publishedAt: "2026-08-03",
    readingMinutes: 7,
    keywords: [
      "gerador código de barras",
      "código de barras online",
      "EAN-13",
      "Code 128",
      "Code 39",
      "barcode SVG PNG",
      "etiqueta código de barras",
      "gerador barcode",
    ],
    cover: {
      src: cover("gerador-de-codigo-de-barras"),
      alt: "Pacotes e logística em armazém",
      credit: "CHUTTERSNAP / Unsplash",
      creditUrl: "https://unsplash.com/photos/9cCeS9Sg6nU",
    },
    sections: [
      {
        heading: "Principais tipos de código de barras",
        paragraphs: [
          "Precisa de barcode para etiquetas, testes, produtos ou sistemas? No devKit você gera no navegador, escolhe o padrão e baixa em SVG ou PNG — sem software caro. Útil em estoque, logística, e-commerce e QA de leitores.",
          "EAN-13 e EAN-8: varejo (supermercados, farmácias). Code 128: logística e controle interno (letras e números). Code 39: aplicações industriais. UPC-A/E: padrão americano. ITF: embalagens e logística. Escolha o formato conforme a necessidade.",
        ],
      },
      {
        heading: "Por que gerar no navegador?",
        paragraphs: [
          "Sem instalar nada, resultado imediato em qualquer computador. PNG para uso rápido; SVG para impressão e redimensionamento sem perda. Ideal para etiquetas de teste antes de produção em escala.",
        ],
      },
      {
        heading: "Como gerar no devKit",
        paragraphs: [
          "Escolha o tipo (EAN-13, Code 128, Code 39 etc.), digite o valor, ajuste largura/altura e se o texto aparece abaixo do código, visualize e baixe em PNG ou SVG. O arquivo serve para etiquetas, documentos, sistemas e impressoras.",
        ],
      },
      {
        heading: "Dicas para códigos que funcionam",
        paragraphs: [
          "Use o padrão certo (EAN no varejo, Code 128 no interno/logística). Prefira SVG na impressão. Deixe quiet zone (margem branca) ao redor. Teste com leitor ou celular antes de tiragem grande. Não distorça o código. Em EAN-13, o dígito verificador precisa estar correto — boas ferramentas calculam automaticamente.",
        ],
      },
      {
        heading: "Quando usar e conclusão",
        paragraphs: [
          "Etiquetas de teste, estoque e inventário, eventos e crachás, validar leitores, pequenas tiragens e códigos em documentos ou sistemas internos. Para boletos bancários, use o conversor de linha digitável do devKit.",
          "Gerar barcode online ficou simples: escolha o tipo, digite o conteúdo e baixe. Em segundos você tem um código pronto para etiquetas de teste ou produção.",
        ],
      },
    ],
  },
  {
    slug: "linha-digitavel-boleto",
    title:
      "Linha digitável para código de barras de boleto: converta e gere o barcode instantaneamente",
    description:
      "Converta a linha digitável (47 ou 48 dígitos) no código FEBRABAN de 44 posições e gere o barcode no navegador.",
    toolHref: "/linha-digitavel",
    toolLabel: "Abrir conversor de linha digitável da devKit",
    publishedAt: "2026-08-03",
    readingMinutes: 7,
    keywords: [
      "linha digitável",
      "código de barras boleto",
      "converter linha digitável",
      "boleto 44 dígitos",
      "FEBRABAN",
      "barcode boleto",
      "gerar código de barras boleto",
      "boleto bancário",
    ],
    cover: {
      src: cover("linha-digitavel-boleto"),
      alt: "Contas e calculadora",
      credit: "Fabian Blank / Unsplash",
      creditUrl: "https://unsplash.com/photos/pElSkGRA2NU",
    },
    sections: [
      {
        heading: "O que é a linha digitável e o código de 44 dígitos?",
        paragraphs: [
          "A linha digitável é longa e fácil de errar; o código de barras é a forma mais rápida de leitura por apps e leitores. Converter a linha no código de 44 dígitos e gerar o barcode no navegador evita digitação e acelera conferência.",
          "Linha digitável: sequência para digitação manual (47 no boleto bancário, 48 na arrecadação, com ou sem pontuação). Código de 44 dígitos: representação FEBRABAN usada no barcode (banco, valor, vencimento, nosso número etc.). A conversão correta é o que torna o barcode válido.",
        ],
      },
      {
        heading: "Por que converter a linha digitável em código de barras?",
        paragraphs: [
          "Evitar erro de digitação no pagamento, gerar barcode para sistemas e impressões, conferir se a linha está correta, facilitar leitura por câmera/leitor e integrar boletos em automações internas.",
        ],
      },
      {
        heading: "Como converter no devKit",
        paragraphs: [
          "Cole a linha digitável completa (com ou sem pontos). A ferramenta valida, converte para os 44 dígitos e gera o código de barras na hora — você copia o numérico ou usa a imagem do barcode.",
          "Aceita linhas de 47 (bancário) e 48 (arrecadação) dígitos. Se o dígito verificador estiver errado, a validação falha e o barcode não deve ser usado.",
        ],
      },
      {
        heading: "Dicas importantes e casos de uso",
        paragraphs: [
          "Confira se a linha está completa. Use o resultado só para fins legítimos (pagamento, conferência, integração autorizada). Em dúvida, prefira o app do banco ou o QR do boleto. Não compartilhe dados sensíveis à toa.",
          "Útil para empresas que precisam do barcode em sistemas internos, reimpressão, remessa/retorno, quando só se tem a linha digitável, e conferência de boletos recebidos por e-mail ou WhatsApp. Também ajuda no QA de fluxos de pagamento.",
        ],
      },
      {
        heading: "Conclusão",
        paragraphs: [
          "Converter linha digitável em 44 dígitos e barcode ficou simples: cole, valide e obtenha o código em segundos — menos erro e mais agilidade no dia a dia com boletos.",
        ],
      },
    ],
  },
  {
    slug: "ocr-no-navegador",
    title:
      "OCR no navegador: extraia texto de imagens e PDFs localmente com Tesseract.js (sem upload)",
    description:
      "Reconhecimento óptico de caracteres no browser com Tesseract.js. Privacidade total: prints, fotos e PDFs processados só no seu dispositivo.",
    toolHref: "/ocr",
    toolLabel: "Abrir OCR da devKit",
    publishedAt: "2026-08-03",
    readingMinutes: 7,
    keywords: [
      "OCR online",
      "OCR no navegador",
      "Tesseract.js",
      "extrair texto de imagem",
      "OCR PDF",
      "reconhecimento óptico",
      "OCR sem upload",
      "OCR português",
    ],
    cover: {
      src: cover("ocr-no-navegador"),
      alt: "Documentos e caneta sobre mesa",
      credit: "Scott Graham / Unsplash",
      creditUrl: "https://unsplash.com/photos/OQMZwNd3ThU",
    },
    sections: [
      {
        heading: "O que é OCR no navegador?",
        paragraphs: [
          "Precisa copiar texto de um print, foto ou PDF escaneado? Em vez de digitar tudo, use OCR (reconhecimento óptico de caracteres) no navegador. No devKit o processamento é local com Tesseract.js — nada vai para servidor; a velocidade depende da sua máquina.",
          "O OCR transforma texto em imagem em texto editável. Serve para prints, fotos de documentos, placas e anotações, PDFs escaneados ou páginas renderizadas, capturas de conversas, tabelas e formulários.",
        ],
      },
      {
        heading: "Por que usar OCR local com Tesseract.js?",
        paragraphs: [
          "Privacidade: o arquivo não sai do dispositivo. Sem cadastro obrigatório para usar a ferramenta. Após carregar a página, pode funcionar offline. Suporte a vários idiomas, incluindo português. Fluxo simples: arraste o arquivo e copie o texto.",
        ],
      },
      {
        heading: "Como extrair texto no devKit",
        paragraphs: [
          "Abra o OCR, selecione ou arraste imagem (JPG, PNG, WebP…) ou PDF, escolha o idioma e processe. Em poucos segundos o Tesseract analisa e o texto fica pronto para copiar.",
          "Em PDFs multipágina, o fluxo trabalha página a página. Documentos oficiais com assinatura Serpro (como CNH-e) muitas vezes têm o conteúdo só em imagem: o devKit detecta isso e força OCR na página renderizada.",
        ],
      },
      {
        heading: "Dicas para melhor resultado",
        paragraphs: [
          "Prefira boa resolução e contraste (texto escuro em fundo claro). Evite fotos inclinadas, borradas ou com sombra forte. Selecione o idioma certo — em português isso melhora a precisão. Sempre revise o resultado em documentos críticos.",
        ],
      },
      {
        heading: "Quando é mais útil e conclusão",
        paragraphs: [
          "Extrair texto de prints (WhatsApp, e-mail, redes), digitalizar anotações, copiar de PDFs escaneados, tornar recibos e formulários editáveis e melhorar acessibilidade para leitores de tela.",
          "Com Tesseract.js no browser, OCR fica simples e privado — sem software pesado nem upload de arquivos sensíveis. Abra a ferramenta, carregue o arquivo e copie o texto em segundos.",
        ],
      },
    ],
  },
  {
    slug: "gerador-de-qr-code",
    title:
      "QR Code para URL, Wi-Fi e WhatsApp: crie no navegador, personalize e baixe em PNG ou SVG",
    description:
      "Gere QR Codes de link, Wi-Fi e WhatsApp no browser, personalize cores e baixe em PNG ou SVG — sem instalar nada.",
    toolHref: "/qr-code",
    toolLabel: "Abrir gerador de QR Code da devKit",
    publishedAt: "2026-08-03",
    readingMinutes: 7,
    keywords: [
      "gerador QR Code",
      "QR Code online",
      "QR Code Wi-Fi",
      "QR Code WhatsApp",
      "QR Code URL",
      "baixar QR PNG SVG",
      "personalizar QR Code",
      "QR Code no navegador",
    ],
    cover: {
      src: cover("gerador-de-qr-code"),
      alt: "Pessoa escaneando QR Code no celular",
      credit: "Solen Feyissa / Unsplash",
      creditUrl: "https://unsplash.com/photos/jA0KZkW4J4",
    },
    sections: [
      {
        heading: "Por que usar QR Codes para URL, Wi-Fi e WhatsApp?",
        paragraphs: [
          "QR Codes facilitam compartilhar links, conectar ao Wi-Fi sem digitar senha ou abrir o WhatsApp com um toque. Dá para criar códigos profissionais no navegador, personalizar cores e baixar em PNG ou SVG — sem apps complicados.",
          "URL: sites, landing pages, portfólios, cardápios e produtos. Wi-Fi: SSID e senha na câmera, conexão automática. WhatsApp: abre o chat com seu número e, se quiser, mensagem pré-pronta. Cores personalizadas reforçam a marca do negócio ou evento.",
        ],
      },
      {
        heading: "Como criar no navegador (sem instalar nada)",
        paragraphs: [
          "No devKit, escolha o tipo: URL (cole o link), Wi-Fi (SSID, segurança WPA/WPA2 e senha) ou WhatsApp (número com DDI, ex.: 5511999999999, e mensagem opcional). Também há texto, e-mail e telefone.",
          "Personalize a cor dos módulos e do fundo — mantenha contraste alto. Ajuste correção de erro (médio ou alto para impressão). Baixe PNG para web e redes sociais, ou SVG para impressão grande, logos e edição posterior.",
        ],
      },
      {
        heading: "Dicas para QR Codes que realmente funcionam",
        paragraphs: [
          "Contraste forte (preto no branco ainda é o mais seguro). Em impressos, no mínimo cerca de 2×2 cm. Teste com a câmera do celular antes de publicar. Para WhatsApp e Wi-Fi, confira número e senha — um erro pequeno e o código falha.",
        ],
      },
      {
        heading: "Quando vale a pena personalizar?",
        paragraphs: [
          "Cartões de visita, embalagens, cardápios, credenciais e materiais de marketing. Não exagere: cores claras demais ou fundo complexo prejudicam a leitura. O código precisa continuar escaneável.",
        ],
      },
      {
        heading: "Conclusão",
        paragraphs: [
          "Criar QR para URL, Wi-Fi e WhatsApp ficou simples: gere, personalize e baixe em segundos no navegador. Útil no pessoal, no negócio e em eventos — economiza tempo e melhora a experiência de quem te encontra.",
          "Se o destino da campanha pode mudar depois da impressão, veja também o QR Code dinâmico do devKit.",
        ],
      },
    ],
  },
  {
    slug: "qr-code-dinamico",
    title:
      "QR Code dinâmico: crie códigos com destino editável, pausa e expiração",
    description:
      "Altere o link sem reimprimir o QR. Pause campanhas, defina expiração e compare QR dinâmico vs estático — direto no navegador.",
    toolHref: "/qr-code/dinamico",
    toolLabel: "Abrir gerador de QR Code dinâmico da devKit",
    publishedAt: "2026-08-03",
    readingMinutes: 8,
    keywords: [
      "QR Code dinâmico",
      "QR dinâmico",
      "destino editável QR",
      "QR com expiração",
      "pausar QR Code",
      "QR marketing",
      "redirect QR",
      "gerador QR dinâmico",
    ],
    cover: {
      src: cover("qr-code-dinamico"),
      alt: "Analytics em laptop",
      credit: "Carlos Muza / Unsplash",
      creditUrl: "https://unsplash.com/photos/hpjSkU2UYSU",
    },
    sections: [
      {
        heading: "O que é um QR Code dinâmico?",
        paragraphs: [
          "QR Codes tradicionais embutem o destino de forma fixa: depois de impressos, não dá para mudar o link sem gerar outro código. O QR dinâmico aponta para uma URL intermediária que redireciona ao destino configurado — você altera o link, pausa ou expira sem trocar a imagem.",
          "Exemplo: hoje o QR leva à promoção de julho; amanhã, à de agosto. O código impresso continua o mesmo; só o destino muda.",
        ],
      },
      {
        heading: "Vantagens: editar, pausar e expirar",
        paragraphs: [
          "Altere o destino quando quiser — ideal para material impresso, cartões, embalagens, banners, flyers, manuais e catálogos.",
          "Pause o redirecionamento sem apagar o QR: promoções encerradas, eventos, testes internos ou manutenção de páginas.",
          "Defina expiração para cupons, feiras, campanhas e testes temporários. Depois, o QR pode parar de funcionar ou ir para uma página informativa. Se a landing mudar de URL, basta atualizar o destino — sem reimprimir.",
        ],
      },
      {
        heading: "Casos de uso e comparação com QR estático",
        paragraphs: [
          "Marketing: trocar landing sem reimprimir. Eventos: mudar páginas conforme a agenda. Desenvolvimento: alternar endpoints e homologação com o mesmo QR. Atendimento: atualizar suporte e FAQ sem substituir material distribuído.",
          "Estático: destino fixo, sem status nem expiração — qualquer mudança exige novo QR. Dinâmico: destino editável, pausa/reativação e expiração, mantendo a mesma imagem.",
        ],
      },
      {
        heading: "Benefícios para desenvolvimento e boas práticas",
        paragraphs: [
          "Em QA e homologação: alternar dev/prod, atualizar endpoints, compartilhar um QR com o time, simular campanhas temporárias e validar fluxos antes de publicar.",
          "Use URLs curtas e confiáveis, configure expiração quando fizer sentido, desative QRs de campanhas encerradas, revise o destino antes de divulgar e evite páginas temporárias sem planejamento.",
        ],
      },
      {
        heading: "Perguntas frequentes",
        paragraphs: [
          "Posso alterar o destino depois? Sim — é a principal vantagem. A imagem muda? Não. Dá para expirar? Sim, com data/hora. Pausar? Sim, desative e reative quando precisar.",
        ],
      },
    ],
  },
  {
    slug: "iban-para-testes",
    title:
      "Gerador e validador de IBAN: crie contas bancárias de teste para desenvolvimento",
    description:
      "Gere IBAN sintético por país e valide estrutura e dígitos MOD 97 no navegador — ideal para fintechs, APIs bancárias e QA internacional.",
    toolHref: "/iban",
    toolLabel: "Abrir gerador e validador de IBAN da devKit",
    publishedAt: "2026-08-03",
    readingMinutes: 8,
    keywords: [
      "gerador IBAN",
      "validador IBAN",
      "IBAN online",
      "IBAN sintético",
      "International Bank Account Number",
      "MOD 97",
      "conta bancária teste",
      "pagamento internacional",
    ],
    cover: {
      src: cover("iban-para-testes"),
      alt: "Gráfico de mercado financeiro",
      credit: "Nick Chong / Unsplash",
      creditUrl: "https://unsplash.com/photos/N_aihp118p8",
    },
    sections: [
      {
        heading: "O que é um IBAN?",
        paragraphs: [
          "O IBAN (International Bank Account Number) identifica contas em transferências internacionais. É padrão na Europa e em várias regiões — essencial para fintechs, ERPs e integrações bancárias.",
          "Estrutura típica: código do país (2 letras), dígitos verificadores (2 números), banco, agência (quando houver) e número da conta. Exemplos: DE89 3704 0044 0532 0130 00 e GB29 NWBK 6016 1331 9268 19. Cada país tem tamanho e regras próprias.",
        ],
      },
      {
        heading: "Para que serve um gerador de IBAN?",
        paragraphs: [
          "O gerador cria números sintéticos no padrão do país escolhido — para desenvolvimento, homologação e testes automatizados: cadastros bancários, pagamentos internacionais, formulários, fixtures, APIs financeiras e massa de teste.",
          "O IBAN gerado não representa conta real. Não use em produção nem em operações oficiais.",
        ],
      },
      {
        heading: "O que significa validar um IBAN?",
        paragraphs: [
          "Validar não confirma se a conta existe. Confere país, comprimento, caracteres, dígitos verificadores (algoritmo MOD 97 / ISO 7064) e estrutura do país. Se passar, o IBAN é estruturalmente válido.",
        ],
      },
      {
        heading: "Países, benefícios e casos de uso",
        paragraphs: [
          "Adotam IBAN, entre outros: Alemanha, França, Espanha, Itália, Portugal, Países Baixos, Bélgica, Áustria, Irlanda, Reino Unido (ainda usa o padrão), Suíça, Suécia, Noruega e Polônia. No devKit você escolhe o país na geração.",
          "Benefícios: privacidade (sem contas reais), testes confiáveis por formato, geração rápida e automação em escala. Casos: fintechs, bancos digitais, gateways, câmbio, ERP, gestão financeira, APIs bancárias, QA e back-end.",
        ],
      },
      {
        heading: "Perguntas frequentes e boas práticas",
        paragraphs: [
          "Pertence a uma conta real? Não. Validação confirma existência? Não — só padrão e DVs. Pode escolher o país? Sim. Precisa instalar? Não — roda no navegador.",
          "Use só sintéticos em teste. Não publique dados bancários reais em homologação. Valide o formato antes de enviar a APIs financeiras. Separe claramente teste e produção.",
        ],
      },
    ],
  },
  {
    slug: "ssn-e-vat",
    title:
      "Gerador de SSN e VAT: crie documentos de teste para desenvolvimento e QA",
    description:
      "Gere e valide SSN (EUA) e VAT/IVA europeu com formato válido para fixtures internacionais — sem dados reais e sem consulta a bases oficiais.",
    toolHref: "/ssn",
    toolLabel: "Abrir gerador de SSN da devKit",
    publishedAt: "2026-08-03",
    readingMinutes: 8,
    keywords: [
      "gerador SSN",
      "gerador VAT",
      "VAT IVA",
      "SSN para testes",
      "Social Security Number",
      "Value Added Tax",
      "documentos internacionais",
      "fixtures QA",
    ],
    cover: {
      src: cover("ssn-e-vat"),
      alt: "Mapa-múndi e globalização",
      credit: "Chuttersnap / Unsplash",
      creditUrl: "https://unsplash.com/photos/9AqIdDXcMc8",
    },
    sections: [
      {
        heading: "O que é um SSN?",
        paragraphs: [
          "Em sistemas com clientes internacionais, cadastros pedem SSN (Social Security Number, EUA) ou VAT/IVA (Europa). Usar dados reais em teste esbarra em LGPD e GDPR — o ideal é um gerador de SSN e VAT com formato válido para desenvolvimento, automação e demos.",
          "O SSN identifica cidadãos e residentes autorizados nos EUA: cadastro, impostos, emprego, bancos e serviços. Formato clássico: 123-45-6789. Um SSN gerado para teste não é identidade real e não serve para uso oficial.",
        ],
      },
      {
        heading: "O que é VAT ou IVA?",
        paragraphs: [
          "VAT (Value Added Tax) é o identificador fiscal de empresas em vários países da UE. Cada país tem formato próprio — por exemplo DE123456789 (Alemanha), FRXX123456789 (França), ESA12345674 (Espanha), IT12345678901 (Itália), PT123456789 (Portugal).",
          "No devKit, use /ssn para Social Security Number e /vat para IVA europeu. Ambos geram e validam formato no navegador, sem consultar registros oficiais.",
        ],
      },
      {
        heading: "Para que serve um gerador de SSN e VAT?",
        paragraphs: [
          "Desenvolvimento: formulários internacionais sem dados reais. APIs: endpoints que exigem documento estrangeiro. Automação: milhares de fixtures para regras de negócio. Demos e ensino: apresentar e praticar sem expor pessoas.",
          "Validação de formato detecta digitação errada, testa regras de formulário e cenários de erro/sucesso. Validar formato não confirma existência nem emissão por autoridade oficial.",
        ],
      },
      {
        heading: "Benefícios de documentos fictícios",
        paragraphs: [
          "Proteção de dados e alinhamento a LGPD, GDPR e CCPA. Economia de tempo: documentos com formato certo em segundos. Testes melhores: cenários consistentes sem comprometer privacidade.",
        ],
      },
      {
        heading: "Quem usa e perguntas frequentes",
        paragraphs: [
          "Desenvolvedores, QA, engenheiros de teste, DevOps, empresas de software, integradores de API e estudantes.",
          "O SSN pertence a alguém? Não — é fictício para teste. VAT serve para NF-e? Não — só simulação. Produção? Não. A ferramenta confirma existência? Não: só formato/algoritmo, sem base governamental.",
        ],
      },
    ],
  },
  {
    slug: "metadados-exif-de-imagem",
    title:
      "Metadados de imagem online: visualize EXIF, GPS e informações da câmera sem fazer upload",
    description:
      "Importe uma foto e veja EXIF, localização GPS, câmera e dados do arquivo no navegador — sem enviar a imagem para nenhum servidor.",
    toolHref: "/metadados",
    toolLabel: "Abrir visualizador de metadados da devKit",
    publishedAt: "2026-08-03",
    readingMinutes: 8,
    keywords: [
      "metadados de imagem",
      "EXIF",
      "visualizar EXIF",
      "GPS foto",
      "metadados online",
      "EXIF viewer",
      "dados da câmera",
      "localização foto",
    ],
    cover: {
      src: cover("metadados-exif-de-imagem"),
      alt: "Câmera fotográfica",
      credit: "Camila Damásio / Unsplash",
      creditUrl: "https://unsplash.com/photos/mNrdcSQhT6E",
    },
    sections: [
      {
        heading: "O que são metadados de imagem?",
        paragraphs: [
          "Toda foto digital guarda mais do que pixels. JPEG, HEIC, TIFF e outros formatos podem trazer modelo da câmera, data da captura, lente e até GPS. Com um visualizador de metadados, você importa a foto e analisa isso no navegador — no devKit, sem upload para servidor.",
          "Metadados são dados embutidos na captura ou edição: data/hora, fabricante, modelo, exposição, distância focal, ISO, obturador, abertura, GPS (quando houver), dimensões e tamanho do arquivo. Em geral ficam no padrão EXIF (Exchangeable Image File Format).",
        ],
      },
      {
        heading: "O que é EXIF?",
        paragraphs: [
          "EXIF é o padrão usado por câmeras e smartphones para registrar automaticamente detalhes da foto: marca e modelo, data/hora, GPS, focal, ISO, tempo de exposição, abertura (f/), resolução e orientação.",
          "Útil para fotógrafos, desenvolvedores, jornalistas e quem precisa analisar imagens com rigor técnico.",
        ],
      },
      {
        heading: "O que é possível descobrir?",
        paragraphs: [
          "Câmera: fabricante, modelo, lente, firmware. Fotografia: ISO, abertura, obturador, compensação, focal, modo de disparo, flash. Arquivo: largura, altura, formato, tamanho, profundidade de cor.",
          "GPS: latitude, longitude, altitude e data — se o aparelho gravou a posição. WhatsApp e redes sociais costumam remover EXIF/GPS ao publicar; use o arquivo original da galeria. O devKit converte GPS em graus/minutos/segundos para decimal quando necessário.",
        ],
      },
      {
        heading: "Por que verificar os metadados?",
        paragraphs: [
          "Privacidade: antes de compartilhar, confira se há GPS ou dados do dispositivo.",
          "Técnica: fotógrafos revisam as configurações de cada captura. Análise: conferir arquivos recebidos sem instalar software. Desenvolvimento: validar se o app grava EXIF corretamente.",
        ],
      },
      {
        heading: "Privacidade em primeiro lugar",
        paragraphs: [
          "No devKit a imagem é processada localmente no navegador: não vai para servidor, não fica armazenada e o processamento roda no seu computador. Ideal para fotos pessoais, documentos e material sensível.",
        ],
      },
      {
        heading: "Quem usa e perguntas frequentes",
        paragraphs: [
          "Fotógrafos, desenvolvedores, designers, jornalistas, analistas forenses, marketing, estudantes e quem quer proteger privacidade.",
          "A foto sobe para a internet? Não — fica no dispositivo. Toda imagem tem EXIF? Não; edição, redes e compressão removem. GPS? Só se a captura registrou coordenadas. Formatos: tipicamente JPEG/JPG, TIFF, HEIC e outros com EXIF.",
        ],
      },
    ],
  },
  {
    slug: "curl-online-no-navegador",
    title:
      "cURL Online: execute requisições HTTP e analise respostas diretamente no navegador",
    description:
      "Cole um comando curl, execute no browser e veja status, headers e body. Ideal para testar APIs REST sem abrir o terminal — com atenção ao CORS.",
    toolHref: "/curl",
    toolLabel: "Abrir cURL Online da devKit",
    publishedAt: "2026-08-03",
    readingMinutes: 8,
    keywords: [
      "curl online",
      "executar curl",
      "testar API",
      "HTTP client online",
      "colar curl",
      "requisição HTTP",
      "headers HTTP",
      "CORS",
      "API REST",
    ],
    cover: {
      src: cover("curl-online-no-navegador"),
      alt: "Código em monitor",
      credit: "Fotis Fotopoulos / Unsplash",
      creditUrl: "https://unsplash.com/photos/DuHKoV44prg",
    },
    sections: [
      {
        heading: "O que é cURL?",
        paragraphs: [
          "O cURL é uma das ferramentas mais usadas para testar APIs, enviar requisições HTTP e depurar integrações. Nem sempre é prático abrir o terminal só por um comando — um cURL online deixa você colar o comando, executar no navegador e ver status, headers e body de forma organizada.",
          "cURL (Client URL) envia requisições HTTP/HTTPS: GET, POST, PUT, PATCH, DELETE, JSON, autenticação, upload e download. Por isso aparece em docs de API, Postman e exemplos de integração.",
        ],
      },
      {
        heading: "Por que usar um cURL online?",
        paragraphs: [
          "Sem instalar nada: abra o browser, cole e execute. A interface deixa a resposta mais legível que o terminal puro — status (200, 401, 500…), tempo, headers e body.",
          "Mais produtividade: menos alternância entre terminal, editor e navegador durante o teste. Ideal para APIs REST, microsserviços e desenvolvimento web no dia a dia.",
        ],
      },
      {
        heading: "O que é possível fazer?",
        paragraphs: [
          "Testar APIs REST, enviar HTTP com headers e JSON, validar Bearer Token, exercitar webhooks, simular cliente HTTP e inspecionar a resposta do servidor.",
          "Exemplo GET: curl https://api.exemplo.com/usuarios — resposta típica em JSON com lista de recursos.",
          "Exemplo POST: curl -X POST … -H \"Content-Type: application/json\" -d '{\"email\":\"…\",\"senha\":\"…\"}' — comum em login e envio de payload. No devKit você cola o comando na aba cURL ou monta no Builder.",
        ],
      },
      {
        heading: "Status, headers e body",
        paragraphs: [
          "Status HTTP: 200 OK, 201 Created, 204 No Content, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Internal Server Error — o código resume o resultado.",
          "Headers: Content-Type, Authorization, Cache-Control, Server, Date, Content-Length ajudam a achar problemas de auth, cache e config.",
          "Body: JSON, XML, HTML, texto ou mensagem de erro. Ler o corpo é essencial para entender o comportamento da API. No devKit, body e headers ficam em abas separadas.",
        ],
      },
      {
        heading: "CORS e o navegador",
        paragraphs: [
          "A requisição sai do seu browser. APIs sem CORS adequado bloqueiam a chamada. O devKit não faz proxy — não contorna essa regra de segurança.",
          "GET/POST/PUT/PATCH/DELETE funcionam quando o servidor aceita a origem. Se bloquear, use o mesmo curl no terminal. A flag -k não se aplica como no CLI: o TLS é o do browser.",
        ],
      },
      {
        heading: "Casos de uso e vantagens",
        paragraphs: [
          "Desenvolvimento de APIs, autenticação JWT, serviços externos, debug de webhooks, microsserviços, APIs públicas, front-end e back-end.",
          "Vantagens: interface clara, sem terminal, resposta organizada, execução rápida, fácil copiar o comando e ótimo para aprendizado e depuração.",
        ],
      },
      {
        heading: "Perguntas frequentes",
        paragraphs: [
          "Qualquer curl? A maioria dos comandos HTTP, se o browser e o CORS permitirem.",
          "Suporta JSON? Sim — payload, headers e APIs REST. Combine com o formatador JSON do devKit se precisar validar o body.",
          "Precisa instalar algo? Não. Roda no navegador. Não cole tokens de produção.",
        ],
      },
    ],
  },
  {
    slug: "formatar-json",
    title:
      "Formatar e validar JSON online: organize, minifique e encontre erros em segundos",
    description:
      "Pretty print, minifique e valide JSON no navegador. Entenda o que é JSON, erros comuns de sintaxe e por que formatar payloads de API.",
    toolHref: "/json",
    toolLabel: "Abrir formatador JSON da devKit",
    publishedAt: "2026-08-03",
    readingMinutes: 7,
    keywords: [
      "formatar JSON",
      "validar JSON",
      "JSON online",
      "pretty print JSON",
      "minificar JSON",
      "JSON formatter",
      "JSON validator",
      "erro de sintaxe JSON",
    ],
    cover: {
      src: cover("formatar-json"),
      alt: "Código JSON em tela",
      credit: "Luca Bravo / Unsplash",
      creditUrl: "https://unsplash.com/photos/XJXWbfSo2f0",
    },
    sections: [
      {
        heading: "O que é JSON?",
        paragraphs: [
          "Trabalhar com JSON faz parte da rotina de quem usa APIs. Um arquivo mal formatado ou com um erro pequeno de sintaxe pode quebrar integrações e custar tempo para achar. Com um formatador e validador online, você organiza (pretty print), minifica e valida direto no navegador — sem instalar nada e, no devKit, sem enviar o conteúdo a um servidor.",
          "JSON (JavaScript Object Notation) é um formato leve para troca de dados. A simplicidade e o suporte em quase todas as linguagens fizeram dele o padrão das APIs REST e de muitos sistemas modernos. Exemplo válido: nome Maria, idade 28, cidade Fortaleza — em chaves, com aspas e vírgulas corretas.",
        ],
      },
      {
        heading: "Por que formatar um JSON?",
        paragraphs: [
          "JSON em uma linha só é difícil de ler: {\"nome\":\"Maria\",\"idade\":28,\"cidade\":\"Fortaleza\"}.",
          "Com Pretty Print, a estrutura ganha indentação e quebras de linha. Fica mais fácil ler, manter e depurar payloads de API, configs e fixtures de teste.",
        ],
      },
      {
        heading: "Validação de JSON",
        paragraphs: [
          "Além de formatar, confira se o JSON é válido. Erros comuns: vírgulas extras, aspas faltando, chaves ou colchetes abertos, valores inválidos e comentários (JSON padrão não aceita // nem /* */).",
          "Um validador aponta o problema na hora e evita caça às bruxas no meio do desenvolvimento.",
        ],
      },
      {
        heading: "Minificar JSON",
        paragraphs: [
          "Minificar remove espaços, quebras e indentação. O resultado fica compacto — útil para reduzir tamanho de requisição/resposta ou armazenar configs densas. Formatar e minificar são o mesmo dado sob duas “roupas” diferentes.",
        ],
      },
      {
        heading: "Benefícios e quem usa",
        paragraphs: [
          "Organização instantânea, feedback de sintaxe, minificação, tudo no browser e mais produtividade em testes e integrações.",
          "Útil para front-end, back-end, QA, DevOps, estudantes, integradores de API e quem trabalha com dados. Casos típicos: resposta de API REST, payload de request, validar antes de importar, configs, documentação e correção de sintaxe.",
        ],
      },
      {
        heading: "Perguntas frequentes",
        paragraphs: [
          "O JSON vai para um servidor? No devKit o processamento é no navegador — o conteúdo fica no seu dispositivo.",
          "Arquivos grandes? Em geral sim; o limite prático depende do tamanho e da memória do browser.",
          "Formatar vs validar: formatar organiza visualmente; validar verifica se a sintaxe está correta. No devKit você faz os dois (e ainda minifica).",
        ],
      },
    ],
  },
  {
    slug: "base64-texto-guia-completo",
    title:
      "Base64: Texto ↔ Base64 — o guia completo para entender, converter e evitar erros",
    description:
      "Aprenda o que é Base64, como funciona, quando usar (e quando não), erros comuns e como converter Texto ↔ Base64 no navegador.",
    toolHref: "/base64",
    toolLabel: "Abrir conversor Base64 da devKit",
    publishedAt: "2026-08-03",
    readingMinutes: 9,
    keywords: [
      "base64",
      "converter base64",
      "texto para base64",
      "base64 para texto",
      "encode base64",
      "decode base64",
      "base64 online",
      "codificação base64",
    ],
    cover: {
      src: cover("base64-encode-decode"),
      alt: "Laptop com código",
      credit: "Clément Hélardot / Unsplash",
      creditUrl: "https://unsplash.com/photos/95YRwf6CNw8",
    },
    sections: [
      {
        heading: "O que é Base64?",
        paragraphs: [
          "A codificação Base64 está presente em APIs, autenticação, e-mails, upload de arquivos, imagens embutidas em páginas e muito mais. Mesmo assim, muita gente ainda confunde Base64 com criptografia — e isso gera bugs e riscos de segurança.",
          "Base64 é um método de codificação que transforma dados binários em uma sequência de texto, usando 64 caracteres: A–Z, a–z, 0–9, + e /. Quando necessário, o = entra como padding. O objetivo é transmitir binário por canais que só aceitam texto.",
        ],
      },
      {
        heading: "Base64 não é criptografia",
        paragraphs: [
          "Esse é o erro mais comum. Um texto em Base64 não está protegido. Exemplo: Senha123 vira U2VuaGExMjM= — qualquer pessoa decodifica em segundos.",
          "Para proteger dados, use criptografia (como AES) ou, no caso de senhas, hashes adequados (bcrypt, Argon2). Base64 só codifica; não esconde.",
        ],
      },
      {
        heading: "Como funciona a conversão Texto ↔ Base64",
        paragraphs: [
          "Texto → Base64: você informa um texto e recebe a representação codificada. Exemplo: Olá Mundo → T2zDoSBNdW5kbw== (com suporte a UTF-8).",
          "Base64 → Texto: você cola uma string Base64 válida e recupera o conteúdo original. Exemplo: SGVsbG8gV29ybGQ= → Hello World.",
          "No devKit, escolha o sentido da conversão e veja o resultado ao digitar — decode só faz sentido com Base64 válida, evitando o erro clássico de “decodificar” texto puro.",
        ],
      },
      {
        heading: "Quando usar Base64?",
        paragraphs: [
          "Envio de imagens em APIs: muitas APIs aceitam image em Base64 no JSON, sem multipart separado.",
          "Data URLs: incorporar imagem no HTML/CSS com data:image/png;base64,… — útil para reduzir requisições em cenários pontuais.",
          "HTTP Basic Authentication: usuário:senha é codificado em Base64 no header. Isso não protege credenciais — use sempre HTTPS.",
          "Anexos de e-mail (MIME): PDFs, imagens e planilhas viajam como Base64.",
          "APIs REST: arquivos embutidos em JSON (campo file com conteúdo Base64) são comuns em integrações.",
        ],
      },
      {
        heading: "Vantagens e desvantagens",
        paragraphs: [
          "Vantagens: funciona em praticamente qualquer linguagem, facilita transporte de binário, evita problemas com caracteres especiais e é simples de integrar entre sistemas.",
          "Desvantagens: o tamanho cresce cerca de 33%; não há segurança; arquivos grandes consomem mais memória e CPU na conversão. Para uploads pesados, prefira multipart ou storage direto.",
        ],
      },
      {
        heading: "Erros mais comuns",
        paragraphs: [
          "Confundir Base64 com criptografia — só codifica.",
          "Armazenar senhas em Base64 — nunca; use bcrypt ou Argon2.",
          "Enviar dados sensíveis sem HTTPS — Base64 não evita interceptação.",
          "Usar Base64 para arquivos enormes — o overhead de tamanho e processamento costuma doer.",
          "Tentar decodificar texto que não é Base64 — valide a string antes de processar.",
        ],
      },
      {
        heading: "Exemplo rápido em JavaScript",
        paragraphs: [
          "Texto → Base64 com UTF-8: btoa(unescape(encodeURIComponent(texto))).",
          "Base64 → Texto: decodeURIComponent(escape(atob(base64))). Em apps modernas, preferir TextEncoder/TextDecoder ou APIs que já tratam Unicode corretamente — como o conversor da devKit no navegador.",
        ],
      },
      {
        heading: "Quando usar um conversor online?",
        paragraphs: [
          "Ideal para testar APIs, conferir tokens, validar respostas, trabalhar com JSON, depurar integrações e converter sem escrever código. Prefira ferramentas que rodam localmente no navegador, para não enviar seus dados a um servidor.",
          "Dicas: use Base64 só para codificação; sempre HTTPS; evite arquivos gigantes quando houver alternativa; valide a string antes de decodificar.",
        ],
      },
    ],
  },
  {
    slug: "codigos-http-status",
    title:
      "Códigos HTTP e status do servidor: referência completa (1xx a 5xx)",
    description:
      "Entenda os códigos de resposta HTTP — 1xx, 2xx, 3xx, 4xx e 5xx —, o impacto em SEO e como checar status no navegador, curl e na referência da devKit.",
    toolHref: "/http-status",
    toolLabel: "Abrir referência de códigos HTTP da devKit",
    publishedAt: "2026-08-07",
    readingMinutes: 10,
    keywords: [
      "códigos HTTP",
      "status HTTP",
      "HTTP status codes",
      "erro 404",
      "erro 500",
      "301 redirect",
      "503 service unavailable",
      "códigos de resposta HTTP",
    ],
    cover: {
      src: cover("codigos-http-status"),
      alt: "Rede e infraestrutura digital",
      credit: "NASA / Unsplash",
      creditUrl: "https://unsplash.com/photos/Q1p7bh3SHj8",
    },
    sections: [
      {
        heading: "O que são códigos de resposta HTTP?",
        paragraphs: [
          "O servidor fala com o navegador usando códigos de três dígitos. Esses status HTTP dizem se a página carregou, foi redirecionada ou falhou. Você os vê ao depurar o site, checar links quebrados ou entender por que buscadores não indexam uma URL.",
          "A IANA (Internet Assigned Numbers Authority) organiza esses códigos. Não são aleatórios: cada um pertence a uma categoria que explica o que aconteceu com a requisição. Dominá-los economiza horas de troubleshooting e evita prejuízos de SEO.",
          "Neste guia cobrimos as categorias padronizadas, o impacto nos rankings e como consultar a lista completa na referência da devKit.",
        ],
      },
      {
        heading: "As cinco categorias de status HTTP",
        paragraphs: [
          "1XX — Informacional: o servidor recebeu a requisição e está processando. Em geral o usuário não vê esses códigos; são sinais temporários entre cliente e servidor.",
          "2XX — Sucesso: a requisição foi entendida e atendida. Página carregou, formulário enviado, recurso criado. É o que você quer ver.",
          "3XX — Redirecionamento: o conteúdo mudou de lugar e o servidor aponta a nova URL. Pode ser temporário ou permanente.",
          "4XX — Erro do cliente: URL errada, sem permissão, página inexistente. O problema está na requisição ou no usuário.",
          "5XX — Erro do servidor: crash, gateway, timeout, sobrecarga. O problema está na hospedagem ou na configuração.",
        ],
      },
      {
        heading: "1XX — Informacionais",
        paragraphs: [
          "100 Continue: o servidor aceitou os headers e está pronto para o corpo da requisição — evita desperdiçar banda em pedidos que seriam rejeitados.",
          "101 Switching Protocols: troca de protocolo (ex.: HTTP → WebSocket ou HTTP/2) quando isso beneficia os dois lados.",
          "102 Processing: ainda processando; evita timeout em operações longas.",
          "103 Early Hints: sugere preload de CSS/JS enquanto a resposta completa é preparada, acelerando a renderização.",
        ],
      },
      {
        heading: "2XX — Sucesso",
        paragraphs: [
          "200 OK: sucesso. O significado depende do método (GET buscou, POST enviou, PUT atualizou, DELETE removeu). É o código ideal.",
          "201 Created: recurso criado (comum após POST/PUT), muitas vezes com Location apontando para a nova URI.",
          "202 Accepted: aceito, mas ainda não processado — típico de filas e operações assíncronas.",
          "204 No Content: sucesso sem corpo na resposta (útil após delete ou ações que não precisam atualizar a tela).",
          "206 Partial Content: entrega parcial com Range — base de resume de download e streaming de vídeo.",
          "Outros 2XX úteis: 203 (proxy modificou a resposta), 205 (reset da view), 207/208 (Multi-Status WebDAV), 226 (IM Used).",
        ],
      },
      {
        heading: "3XX — Redirecionamentos",
        paragraphs: [
          "301 Moved Permanently: URL mudou de forma permanente. Buscadores transferem autoridade da página antiga para a nova — use em mudanças definitivas de URL.",
          "302 Found: redirecionamento temporário. Em geral mantenha a URL original para o futuro; não transfira SEO como o 301.",
          "307 Temporary Redirect e 308 Permanent Redirect: equivalentes modernos que preservam o método HTTP (POST continua POST).",
          "304 Not Modified: use o cache — economiza banda em GET/HEAD condicionais (If-None-Match, If-Modified-Since).",
          "303 See Other: após um POST, redireciona o cliente para outro recurso via GET (padrão Post/Redirect/Get).",
        ],
      },
      {
        heading: "4XX — Erros do cliente",
        paragraphs: [
          "400 Bad Request: sintaxe inválida, parâmetros ruins ou rota incorreta.",
          "401 Unauthorized: falta autenticação ou credenciais inválidas. 403 Forbidden: autenticado ou não, o acesso é negado — reautenticar costuma não resolver.",
          "404 Not Found: recurso não existe. Em sites, link quebrado; em APIs, endpoint sem o item. Afeta UX e SEO.",
          "410 Gone: recurso removido de propósito e de forma permanente — buscadores tendem a desindexar mais rápido que no 404.",
          "429 Too Many Requests: rate limit. Respeite Retry-After quando existir.",
          "Outros comuns: 405 (método não permitido), 408 (timeout), 409 (conflito), 413 (payload grande), 415 (media type), 422 (validação semântica), 418 (I’m a Teapot — easter egg), 451 (razões legais).",
        ],
      },
      {
        heading: "5XX — Erros do servidor",
        paragraphs: [
          "500 Internal Server Error: erro genérico no servidor. O cliente não “conserta”; olhe logs, plugins, memória e permissões.",
          "502 Bad Gateway: o proxy/gateway recebeu resposta inválida do upstream.",
          "503 Service Unavailable: sobrecarga ou manutenção. Use Retry-After e volte rápido — 503 longos prejudicam crawl.",
          "504 Gateway Timeout: o upstream não respondeu a tempo.",
          "Outros: 501 (não implementado), 505 (versão HTTP), 507 (disco cheio), 508 (loop), 511 (captive portal / autenticação de rede).",
        ],
      },
      {
        heading: "Como verificar o status HTTP",
        paragraphs: [
          "No navegador: clique com o botão direito → Inspecionar → aba Rede (Network) → recarregue a página. Cada requisição mostra status, tamanho e tempo.",
          "Com curl: curl -I https://exemplo.com devolve os headers, incluindo o status — rápido e fácil de automatizar.",
          "Para várias URLs: extensões como Redirect Path ou crawlers (Screaming Frog) destacam códigos problemáticos.",
          "Na devKit, a referência de códigos HTTP lista 1xx–5xx com busca e filtro por categoria — útil no dia a dia de debug.",
        ],
      },
      {
        heading: "Impacto dos códigos HTTP no SEO",
        paragraphs: [
          "200: páginas acessíveis entram no índice e podem ranquear. Padrão estável de 200 transmite confiabilidade.",
          "301: preserva equity em mudanças permanentes de URL. Evite cadeias longas de redirect.",
          "302: temporário — não transfira SEO como se fosse 301. Use em testes A/B, manutenção pontual ou campanhas sazonais.",
          "404: páginas saem do índice, tráfego some e backlinks perdem valor. Corrija, restaure ou redirecione com 301 para conteúdo relevante. Uma página 404 customizada com busca e links ajuda o usuário.",
          "410: remoção intencional e definitiva — mais explícito que 404 para desindexar.",
          "500/503 prolongados: reduzem crawl e podem derrubar ranking. Monitore uptime e recursos de hosting.",
        ],
      },
      {
        heading: "301 vs 302 e 404 vs 410",
        paragraphs: [
          "301 = permanente + transferência de autoridade. Atualize links internos, evite cadeias e envie sitemap atualizado.",
          "302 = temporário. Se a mudança virou definitiva, troque para 301 — caso contrário a autoridade fica “dividida”.",
          "404 = “não está aqui agora”. 410 = “foi embora de propósito”. Use 410 quando quiser sinalizar remoção definitiva sem redirect; use 301 quando ainda houver valor de link/tráfego para preservar.",
        ],
      },
      {
        heading: "Perguntas frequentes",
        paragraphs: [
          "Quantos códigos HTTP existem? O registro IANA cobre 100–599; dezenas são padronizados e amplamente usados — o restante é não atribuído ou específico de plataforma.",
          "Vale checar erros de status no site? Sim: melhora performance percebida, UX e rankings. Use Search Console, DevTools e crawlers.",
          "Como corrigir 4xx e 5xx? 4xx: URL, permissões, autenticação. 5xx: logs, config, recursos e suporte do host.",
          "Qual a diferença entre 301 e 302? 301 permanente com SEO; 302 temporário sem transferir equity completo.",
          "Por que 404 machuca SEO? Desindexação, perda de tráfego e de link equity; usuários frustrados saem.",
        ],
      },
      {
        heading: "Conclusão",
        paragraphs: [
          "Códigos HTTP são o idioma entre cliente e servidor. Saber ler 2xx, 3xx, 4xx e 5xx acelera o debug e protege SEO.",
          "Use a referência da devKit para consultar qualquer status rapidamente, e combine com Network do navegador ou curl -I quando for inspecionar URLs reais.",
        ],
      },
    ],
  },
  {
    slug: "gerador-jwt-online",
    title:
      "Gerador JWT Online: entenda os benefícios e como criar tokens JWT com segurança",
    description:
      "Crie, decodifique e valide JSON Web Token no navegador. Saiba o que é JWT, Header, Payload, Signature e boas práticas de autenticação.",
    toolHref: "/jwt",
    toolLabel: "Abrir gerador JWT da devKit",
    publishedAt: "2026-08-03",
    readingMinutes: 8,
    keywords: [
      "gerador JWT",
      "decodificador JWT",
      "validar token JWT",
      "JSON Web Token",
      "JWT online",
      "JWT parser",
      "HS256",
      "Bearer Token",
    ],
    cover: {
      src: cover("jwt-encode-decode-validar"),
      alt: "Cadeado digital e segurança",
      credit: "FlyD / Unsplash",
      creditUrl: "https://unsplash.com/photos/iIJrUoeRoCQ",
    },
    sections: [
      {
        heading: "O que é um JWT?",
        paragraphs: [
          "JWT (JSON Web Token) é um dos padrões mais utilizados para autenticação e autorização em aplicações modernas. Se você trabalha com APIs REST, microsserviços, apps mobile ou sistemas web, certamente já precisou criar, validar ou decodificar um token JWT.",
          "É um padrão aberto (RFC 7519) criado para transmitir informações entre duas partes de forma compacta, segura e assinada digitalmente. Ter um gerador JWT online facilita o desenvolvimento, os testes e a depuração — sem escrever código só para montar um token.",
          "Um JWT é composto por três partes separadas por pontos: Header.Payload.Signature.",
        ],
      },
      {
        heading: "Header, Payload e Signature",
        paragraphs: [
          "O Header contém o algoritmo usado para assinar o token — por exemplo alg: HS256 e typ: JWT.",
          "O Payload guarda as Claims da autenticação, como sub, name, role e exp (data de expiração). Exemplo típico: sub 123, name João, role admin.",
          "A Signature garante que o token não foi alterado após a criação. Ela usa uma chave secreta (HS256) ou um par de chaves pública/privada (RS256, ES256 etc.).",
          "Importante: o payload não é criptografado, apenas codificado em Base64URL. Não coloque dados confidenciais nele.",
        ],
      },
      {
        heading: "Principais benefícios do JWT",
        paragraphs: [
          "Autenticação stateless: o servidor não precisa guardar sessão em memória ou banco para validar cada requisição. Isso facilita escalar arquiteturas distribuídas.",
          "Melhor escalabilidade: as informações de autenticação vão no próprio token. Vários servidores validam o JWT sem compartilhar sessões — ideal para microsserviços, Kubernetes, APIs REST, load balancers e cloud.",
          "Desempenho: na maioria dos casos basta verificar a assinatura criptográfica, reduzindo consultas repetidas ao banco.",
          "Compatibilidade ampla: há bibliotecas para Java, .NET, Node.js, Python, Go, PHP, Ruby, Rust, Kotlin e Swift.",
          "Padrão de APIs REST: o header Authorization: Bearer … tornou-se o fluxo mais comum entre cliente e servidor.",
          "Segurança (quando bem implementado): assinatura digital, integridade, expiração (exp), claims personalizadas e verificação da origem. Sempre use HTTPS e valide a assinatura antes de confiar no payload.",
        ],
      },
      {
        heading: "Quando utilizar um gerador JWT?",
        paragraphs: [
          "Um gerador JWT online acelera o dia a dia de desenvolvimento. Com ele você cria tokens rapidamente, testa autenticação, simula usuários, valida APIs, monta payloads diferentes, experimenta roles/permissões e confere datas de expiração (exp/nbf).",
          "É usado em sistemas corporativos, APIs REST, apps Android e iOS, React, Next.js, Angular, Vue, microsserviços, gateways, OAuth e OpenID Connect.",
        ],
      },
      {
        heading: "Boas práticas ao utilizar JWT",
        paragraphs: [
          "Use HTTPS em todas as requisições. Nunca exponha a chave secreta (e não cole segredos de produção em ferramentas online).",
          "Defina um tempo de expiração adequado (exp). Não armazene dados confidenciais no payload. Valide sempre a assinatura antes de confiar nas claims. Prefira algoritmos seguros e bibliotecas confiáveis.",
        ],
      },
      {
        heading: "Por que usar um gerador JWT online?",
        paragraphs: [
          "Criar tokens à mão atrasa o fluxo. Uma ferramenta no navegador permite gerar JWT na hora, editar Header e Payload, ver o token em tempo real, testar algoritmos, validar tokens existentes e decodificar JWT rapidamente — útil para achar problemas de autenticação.",
          "No devKit, o gerador JWT roda no seu navegador: você gera tokens, decodifica header/payload, valida HS256 com Web Crypto e testa payloads personalizados sem depender de um backend só para isso.",
        ],
      },
    ],
  },
];

export function getAllPosts() {
  // Ordenação estável: mesma data → desempate por slug (evita hydration mismatch).
  return [...BLOG_POSTS].sort((a, b) => {
    if (a.publishedAt !== b.publishedAt) {
      return a.publishedAt < b.publishedAt ? 1 : -1;
    }
    return a.slug.localeCompare(b.slug);
  });
}

export function getPost(slug: string) {
  return BLOG_POSTS.find((post) => post.slug === slug) ?? null;
}

export function getPostSlugs() {
  return BLOG_POSTS.map((post) => post.slug);
}

const MONTH_LABELS: Record<string, Record<string, string>> = {
  pt: {
    "2026-08": "Agosto 2026",
    "2026-07": "Julho 2026",
    "2026-06": "Junho 2026",
  },
  en: {
    "2026-08": "August 2026",
    "2026-07": "July 2026",
    "2026-06": "June 2026",
  },
  es: {
    "2026-08": "Agosto 2026",
    "2026-07": "Julio 2026",
    "2026-06": "Junio 2026",
  },
};

export function getPostsGroupedByMonth(locale = "pt"): BlogMonthGroup[] {
  const posts = getAllPosts();
  const map = new Map<string, BlogPost[]>();

  for (const post of posts) {
    const key = post.publishedAt.slice(0, 7);
    const list = map.get(key) ?? [];
    list.push(post);
    map.set(key, list);
  }

  const labels = MONTH_LABELS[locale] ?? MONTH_LABELS.pt;

  return [...map.entries()]
    .sort(([a], [b]) => (a < b ? 1 : -1))
    .map(([key, groupPosts]) => ({
      key,
      label:
        labels[key] ??
        new Intl.DateTimeFormat(locale === "pt" ? "pt-BR" : locale === "es" ? "es-ES" : "en-US", {
          month: "long",
          year: "numeric",
          timeZone: "UTC",
        }).format(new Date(`${key}-01T12:00:00.000Z`)),
      posts: groupPosts,
    }));
}

export function formatPostDate(date: string, locale = "pt") {
  // Locale fixo (não depende do ambiente Node/browser) — evita hydration mismatch.
  const tag = locale === "pt" ? "pt-BR" : locale === "es" ? "es-ES" : "en-US";
  return new Intl.DateTimeFormat(tag, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T12:00:00.000Z`));
}
