# sosing

단일 HTML 파일을 Vite + React 구조로 분리한 소싱 대시보드입니다.

## 시작

```bash
npm install
npm run dev
```

## 환경변수

`.env.example`을 참고해서 `.env`를 만들면 됩니다.

```bash
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

값을 넣지 않으면 기존 HTML에 있던 Supabase 값으로 동작하도록 fallback이 들어 있습니다.

## 배포

```bash
npm run build
npm run deploy
```

`build`는 `esbuild`로 `dist/`를 만들고, `deploy`는 그 결과물을 `gh-pages` 브랜치에 올립니다.
