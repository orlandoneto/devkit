export type HttpStatusCategory = "1xx" | "2xx" | "3xx" | "4xx" | "5xx";

export type HttpStatusLocale = "pt" | "en" | "es";

export type HttpStatusCode = {
  code: number;
  name: string;
  category: HttpStatusCategory;
  description: Record<HttpStatusLocale, string>;
};

export const HTTP_STATUS_CATEGORIES: {
  id: HttpStatusCategory;
  range: string;
}[] = [
  { id: "1xx", range: "100–199" },
  { id: "2xx", range: "200–299" },
  { id: "3xx", range: "300–399" },
  { id: "4xx", range: "400–499" },
  { id: "5xx", range: "500–599" },
];

function d(pt: string, en: string, es: string) {
  return { pt, en, es };
}

/** Códigos HTTP padronizados (referência simples). */
export const HTTP_STATUS_CODES: HttpStatusCode[] = [
  {
    code: 100,
    name: "Continue",
    category: "1xx",
    description: d(
      "Servidor recebeu os headers e está pronto para o corpo da requisição.",
      "Server received the headers and is ready for the request body.",
      "El servidor recibió los headers y está listo para el cuerpo.",
    ),
  },
  {
    code: 101,
    name: "Switching Protocols",
    category: "1xx",
    description: d(
      "Servidor concordou em trocar de protocolo (ex.: WebSocket).",
      "Server agreed to switch protocols (e.g. WebSocket).",
      "El servidor aceptó cambiar de protocolo (ej.: WebSocket).",
    ),
  },
  {
    code: 102,
    name: "Processing",
    category: "1xx",
    description: d(
      "Servidor ainda processando — evita timeout em operações longas.",
      "Server is still processing — prevents timeouts on long operations.",
      "El servidor sigue procesando — evita timeouts en operaciones largas.",
    ),
  },
  {
    code: 103,
    name: "Early Hints",
    category: "1xx",
    description: d(
      "Sugere preload de recursos enquanto a resposta completa é preparada.",
      "Hints the browser to preload resources while the full response is prepared.",
      "Sugiere precargar recursos mientras se prepara la respuesta completa.",
    ),
  },
  {
    code: 200,
    name: "OK",
    category: "2xx",
    description: d(
      "Requisição bem-sucedida. O código que você quer ver.",
      "Request succeeded. The code you want to see.",
      "Solicitud exitosa. El código que quieres ver.",
    ),
  },
  {
    code: 201,
    name: "Created",
    category: "2xx",
    description: d(
      "Recurso criado (comum após POST/PUT).",
      "Resource created (common after POST/PUT).",
      "Recurso creado (común tras POST/PUT).",
    ),
  },
  {
    code: 202,
    name: "Accepted",
    category: "2xx",
    description: d(
      "Aceito, mas ainda não processado (assíncrono).",
      "Accepted but not yet processed (async).",
      "Aceptado, pero aún no procesado (asíncrono).",
    ),
  },
  {
    code: 203,
    name: "Non-Authoritative Information",
    category: "2xx",
    description: d(
      "Sucesso, mas um proxy modificou a resposta.",
      "Success, but a proxy modified the response.",
      "Éxito, pero un proxy modificó la respuesta.",
    ),
  },
  {
    code: 204,
    name: "No Content",
    category: "2xx",
    description: d(
      "Sucesso sem corpo na resposta (ex.: delete).",
      "Success with no response body (e.g. delete).",
      "Éxito sin cuerpo en la respuesta (ej.: delete).",
    ),
  },
  {
    code: 205,
    name: "Reset Content",
    category: "2xx",
    description: d(
      "Sucesso — o cliente deve resetar a view/formulário.",
      "Success — client should reset the document view/form.",
      "Éxito — el cliente debe reiniciar la vista/formulario.",
    ),
  },
  {
    code: 206,
    name: "Partial Content",
    category: "2xx",
    description: d(
      "Entrega parcial (Range) — downloads e streaming.",
      "Partial content (Range) — downloads and streaming.",
      "Contenido parcial (Range) — descargas y streaming.",
    ),
  },
  {
    code: 207,
    name: "Multi-Status",
    category: "2xx",
    description: d(
      "Vários status em uma resposta (WebDAV).",
      "Multiple statuses in one response (WebDAV).",
      "Varios estados en una respuesta (WebDAV).",
    ),
  },
  {
    code: 208,
    name: "Already Reported",
    category: "2xx",
    description: d(
      "Já reportado em Multi-Status (evita duplicatas DAV).",
      "Already reported in Multi-Status (avoids DAV duplicates).",
      "Ya reportado en Multi-Status (evita duplicados DAV).",
    ),
  },
  {
    code: 226,
    name: "IM Used",
    category: "2xx",
    description: d(
      "GET com instance manipulations aplicadas.",
      "GET with instance manipulations applied.",
      "GET con instance manipulations aplicadas.",
    ),
  },
  {
    code: 300,
    name: "Multiple Choices",
    category: "3xx",
    description: d(
      "Várias opções — o cliente precisa escolher.",
      "Multiple options — client needs to choose one.",
      "Varias opciones — el cliente debe elegir una.",
    ),
  },
  {
    code: 301,
    name: "Moved Permanently",
    category: "3xx",
    description: d(
      "URL mudou de forma permanente (bom para SEO).",
      "URL permanently moved (good for SEO).",
      "URL movida de forma permanente (bueno para SEO).",
    ),
  },
  {
    code: 302,
    name: "Found",
    category: "3xx",
    description: d(
      "Redirecionamento temporário. Use a URL original depois.",
      "Temporary redirect. Keep using the original URL later.",
      "Redirección temporal. Sigue usando la URL original después.",
    ),
  },
  {
    code: 303,
    name: "See Other",
    category: "3xx",
    description: d(
      "Veja outro recurso via GET (ex.: após POST).",
      "See another resource via GET (e.g. after POST).",
      "Ve otro recurso vía GET (ej.: tras POST).",
    ),
  },
  {
    code: 304,
    name: "Not Modified",
    category: "3xx",
    description: d(
      "Sem mudança — use o cache. Economiza banda.",
      "Not modified — use the cache. Saves bandwidth.",
      "Sin cambios — usa la caché. Ahorra ancho de banda.",
    ),
  },
  {
    code: 307,
    name: "Temporary Redirect",
    category: "3xx",
    description: d(
      "Redirect temporário mantendo o método HTTP.",
      "Temporary redirect keeping the same HTTP method.",
      "Redirect temporal manteniendo el método HTTP.",
    ),
  },
  {
    code: 308,
    name: "Permanent Redirect",
    category: "3xx",
    description: d(
      "Redirect permanente mantendo o método HTTP.",
      "Permanent redirect keeping the same HTTP method.",
      "Redirect permanente manteniendo el método HTTP.",
    ),
  },
  {
    code: 400,
    name: "Bad Request",
    category: "4xx",
    description: d(
      "Requisição inválida (sintaxe, parâmetros, etc.).",
      "Invalid request (syntax, parameters, etc.).",
      "Solicitud inválida (sintaxis, parámetros, etc.).",
    ),
  },
  {
    code: 401,
    name: "Unauthorized",
    category: "4xx",
    description: d(
      "Autenticação ausente ou inválida. Faça login.",
      "Missing or invalid authentication. Sign in.",
      "Autenticación ausente o inválida. Inicia sesión.",
    ),
  },
  {
    code: 402,
    name: "Payment Required",
    category: "4xx",
    description: d(
      "Reservado para pagamento — quase nunca usado.",
      "Reserved for payment systems — rarely used.",
      "Reservado para pago — casi nunca se usa.",
    ),
  },
  {
    code: 403,
    name: "Forbidden",
    category: "4xx",
    description: d(
      "Sem permissão. Autenticar de novo não resolve.",
      "No permission. Re-auth usually will not help.",
      "Sin permiso. Reautenticarse normalmente no ayuda.",
    ),
  },
  {
    code: 404,
    name: "Not Found",
    category: "4xx",
    description: d(
      "Recurso não encontrado. Link quebrado ou URL errada.",
      "Resource not found. Broken link or wrong URL.",
      "Recurso no encontrado. Enlace roto o URL incorrecta.",
    ),
  },
  {
    code: 405,
    name: "Method Not Allowed",
    category: "4xx",
    description: d(
      "Método HTTP não permitido neste recurso.",
      "HTTP method not allowed for this resource.",
      "Método HTTP no permitido en este recurso.",
    ),
  },
  {
    code: 406,
    name: "Not Acceptable",
    category: "4xx",
    description: d(
      "Nenhum conteúdo bate com os Accept headers.",
      "No content matches the Accept headers.",
      "Ningún contenido coincide con los Accept headers.",
    ),
  },
  {
    code: 407,
    name: "Proxy Authentication Required",
    category: "4xx",
    description: d(
      "Autentique-se no proxy (não no servidor de origem).",
      "Authenticate with the proxy (not the origin).",
      "Autentícate en el proxy (no en el origen).",
    ),
  },
  {
    code: 408,
    name: "Request Timeout",
    category: "4xx",
    description: d(
      "Servidor não recebeu a requisição a tempo.",
      "Server did not receive the full request in time.",
      "El servidor no recibió la solicitud a tiempo.",
    ),
  },
  {
    code: 409,
    name: "Conflict",
    category: "4xx",
    description: d(
      "Conflito com o estado atual do recurso.",
      "Conflict with the current resource state.",
      "Conflicto con el estado actual del recurso.",
    ),
  },
  {
    code: 410,
    name: "Gone",
    category: "4xx",
    description: d(
      "Recurso removido de forma permanente.",
      "Resource permanently removed.",
      "Recurso eliminado de forma permanente.",
    ),
  },
  {
    code: 411,
    name: "Length Required",
    category: "4xx",
    description: d(
      "Falta o header Content-Length.",
      "Content-Length header is required.",
      "Falta el header Content-Length.",
    ),
  },
  {
    code: 412,
    name: "Precondition Failed",
    category: "4xx",
    description: d(
      "Pré-condições dos headers não foram atendidas.",
      "Request preconditions were not met.",
      "No se cumplieron las precondiciones de los headers.",
    ),
  },
  {
    code: 413,
    name: "Payload Too Large",
    category: "4xx",
    description: d(
      "Corpo da requisição grande demais.",
      "Request payload is too large.",
      "El cuerpo de la solicitud es demasiado grande.",
    ),
  },
  {
    code: 414,
    name: "URI Too Long",
    category: "4xx",
    description: d(
      "URI maior do que o servidor aceita.",
      "URI is longer than the server accepts.",
      "La URI es más larga de lo que el servidor acepta.",
    ),
  },
  {
    code: 415,
    name: "Unsupported Media Type",
    category: "4xx",
    description: d(
      "Tipo de mídia não suportado.",
      "Unsupported media type.",
      "Tipo de medio no soportado.",
    ),
  },
  {
    code: 416,
    name: "Range Not Satisfiable",
    category: "4xx",
    description: d(
      "Range pedido inválido ou fora do recurso.",
      "Requested range is invalid or outside the resource.",
      "El Range pedido es inválido o fuera del recurso.",
    ),
  },
  {
    code: 417,
    name: "Expectation Failed",
    category: "4xx",
    description: d(
      "Expect header não pôde ser atendido.",
      "Expect header could not be satisfied.",
      "No se pudo cumplir el header Expect.",
    ),
  },
  {
    code: 418,
    name: "I'm a Teapot",
    category: "4xx",
    description: d(
      "Easter egg (April Fools). Servidor é um bule de chá.",
      "Easter egg (April Fools). Server is a teapot.",
      "Easter egg (April Fools). El servidor es una tetera.",
    ),
  },
  {
    code: 421,
    name: "Misdirected Request",
    category: "4xx",
    description: d(
      "Requisição enviada ao servidor errado.",
      "Request was sent to the wrong server.",
      "La solicitud se envió al servidor equivocado.",
    ),
  },
  {
    code: 422,
    name: "Unprocessable Entity",
    category: "4xx",
    description: d(
      "Sintaxe OK, mas erros semânticos (validação).",
      "Syntax OK, but semantic/validation errors.",
      "Sintaxis OK, pero errores semánticos (validación).",
    ),
  },
  {
    code: 423,
    name: "Locked",
    category: "4xx",
    description: d(
      "Recurso bloqueado (WebDAV).",
      "Resource is locked (WebDAV).",
      "Recurso bloqueado (WebDAV).",
    ),
  },
  {
    code: 424,
    name: "Failed Dependency",
    category: "4xx",
    description: d(
      "Falhou porque uma dependência anterior falhou.",
      "Failed because a previous dependency failed.",
      "Falló porque falló una dependencia anterior.",
    ),
  },
  {
    code: 425,
    name: "Too Early",
    category: "4xx",
    description: d(
      "Servidor recusou processar (risco de replay).",
      "Server refuses to process (replay risk).",
      "El servidor rechaza procesar (riesgo de replay).",
    ),
  },
  {
    code: 426,
    name: "Upgrade Required",
    category: "4xx",
    description: d(
      "Cliente precisa trocar de protocolo (Upgrade).",
      "Client must switch protocols (Upgrade).",
      "El cliente debe cambiar de protocolo (Upgrade).",
    ),
  },
  {
    code: 428,
    name: "Precondition Required",
    category: "4xx",
    description: d(
      "Servidor exige requisição condicional.",
      "Server requires a conditional request.",
      "El servidor exige una solicitud condicional.",
    ),
  },
  {
    code: 429,
    name: "Too Many Requests",
    category: "4xx",
    description: d(
      "Rate limit — muitas requisições em pouco tempo.",
      "Rate limited — too many requests in a short time.",
      "Rate limit — demasiadas solicitudes en poco tiempo.",
    ),
  },
  {
    code: 431,
    name: "Request Header Fields Too Large",
    category: "4xx",
    description: d(
      "Headers da requisição grandes demais.",
      "Request headers are too large.",
      "Los headers de la solicitud son demasiado grandes.",
    ),
  },
  {
    code: 451,
    name: "Unavailable For Legal Reasons",
    category: "4xx",
    description: d(
      "Indisponível por razões legais.",
      "Unavailable for legal reasons.",
      "No disponible por razones legales.",
    ),
  },
  {
    code: 500,
    name: "Internal Server Error",
    category: "5xx",
    description: d(
      "Erro genérico no servidor. Problema do host.",
      "Generic server error. Hosting-side problem.",
      "Error genérico del servidor. Problema del host.",
    ),
  },
  {
    code: 501,
    name: "Not Implemented",
    category: "5xx",
    description: d(
      "Funcionalidade não implementada no servidor.",
      "Functionality not implemented by the server.",
      "Funcionalidad no implementada en el servidor.",
    ),
  },
  {
    code: 502,
    name: "Bad Gateway",
    category: "5xx",
    description: d(
      "Gateway/proxy recebeu resposta inválida do upstream.",
      "Gateway/proxy got an invalid upstream response.",
      "Gateway/proxy recibió una respuesta inválida del upstream.",
    ),
  },
  {
    code: 503,
    name: "Service Unavailable",
    category: "5xx",
    description: d(
      "Serviço indisponível (manutenção ou sobrecarga).",
      "Service unavailable (maintenance or overload).",
      "Servicio no disponible (mantenimiento o sobrecarga).",
    ),
  },
  {
    code: 504,
    name: "Gateway Timeout",
    category: "5xx",
    description: d(
      "Gateway/proxy sem resposta a tempo do upstream.",
      "Gateway/proxy timed out waiting for upstream.",
      "Gateway/proxy sin respuesta a tiempo del upstream.",
    ),
  },
  {
    code: 505,
    name: "HTTP Version Not Supported",
    category: "5xx",
    description: d(
      "Versão HTTP da requisição não é suportada.",
      "HTTP version used in the request is not supported.",
      "La versión HTTP de la solicitud no es compatible.",
    ),
  },
  {
    code: 506,
    name: "Variant Also Negotiates",
    category: "5xx",
    description: d(
      "Erro de configuração na negociação de conteúdo.",
      "Content negotiation configuration error.",
      "Error de configuración en la negociación de contenido.",
    ),
  },
  {
    code: 507,
    name: "Insufficient Storage",
    category: "5xx",
    description: d(
      "Sem espaço suficiente no servidor.",
      "Not enough storage on the server.",
      "No hay suficiente espacio en el servidor.",
    ),
  },
  {
    code: 508,
    name: "Loop Detected",
    category: "5xx",
    description: d(
      "Loop infinito detectado — operação interrompida.",
      "Infinite loop detected — operation stopped.",
      "Bucle infinito detectado — operación detenida.",
    ),
  },
  {
    code: 510,
    name: "Not Extended",
    category: "5xx",
    description: d(
      "Extensões adicionais são necessárias.",
      "Further extensions are required.",
      "Se requieren extensiones adicionales.",
    ),
  },
  {
    code: 511,
    name: "Network Authentication Required",
    category: "5xx",
    description: d(
      "Autenticação de rede necessária (ex.: Wi‑Fi público).",
      "Network authentication required (e.g. captive portal).",
      "Se requiere autenticación de red (ej.: Wi‑Fi público).",
    ),
  },
];

export function filterHttpStatusCodes(
  query: string,
  category: HttpStatusCategory | "all",
) {
  const q = query.trim().toLowerCase();
  return HTTP_STATUS_CODES.filter((item) => {
    if (category !== "all" && item.category !== category) return false;
    if (!q) return true;
    return (
      String(item.code).includes(q) ||
      item.name.toLowerCase().includes(q) ||
      item.description.pt.toLowerCase().includes(q) ||
      item.description.en.toLowerCase().includes(q) ||
      item.description.es.toLowerCase().includes(q)
    );
  });
}

export function categoryTone(category: HttpStatusCategory) {
  switch (category) {
    case "1xx":
      return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200";
    case "2xx":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300";
    case "3xx":
      return "bg-sky-100 text-sky-800 dark:bg-sky-950/50 dark:text-sky-300";
    case "4xx":
      return "bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200";
    case "5xx":
      return "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300";
  }
}
