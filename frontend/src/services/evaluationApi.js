import ApiService from "./api";

export class EvaluationApiService {
  static async getEvaluations(params = {}) {
    return ApiService.get("/evaluations", { params });
  }

  static async getEvaluationById(id) {
    return ApiService.get(`/evaluations/${id}`);
  }

  static async getEvaluationStats(params = {}) {
    return ApiService.get("/evaluations/stats", { params });
  }

  static async getEvaluationTrends(params = {}) {
    return ApiService.get("/evaluations/trends", { params });
  }

  static async getEvaluatorTypes() {
    return ApiService.get("/evaluations/types");
  }

  static async runEvaluation(logId, types = null) {
    return ApiService.post("/evaluations/run", { logId, types });
  }

  static async runBatchEvaluation(data) {
    return ApiService.post("/evaluations/run-batch", data);
  }

  static async deleteEvaluation(id) {
    return ApiService.delete(`/evaluations/${id}`);
  }
}

export default EvaluationApiService;
