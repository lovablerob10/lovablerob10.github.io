#!/usr/bin/env bash
# Monta _site/ com o que vai para o ar e publica no Cloudflare Pages.
#
# Existe porque o `wrangler pages deploy .` sobe a pasta inteira, e a pasta
# inteira tem 13 MB de PNG original que a página não usa — ela consome apenas
# assets/opt/*.webp. O .assetsignore vale para Workers, não para Pages; a forma
# de controlar o que sobe é escolher o diretório.
set -euo pipefail
cd "$(dirname "$0")"

rm -rf _site
mkdir -p _site/assets

cp index.html style.css script.js bella.js _site/
cp robots.txt sitemap.xml llms.txt _site/
cp -r assets/opt _site/assets/opt
# os videos cinematograficos (hero e retrato) — só existem depois de gerados
[ -d assets/media ] && cp -r assets/media _site/assets/media

echo "conteudo de _site:"
du -sh _site
find _site -type f | sed 's|^_site/|  |' | sort

npx wrangler pages deploy _site \
  --project-name=robsonobre \
  --branch=repaginada \
  --commit-dirty=true
