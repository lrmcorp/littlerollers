//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:openapi/src/model/correction.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'correction_decision_result.g.dart';

/// CorrectionDecisionResult
///
/// Properties:
/// * [correction] 
/// * [journalReferenceId] 
/// * [auditLogId] 
/// * [idempotentReplay] 
@BuiltValue()
abstract class CorrectionDecisionResult implements Built<CorrectionDecisionResult, CorrectionDecisionResultBuilder> {
  @BuiltValueField(wireName: r'correction')
  Correction get correction;

  @BuiltValueField(wireName: r'journalReferenceId')
  String? get journalReferenceId;

  @BuiltValueField(wireName: r'auditLogId')
  String get auditLogId;

  @BuiltValueField(wireName: r'idempotentReplay')
  bool get idempotentReplay;

  CorrectionDecisionResult._();

  factory CorrectionDecisionResult([void updates(CorrectionDecisionResultBuilder b)]) = _$CorrectionDecisionResult;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(CorrectionDecisionResultBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<CorrectionDecisionResult> get serializer => _$CorrectionDecisionResultSerializer();
}

class _$CorrectionDecisionResultSerializer implements PrimitiveSerializer<CorrectionDecisionResult> {
  @override
  final Iterable<Type> types = const [CorrectionDecisionResult, _$CorrectionDecisionResult];

  @override
  final String wireName = r'CorrectionDecisionResult';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    CorrectionDecisionResult object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'correction';
    yield serializers.serialize(
      object.correction,
      specifiedType: const FullType(Correction),
    );
    if (object.journalReferenceId != null) {
      yield r'journalReferenceId';
      yield serializers.serialize(
        object.journalReferenceId,
        specifiedType: const FullType.nullable(String),
      );
    }
    yield r'auditLogId';
    yield serializers.serialize(
      object.auditLogId,
      specifiedType: const FullType(String),
    );
    yield r'idempotentReplay';
    yield serializers.serialize(
      object.idempotentReplay,
      specifiedType: const FullType(bool),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    CorrectionDecisionResult object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required CorrectionDecisionResultBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'correction':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(Correction),
          ) as Correction;
          result.correction.replace(valueDes);
          break;
        case r'journalReferenceId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.journalReferenceId = valueDes;
          break;
        case r'auditLogId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.auditLogId = valueDes;
          break;
        case r'idempotentReplay':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(bool),
          ) as bool;
          result.idempotentReplay = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  CorrectionDecisionResult deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = CorrectionDecisionResultBuilder();
    final serializedList = (serialized as Iterable<Object?>).toList();
    final unhandled = <Object?>[];
    _deserializeProperties(
      serializers,
      serialized,
      specifiedType: specifiedType,
      serializedList: serializedList,
      unhandled: unhandled,
      result: result,
    );
    return result.build();
  }
}

