// Generated from docs/technical/openapi-v1.yaml. Do not edit manually.
export 'package:openapi/openapi.dart';
import 'package:dio/dio.dart';
const contractVersion = '0.4.0-draft';
class CursorPageMeta { const CursorPageMeta({required this.hasMore,this.nextCursor}); final bool hasMore; final String? nextCursor; }
class ErrorEnvelope { const ErrorEnvelope({required this.code,required this.message,required this.correlationId}); final String code; final String message; final String correlationId; }
class Session { const Session({required this.assurance,required this.channel,required this.expiresAt}); final String assurance; final String channel; final DateTime expiresAt; }
class IdempotentCommandOptions { const IdempotentCommandOptions({required this.idempotencyKey,this.correlationId}); final String idempotencyKey; final String? correlationId; }
class DailyDoseApiClient {
  DailyDoseApiClient(String baseUrl):_dio=Dio(BaseOptions(baseUrl:'$baseUrl/api/v1'));
  final Dio _dio;
  Future<Response<dynamic>> getHealth({String? correlationId})=>_dio.get('/operations/health',options:Options(headers:correlationId==null?null:{'X-Correlation-ID':correlationId}));
  Future<Response<dynamic>> revokeAllSessions(String reason,IdempotentCommandOptions options)=>_dio.post('/auth/sessions/revoke-all',data:{'reason':reason},options:Options(headers:{'Idempotency-Key':options.idempotencyKey,if(options.correlationId!=null)'X-Correlation-ID':options.correlationId}));
}
