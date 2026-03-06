# Donkey Admin

Donkey API 관리자 대시보드.

## 레포 분리 배포

이 폴더를 Donkey-Admin 레포로 분리하여 별도 배포할 수 있습니다.

1. 새 레포 생성 후 이 폴더 **내용 전체**를 루트에 복사
2. `npm install && npm run build`
3. Vercel 등에 배포 시 `VITE_API_BASE=https://donkey.ai.kr` 설정 (API는 백엔드 도메인으로 요청)
4. Donkey 백엔드에 Admin 도메인 CORS 허용

## 로컬 개발

```bash
npm install
npm run dev
```

Donkey API가 `localhost:8000`에서 실행 중이어야 합니다. Vite 프록시가 `/api`를 8000으로 전달합니다.
