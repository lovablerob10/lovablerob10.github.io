#!/usr/bin/env bash
# Monta _site/ com o que vai para o ar e publica no Cloudflare Pages.
# So o artefato e transformado; os fontes do repositorio ficam editaveis.
set -euo pipefail
cd "$(dirname "$0")"

rm -rf _site
mkdir -p _site/assets

cp index.html style.css script.js bella.js _site/
cp robots.txt sitemap.xml llms.txt _site/
cp -r assets/opt _site/assets/opt
cp -r assets/fonts _site/assets/fonts
[ -d assets/media ] && cp -r assets/media _site/assets/media

# CACHE-BUSTING: index novo puxa asset novo, sempre.
V=$(date +%s)
sed -i "s|href=\"style.css\"|href=\"style.css?v=$V\"|; s|src=\"script.js\"|src=\"script.js?v=$V\"|; s|src=\"bella.js\"|src=\"bella.js?v=$V\"|" _site/index.html
echo "versao dos assets: $V"

# Os @font-face entram no topo do style.css publicado.
cat assets/fonts/fonts.css _site/style.css > _site/style.tmp && mv _site/style.tmp _site/style.css

# NOTA (20/08): o split critical/rest foi testado e REVERTIDO — o restyle
# do CSS async no meio do carregamento gerava CLS instavel (0.30-0.56,
# atribuido ora ao wrap, ora ao grain). Single-css estavel: 88-89, CLS ~0.
# O build-split.py fica no repo para a proxima tentativa, que precisa de
# supressao de transicoes ate o resto chegar.

# Early Hints das fontes da dobra + cache imutavel dos assets.
cat > _site/_headers <<EOF
/
  Link: </assets/fonts/Inter-900.woff2>; rel=preload; as=font; crossorigin
  Link: </assets/fonts/Inter-400.woff2>; rel=preload; as=font; crossorigin
  Link: </assets/fonts/JetBrainsMono-500.woff2>; rel=preload; as=font; crossorigin
/assets/fonts/*
  Cache-Control: public, max-age=31536000, immutable
EOF

du -sh _site
npx wrangler pages deploy _site \
  --project-name=robsonobre \
  --branch=repaginada \
  --commit-dirty=true
