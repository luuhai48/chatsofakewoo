import { Router, Application } from "https://deno.land/x/oak@v10.6.0/mod.ts";

export default (
  { body, header, footer } = {
    body: "<h1>Hello world</h1>",
    header: "",
    footer: "",
  }
) => {
  const html = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chatso Store</title>
    ${header}
  </head>
  <body>
    ${body}
    ${footer}
  </body>
</html>`;

  const authHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Woocommerce Auth</title>
  <style>
    button {
      background-color: #4CAF50;
      color: white;
      padding: 14px 30px;
      margin: 8px 0;
      border: none;
      cursor: pointer;
      border-radius: 5px;
      font-weight: bold;
    }
    button.disabled {
      pointer-events: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <button>Authenticate</button>
    <div class="message"></div>
  </div>
  <script>
    const rand = (size) =>
      [...Array(size)]
        .map(() => Math.floor(Math.random() * 16).toString(16))
        .join("");
    const createKeys = (appName, userId, scope) => {
      return {
        user_id: userId,
        key_permissions: scope,
        consumer_key: 'ck_' + rand(40),
        consumer_secret: 'cs_' + rand(40),
      };
    };
    const btn = document.querySelector('button');
    btn.onclick = () => {
      const message = document.querySelector('.message');
      message.innerHTML = 'Authenticating...';
      btn.classList.add('disabled');
      const searchParams = new URLSearchParams(window.location.search);
      const appName = searchParams.get('app_name');
      const userId = searchParams.get('user_id');
      const scope = searchParams.get('scope');
      const returnUrl = searchParams.get('return_url');
      const callbackUrl = searchParams.get('callback_url');
      fetch(callbackUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8',
        },
        body: JSON.stringify(createKeys(appName, userId, scope))
      }).then(res => {
        if (res.ok) {
          message.innerHTML = 'Authenticated. Redirecting...';
          setTimeout(() => {
            window.location.href = returnUrl;
          }, 2000);
        } else {
          message.innerHTML = 'Authentication failed';
          btn.classList.remove('disabled');
        }
      }).catch(err => {
        message.innerHTML = 'Authentication failed';
        btn.classList.remove('disabled');
      });
    };
  </script>
</body>
</html>`

  const router = new Router();
  router.get("/", (context) => {
    context.response.body = html;
  });
  router.get("/wc-auth/v1/authorize", (context) => {
    context.response.body = authHtml;
  });

  const app = new Application();
  app.use(router.routes());
  app.use(router.allowedMethods());

  app.addEventListener("listen", ({ port }) => {
    console.log(`Listening on: http://localhost:${port}`);
  });

  return app;
};
