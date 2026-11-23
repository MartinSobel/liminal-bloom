# Liminal Bloom — theme de Big Cartel

Theme custom para **liminalbloomshop.bigcartel.com**. Productos, carrito y checkout los maneja Big Cartel. Acá solo vive el diseño.

## Estructura

```
source/
  layout.html       # header, footer y JS inline (envuelve a todas las páginas)
  home.html         # hero + productos destacados
  products.html     # listado con filtro por categoría y paginación
  product.html      # detalle del producto + "Agregar al carrito"
  cart.html         # carrito -> botón "Finalizar compra" va al checkout de Big Cartel
  contact.html      # mínimo: Big Cartel lo exige, pero no hay formulario ni link en el menú
  maintenance.html  # página de "volvemos pronto"
  theme.css         # todos los estilos (variables de color y fuente en :root)
  images/           # logo (WebP + PNG de respaldo) y fondos del home
  theme.js          # vacío a propósito; el JS está inline en layout.html
  settings.json     # metadatos del theme para Dugway
```

Las páginas custom que crees en Big Cartel (por ejemplo "Nosotros") aparecen solas en el menú y se renderizan con `layout.html`.

## Desarrollo local con Dugway

Dugway pide **Ruby >= 2.7 y < 3**. El Ruby del sistema de macOS es 2.6, así que hay que instalar 2.7.8 con rbenv:

```bash
brew install rbenv ruby-build
rbenv install 2.7.8
rbenv local 2.7.8
gem install bundler -v 2.4.22
bundle install
bundle exec dugway server
```

Después abrí http://127.0.0.1:9292.

Si las gems nativas (`eventmachine`, `sassc`) fallan con `'iostream' file not found` o `'vector' file not found`, instalá así:

```bash
SDK=$(xcrun --show-sdk-path) SDKROOT=$(xcrun --show-sdk-path) CPLUS_INCLUDE_PATH="$(xcrun --show-sdk-path)/usr/include/c++/v1" bundle install
```

**Datos de la tienda:** `.dugway.json` apunta a `liminalbloomshop`. Si la tienda vuelve a modo mantenimiento, su API pública devuelve 403 y Dugway no arranca; en ese caso cambiá temporalmente `"subdomain"` a `"dugway"` (tienda demo de Big Cartel).

## Publicar en Big Cartel

Admin de Big Cartel → **Design** → **Advanced** (editar código). Copiá el contenido de cada archivo de `source/` en su pestaña correspondiente: Layout, Home, Products, Product, Cart, Contact, Maintenance y CSS.

## Personalizar

- Colores y tipografía (Times New Roman): variables en `:root` al principio de `source/theme.css`.
- El nombre "Liminal Bloom" está escrito en los templates (el nombre interno de la tienda en Big Cartel es `liminalbloom`).
- Los textos del sitio están en inglés y escritos directo en los templates.

## Deploy

1. `node scripts/build-deploy.mjs [https://<proyecto>.pages.dev]` genera:
   - `dist/assets/`: imágenes, video y cursor para Cloudflare Pages (con `_headers` para CORS y caché).
   - `dist/bigcartel/`: templates y CSS con las URLs ya reemplazadas, para pegar en Big Cartel.
2. Subir los assets: `npx wrangler pages deploy dist/assets --project-name=liminal-bloom-assets`
   (la primera vez, `npx wrangler login`).
3. Big Cartel: Shop designer → Code → Advanced template code. Pegar cada archivo de `dist/bigcartel/` en su sección y publicar.
   Cambiar o actualizar el theme base en Big Cartel borra este código; `source/` es la copia maestra.
