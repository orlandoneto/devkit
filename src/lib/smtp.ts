import net from "node:net";
import tls from "node:tls";

export type SmtpConfig = {
  host: string;
  port: number;
  user: string;
  pass: string;
};

export function smtpConfig(): SmtpConfig | null {
  const user = (process.env.SMTP_USER || process.env.GMAIL_USER || "").trim();
  const pass = (process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || "")
    .replace(/\s+/g, "");
  if (!user || !pass) return null;
  const port = Number(process.env.SMTP_PORT?.trim() || 465);
  return {
    host: process.env.SMTP_HOST?.trim() || "smtp.gmail.com",
    port: Number.isFinite(port) && port > 0 ? port : 465,
    user,
    pass,
  };
}

function encodeSubject(value: string) {
  return `=?UTF-8?B?${Buffer.from(value, "utf8").toString("base64")}?=`;
}

function dotStuff(body: string) {
  return body.replace(/\r?\n/g, "\r\n").replace(/^\./gm, "..");
}

type SocketLike = net.Socket;

function readReply(socket: SocketLike) {
  return new Promise<string>((resolve, reject) => {
    let buf = "";
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error("smtp_timeout"));
    }, 20_000);

    function onData(chunk: Buffer) {
      buf += chunk.toString("utf8");
      const lines = buf.split(/\r?\n/).filter((line) => line.length > 0);
      const last = lines[lines.length - 1];
      if (last && /^\d{3} /.test(last)) {
        cleanup();
        resolve(buf);
      }
    }

    function onError(error: Error) {
      cleanup();
      reject(error);
    }

    function cleanup() {
      clearTimeout(timer);
      socket.off("data", onData);
      socket.off("error", onError);
    }

    socket.on("data", onData);
    socket.once("error", onError);
  });
}

async function expectCode(socket: SocketLike, code: string) {
  const reply = await readReply(socket);
  const lines = reply.trim().split(/\r?\n/);
  const last = lines[lines.length - 1] ?? "";
  if (!last.startsWith(code)) {
    throw new Error(`smtp_${reply.trim().slice(0, 180)}`);
  }
  return reply;
}

function writeLine(socket: SocketLike, line: string) {
  socket.write(`${line}\r\n`);
}

function connectTls(host: string, port: number, existing?: net.Socket) {
  return new Promise<tls.TLSSocket>((resolve, reject) => {
    const socket = tls.connect(
      {
        host,
        port,
        socket: existing,
        servername: host,
      },
      () => resolve(socket),
    );
    socket.once("error", reject);
  });
}

function connectTcp(host: string, port: number) {
  return new Promise<net.Socket>((resolve, reject) => {
    const socket = net.connect({ host, port }, () => resolve(socket));
    socket.once("error", reject);
  });
}

async function authenticate(socket: SocketLike, config: SmtpConfig) {
  writeLine(socket, `EHLO ${config.host}`);
  await expectCode(socket, "250");
  writeLine(socket, "AUTH LOGIN");
  await expectCode(socket, "334");
  writeLine(socket, Buffer.from(config.user, "utf8").toString("base64"));
  await expectCode(socket, "334");
  writeLine(socket, Buffer.from(config.pass, "utf8").toString("base64"));
  await expectCode(socket, "235");
}

export async function sendSmtpMail(input: {
  fromName: string;
  fromEmail: string;
  to: string;
  replyTo: string;
  subject: string;
  text: string;
}) {
  const config = smtpConfig();
  if (!config) throw new Error("not_configured");

  let socket: SocketLike;
  if (config.port === 465) {
    socket = await connectTls(config.host, config.port);
    await expectCode(socket, "220");
    await authenticate(socket, config);
  } else {
    socket = await connectTcp(config.host, config.port);
    await expectCode(socket, "220");
    writeLine(socket, `EHLO ${config.host}`);
    await expectCode(socket, "250");
    writeLine(socket, "STARTTLS");
    await expectCode(socket, "220");
    socket = await connectTls(config.host, config.port, socket);
    await authenticate(socket, config);
  }

  writeLine(socket, `MAIL FROM:<${input.fromEmail}>`);
  await expectCode(socket, "250");
  writeLine(socket, `RCPT TO:<${input.to}>`);
  await expectCode(socket, "250");
  writeLine(socket, "DATA");
  await expectCode(socket, "354");

  const payload = [
    `From: ${input.fromName} <${input.fromEmail}>`,
    `To: ${input.to}`,
    `Reply-To: ${input.replyTo}`,
    `Subject: ${encodeSubject(input.subject)}`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: 8bit",
    "",
    dotStuff(input.text),
    ".",
  ].join("\r\n");

  socket.write(`${payload}\r\n`);
  await expectCode(socket, "250");
  writeLine(socket, "QUIT");
  socket.end();
}
