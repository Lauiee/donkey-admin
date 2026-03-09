# Donkey Admin API 명세서

Donkey Admin 프론트엔드에서 사용하는 백엔드 API 명세입니다. 백엔드 브랜치 변경 시 이 명세를 기준으로 API를 구현하세요.

**공통**

- Base URL: `{API_BASE}` (예: `https://donkey.ai.kr` 또는 `/api` 프록시)
- 인증 필요한 API: `Authorization: Bearer {access_token}` 헤더 필수
- 응답 Content-Type: `application/json`

---

## 1. 인증 불필요

### 1.1 헬스체크

| 항목   | 값        |
| ------ | --------- |
| Method | `GET`     |
| Path   | `/health` |
| 인증   | 불필요    |

**Response 200**

```json
{
  "status": "ok"
}
```

---

### 1.2 로그인

| 항목         | 값                 |
| ------------ | ------------------ |
| Method       | `POST`             |
| Path         | `/admin/api/login` |
| 인증         | 불필요             |
| Content-Type | `application/json` |

**Request Body**

```json
{
  "user_id": "string",
  "password": "string"
}
```

**Response 200**

```json
{
  "access_token": "string"
}
```

**Error Response**

- `401`: 로그인 실패
- `503`: 관리자 로그인 미설정 (DB 연결 등)

```json
{
  "code": "string",
  "message": "string"
}
```

---

## 2. 인증 필요 (Bearer Token)

### 2.1 내 정보 조회

| 항목   | 값              |
| ------ | --------------- |
| Method | `GET`           |
| Path   | `/admin/api/me` |
| 인증   | 필수            |

**Response 200**

```json
{
  "user_id": "string",
  "display_name": "string | null"
}
```

---

### 2.2 세션 연장 (토큰 갱신)

| 항목   | 값                   |
| ------ | -------------------- |
| Method | `POST`               |
| Path   | `/admin/api/refresh` |
| 인증   | 필수 (기존 토큰으로) |

**Response 200**

```json
{
  "access_token": "string"
}
```

---

### 2.2a 프로젝트 목록 조회

| 항목   | 값                    |
| ------ | --------------------- |
| Method | `GET`                 |
| Path   | `/admin/api/projects` |
| 인증   | 필수                  |

**Response 200**

```json
{
  "items": [
    { "id": "project-id-1", "name": "프로젝트 A" },
    { "id": "project-id-2", "name": "프로젝트 B" }
  ]
}
```

- `id`: API 필터용 `project_id`
- `name`: 사용자에게 표시할 프로젝트명

---

### 2.3 대시보드 통계

| 항목   | 값                     |
| ------ | ---------------------- |
| Method | `GET`                  |
| Path   | `/admin/api/dashboard` |
| 인증   | 필수                   |

**Query Parameters**
| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| project_id | string | X | 프로젝트 필터 (미지정 시 전체) |

**Response 200**

```json
{
  "today_count": 0,
  "week_count": 0,
  "month_count": 0,
  "year_count": 0,
  "rate": {
    "week": { "total": 0, "completed": 0, "error": 0 },
    "month": { "total": 0, "completed": 0, "error": 0 },
    "year": { "total": 0, "completed": 0, "error": 0 }
  },
  "avg_processing_sec": null,
  "daily_counts": [{ "date": "2025-01-01", "count": 0 }],
  "summary_eval": {
    "avg_hr": null,
    "avg_ssr": null,
    "avg_icr": null,
    "eval_count": 0
  },
  "summary_eval_trend": [
    {
      "label": "string",
      "hr": null,
      "ssr": null,
      "icr": null
    }
  ]
}
```

`summary_eval`, `summary_eval_trend`는 선택(optional).

---

### 2.4 사용량 조회

| 항목   | 값                 |
| ------ | ------------------ |
| Method | `GET`              |
| Path   | `/admin/api/usage` |
| 인증   | 필수               |

