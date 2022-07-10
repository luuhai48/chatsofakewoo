import { serve } from "https://deno.land/std/http/mod.ts";
import { Router } from "./router.ts";

const generateHTML = (opts = {}) => {
  const defaultOpts = {
    body: "<h1>Hello World</h1>",
    header: "",
    footer: "",
    title: "Hello World",
  };
  const { header, footer, body, title } = { ...defaultOpts, ...opts };

  return `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      ${header}
    </head>
    <body>
      ${body}
      ${footer}
    </body>
  </html>`;
};
const response = (html: string) =>
  new Response(html, {
    headers: {
      "Content-Type": "text/html",
    },
  });

export default (opts = {}) => {
  const defaultHtml = generateHTML(opts);
  const authHtml = generateHTML({
    title: "WooCommerce Authenticate",
    header: `<style>button {background-color: #4CAF50;color: white;padding: 14px 30px;margin: 8px 0;border: none;cursor: pointer;border-radius: 5px;font-weight: bold;}button.disabled {pointer-events: none;}.container {display: flex;justify-content: center;align-items: center;}</style>`,
    body: `<div class="container">
  <button>Authenticate</button>
  <div class="message"></div>
</div>`,
    footer: `<script>
  const rand = (size) => [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join("");
  const createKeys = (appName, userId, scope) => {
    return {
      user_id: userId,
      key_permissions: scope,
      consumer_key: 'ck_' + rand(40),
      consumer_secret: 'cs_' + rand(40),
    };
  };
  const btn = document.querySelector('button');
  const message = document.querySelector('.message');
  const showError = () => {
    message.innerHTML = '<span style="color: red; font-weight: bold;">Authentication failed</span>';
    btn.classList.remove('disabled');
  }
  btn.onclick = () => {
    message.innerHTML = 'Authenticating...';
    btn.classList.add('disabled');
    const params = new URLSearchParams(window.location.search);
    fetch(params.get('callback_url'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      body: JSON.stringify(createKeys(params.get('app_name'), params.get('user_id'), params.get('scope')))
    }).then(res => {
      if (res.ok) {
        message.innerHTML = 'Authenticated. Redirecting...';
        setTimeout(() => {
          window.location.href = params.get('return_url');
        }, 2000);
      } else {
        showError();
      }
    }).catch(() => {
      showError();
    });
  };
</script>`,
  });

  const router = new Router();
  router.add("GET", "/wc-auth/v1/authorize", () => response(authHtml));
  router.add("GET", "/", () => response(defaultHtml));
  router.add("GET", "/:anythingelse", () => response(defaultHtml));

  return {
    listen: ({ port } = { port: 8000 }) =>
      serve((req: Request) => router.route(req), { port }),
  };
};
