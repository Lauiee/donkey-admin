# NBrief Admin 백엔드 API 수정 요청

프론트엔드에서 프로젝트별 대시보드를 구현했습니다. 아래 API를 추가/수정해주세요.

---

## 1. 새 엔드포인트 추가

### `GET /admin/api/projects`

프로젝트 필터용 목록을 반환합니다. UI에는 프로젝트명을 표시하고, API 필터에는 id(project_id)를 사용합니다.

**Response 200**

```json
{
  "items": [
    { "id": "project-id-1", "name": "프로젝트 A" },
    { "id": "project-id-2", "name": "프로젝트 B" }
  ]
}
```

- `id`: project_id (API 필터용)
- `name`: 프로젝트명 (UI 표시용)
- DB의 요청(requests) 테이블 또는 프로젝트 마스터 테이블에서 조회

---

## 2. 기존 API에 `project_id` 쿼리 파라미터 추가

아래 4개 API에서 **선택적(optional)** 쿼리 파라미터 `project_id`를 받아 해당 프로젝트로 필터링해주세요.

### 2.1 `GET /admin/api/dashboard`

- **파라미터**: `project_id` (string, optional)
- **동작**: `project_id`가 있으면 `WHERE project_id = :project_id`로 통계 집계, 없으면 전체

### 2.2 `GET /admin/api/usage`

- **파라미터**: `project_id` (string, optional)
- **동작**: `project_id`가 있으면 해당 프로젝트만, 없으면 전체

### 2.3 `GET /admin/api/requests`

- **파라미터**: `project_id` (string, optional)
- **동작**: `project_id`가 있으면 해당 프로젝트만, 없으면 전체

### 2.4 `GET /admin/api/errors`

- **파라미터**: `project_id` (string, optional)
- **동작**: `project_id`가 있으면 해당 프로젝트만, 없으면 전체

---

## 3. 참고

- 요청 테이블에 `project_id` 컬럼이 이미 추가된 상태라고 가정합니다.
- 응답 스키마는 기존과 동일합니다. `project_id`가 있으면 필터된 결과만 반환하면 됩니다.
