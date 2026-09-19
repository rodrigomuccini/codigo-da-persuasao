# O Código da Persuasão

Site comercial do programa de formação em PNL aplicada à mediação de seguros
(ramo automóvel e ramo vida), para equipas comerciais em Portugal.

**Formador:** Rodrigo Muccini
**Público-alvo da página:** direção e gestores de unidade
**Objetivo:** gerar pedidos de sessão de diagnóstico

## Estrutura

```
index.html    página única
styles.css    identidade visual (azul-noite + ouro)
script.js     interações, rede neural do hero, formulário
```

Site estático, sem build. Abrir `index.html` ou servir a pasta.

```bash
python3 -m http.server 4321
```

## Por configurar

Em `script.js`, topo do ficheiro, objeto `CONFIG`:

| Campo | Para quê |
|---|---|
| `whatsapp` | número com indicativo, só dígitos (ex.: `351912345678`) |
| `formEndpoint` | URL do serviço de formulários (ex.: Formspree) |

Blocos marcados na página com `a preencher` / `Espaço reservado`:

- depoimentos da unidade-piloto (secção **Prova**)
- métricas de resultado (secção **Prova**)
- biografia detalhada e fotografia (secção **Formador**)
- política de privacidade e dados legais (rodapé)

## Idioma

Português de Portugal. Vocabulário do setor: mediador, apólice, ramo automóvel,
ramo vida, tomador, prémio, carteira.
