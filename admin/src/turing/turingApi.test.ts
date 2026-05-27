import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  fetchTuringEvaluationById,
  fetchTuringEvaluations,
  hasTuringApiKey,
  type EvaluationFullApi,
} from "./turingApi";

const BASE = "https://turing.test";

function jsonResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as unknown as Response;
}

function makeFull(over: Partial<EvaluationFullApi> = {}): EvaluationFullApi {
  return {
    id: 7,
    job_id: "job-7",
    audio_filename: "a.wav",
    audio_duration: 12.3,
    language: "ko",
    specialty: "주문",
    created_at: "2026-05-26T11:59:19.000Z",
    metrics: {
      processing_velocity: 0.7,
      stt: {
        stt_velocity: 0.34,
        uer: 0.08,
        pii_protection: 0.92,
        mmr: 0.12,
        mdr: 0.08,
        diarization_accuracy: 0.82,
        redundancy_ratio: 0.04,
      },
      summary: {
        summarization_velocity: 0.65,
        hallucination_ratio: 0.12,
        ssr: 0.75,
        icr: 0.45,
        mir: 0.72,
        summary_mdr: 0.08,
        ssa: 0.78,
      },
    },
    audio_url: null,
    segment_count: 5,
    full_text: "전사 전문",
    reference_text: null,
    has_reference: false,
    error_message: null,
    deleted_at: null,
    updated_at: "2026-05-26T12:00:00.000Z",
    details: null,
    ...over,
  };
}

describe("turingApi", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("VITE_TURING_API_BASE", BASE);
    vi.stubEnv("VITE_TURING_API_KEY", "secret-key");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  describe("hasTuringApiKey", () => {
    it("키가 설정되어 있으면 true", () => {
      expect(hasTuringApiKey()).toBe(true);
    });

    it("키가 비어 있으면 false", () => {
      vi.stubEnv("VITE_TURING_API_KEY", "");
      expect(hasTuringApiKey()).toBe(false);
    });
  });

  describe("fetchTuringEvaluationById", () => {
    it("정상 응답 시 전체 필드를 반환하고 올바른 URL·X-API-Key 헤더로 호출", async () => {
      const data = makeFull();
      fetchMock.mockResolvedValue(jsonResponse(200, data));

      const result = await fetchTuringEvaluationById(7);

      expect(result).toEqual(data);
      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
      expect(url).toBe(`${BASE}/evaluations/7`);
      expect((init.headers as Record<string, string>)["X-API-Key"]).toBe(
        "secret-key"
      );
    });

    it("id가 1 미만이면 fetch 없이 throw", async () => {
      await expect(fetchTuringEvaluationById(0)).rejects.toThrow(
        "유효하지 않은 평가 ID"
      );
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("정수가 아닌 id면 fetch 없이 throw", async () => {
      await expect(fetchTuringEvaluationById(1.5)).rejects.toThrow(
        "유효하지 않은 평가 ID"
      );
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("API 키가 없으면 fetch 없이 throw", async () => {
      vi.stubEnv("VITE_TURING_API_KEY", "");
      await expect(fetchTuringEvaluationById(7)).rejects.toThrow(
        "VITE_TURING_API_KEY"
      );
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("401 응답이면 인증 실패 메시지로 throw", async () => {
      fetchMock.mockResolvedValue(jsonResponse(401, {}));
      await expect(fetchTuringEvaluationById(7)).rejects.toThrow("인증");
    });

    it("404 응답이면 not-found 메시지로 throw", async () => {
      fetchMock.mockResolvedValue(jsonResponse(404, {}));
      await expect(fetchTuringEvaluationById(7)).rejects.toThrow(
        "찾을 수 없습니다"
      );
    });

    it("기타 오류는 응답 본문 message로 throw", async () => {
      fetchMock.mockResolvedValue(jsonResponse(500, { message: "서버 폭발" }));
      await expect(fetchTuringEvaluationById(7)).rejects.toThrow("서버 폭발");
    });
  });

  describe("fetchTuringEvaluations", () => {
    it("page/size를 쿼리에 세팅하고 size를 1~100으로 clamp", async () => {
      fetchMock.mockResolvedValue(
        jsonResponse(200, { total: 0, page: 1, size: 100, items: [] })
      );

      await fetchTuringEvaluations({ page: 2, size: 999 });

      const [url] = fetchMock.mock.calls[0] as [string];
      const u = new URL(url);
      expect(u.searchParams.get("page")).toBe("2");
      expect(u.searchParams.get("size")).toBe("100");
    });

    it("필터(specialty/language)를 쿼리에 반영", async () => {
      fetchMock.mockResolvedValue(
        jsonResponse(200, { total: 0, page: 1, size: 10, items: [] })
      );

      await fetchTuringEvaluations({ specialty: "주문", language: "ko" });

      const [url] = fetchMock.mock.calls[0] as [string];
      const u = new URL(url);
      expect(u.searchParams.get("specialty")).toBe("주문");
      expect(u.searchParams.get("language")).toBe("ko");
    });
  });
});
