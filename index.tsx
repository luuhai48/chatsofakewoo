import App from "./deps.ts";

const footer = '<div class="footer">&copy; 2020</div>';
const app = App({ title: "How are your?", footer });
app.listen({ port: 8000 });
