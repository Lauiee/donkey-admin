# 문의(CS) API 백엔드 구현 요청

CS 문의 게시판용 API를 추가해주세요. 상세 명세는 `API_SPEC.md` 2.8~2.12 참고.

---

## 요약

| API       | Method | Path                                | 설명                                  |
| --------- | ------ | ----------------------------------- | ------------------------------------- |
| 문의 등록 | POST   | `/admin/api/inquiries`              | 클라이언트 새 문의 등록 (title, body) |
| 문의 목록 | GET    | `/admin/api/inquiries`              | 페이지네이션, 상태/검색 필터          |
| 문의 상세 | GET    | `/admin/api/inquiries/{id}`         | 상세 + 답변 목록                      |
| 상태 변경 | PATCH  | `/admin/api/inquiries/{id}`         | pending / in_progress / completed     |
| 답변 등록 | POST   | `/admin/api/inquiries/{id}/replies` | 답변 추가                             |

### 상태 값

- `pending`: 대기중
- `in_progress`: 처리 중
- `completed`: 완료

### 문의 등록 (POST)

클라이언트가 관리 페이지에서 직접 문의를 등록합니다. author는 인증된 사용자(로그인 정보)에서 매핑해주세요.