**Query Parameters**
| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| from_date | string | O | `YYYY-MM-DD` |
| to_date | string | O | `YYYY-MM-DD` |
| project_id | string | X | 프로젝트 필터 (미지정 시 전체) |

**Response 200**

```json
{
  "daily_counts": [{ "date": "2025-01-01", "count": 0 }],
  "total_count": 0,
  "completed_count": 0,
  "error_count": 0,
  "avg_processing_sec": null
}
```

---

### 2.5 요청 목록 조회

| 항목   | 값                    |
| ------ | --------------------- |
| Method | `GET`                 |
| Path   | `/admin/api/requests` |
| 인증   | 필수                  |

**Query Parameters**
| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| page | number | O | 기본 1 |
| limit | number | O | 기본 50 |
| title | string | X | 검색어 |
| status | string | X | 상태 필터 |
| project_id | string | X | 프로젝트 필터 (미지정 시 전체) |

**Response 200**

```json
{
  "items": [
    {
      "job_id": "string",
      "created_at": "string (ISO 8601)",
      "status": "string",
      "processing_sec": null,
      "title": "string | null"
    }
  ],
  "total": 0
}
```

---

### 2.6 요청 상세 조회

| 항목   | 값                             |
| ------ | ------------------------------ |
| Method | `GET`                          |
| Path   | `/admin/api/requests/{job_id}` |
| 인증   | 필수                           |

**Path Parameters**

- `job_id`: 요청 ID

**Response 200**

```json
{
  "job_id": "string",
  "created_at": "string",
  "status": "string",
  "request_type": "string",
  "file_url": "string",
  "stored_audio_url": "string | null",
  "client_name": "string",
  "request_timestamp": "string | null",
  "completed_at": "string | null",
  "processing_time_ms": null,
  "processing_sec": null,
  "audio_duration_sec": null,
  "stages": null,
  "quality": null,
  "model_usage": null,
  "error": null,
  "title": "string | null",
  "simple_summary": "string | null",
  "doctor_notes": ["string"] | null,
  "test_results": ["string"] | null,
  "symptom_record": ["string"] | null,
  "prescription_and_care": ["string"] | null,
  "conversation_content": [] | null,
  "summary_eval": {
    "simpleSummary_eval": {
      "summary_scores": {
        "supported_ratio": 0,
        "hallucination_rate": 0,
        "contradiction_rate": 0
      },
      "ssr": 0,
      "icr": null
    },
    "consultation_aggregate": {
      "supported_ratio": 0,
      "hallucination_rate": 0,
      "contradiction_rate": 0,
      "ssr": 0,
      "icr": null
    }
  }
}
```

`summary_eval` 및 내부 필드 일부는 선택(optional).  
`404` 응답 시: 해당 요청 없음.

---

### 2.7 오류 목록 조회

| 항목   | 값                  |
| ------ | ------------------- |
| Method | `GET`               |
| Path   | `/admin/api/errors` |
| 인증   | 필수                |

**Query Parameters**
| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| period | string | O | `week` \| `month` \| `year` |
| project_id | string | X | 프로젝트 필터 (미지정 시 전체) |

**Response 200**

```json
{
  "items": [
    {
      "job_id": "string",
      "created_at": "string | null",
      "error": {
        "code": "string",
        "type": "string",
        "message": "string",
        "stage": "string",
        "detail": "string"
      }
    }
  ]
}
```

---

## 에러 응답 공통 형식 (FastAPI style)

인증/라우트 오류 시 예:

```json
{
  "detail": "string"
}
```

또는

```json
{
  "detail": {
    "message": "string"
  }
}
```

---

## CORS

Admin 도메인에서 호출하므로 백엔드에 CORS 허용 필요:

- `allow_origins`: `["https://admin.donkey.ai.kr", "http://localhost:3000"]`
- `allow_methods`: `["GET", "POST", "PUT", "DELETE", "OPTIONS"]`
- `allow_headers`: `["*"]`
- `allow_credentials`: `true`
