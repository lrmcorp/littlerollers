//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/json_object.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'completion_result.g.dart';

/// CompletionResult
///
/// Properties:
/// * [classSlotId] 
/// * [status] 
/// * [attendanceCount] 
/// * [noShowCount] 
/// * [releasedReservationIds] 
/// * [ledgerEntryIds] 
/// * [hourLogIds] 
/// * [auditLogId] 
/// * [outboxEventIds] 
/// * [completedAt] 
/// * [idempotentReplay] 
@BuiltValue()
abstract class CompletionResult implements Built<CompletionResult, CompletionResultBuilder> {
  @BuiltValueField(wireName: r'classSlotId')
  String get classSlotId;

  @BuiltValueField(wireName: r'status')
  JsonObject? get status;

  @BuiltValueField(wireName: r'attendanceCount')
  int get attendanceCount;

  @BuiltValueField(wireName: r'noShowCount')
  int? get noShowCount;

  @BuiltValueField(wireName: r'releasedReservationIds')
  BuiltList<String>? get releasedReservationIds;

  @BuiltValueField(wireName: r'ledgerEntryIds')
  BuiltList<String> get ledgerEntryIds;

  @BuiltValueField(wireName: r'hourLogIds')
  BuiltList<String> get hourLogIds;

  @BuiltValueField(wireName: r'auditLogId')
  String? get auditLogId;

  @BuiltValueField(wireName: r'outboxEventIds')
  BuiltList<String> get outboxEventIds;

  @BuiltValueField(wireName: r'completedAt')
  DateTime get completedAt;

  @BuiltValueField(wireName: r'idempotentReplay')
  bool get idempotentReplay;

  CompletionResult._();

  factory CompletionResult([void updates(CompletionResultBuilder b)]) = _$CompletionResult;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(CompletionResultBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<CompletionResult> get serializer => _$CompletionResultSerializer();
}

class _$CompletionResultSerializer implements PrimitiveSerializer<CompletionResult> {
  @override
  final Iterable<Type> types = const [CompletionResult, _$CompletionResult];

  @override
  final String wireName = r'CompletionResult';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    CompletionResult object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'classSlotId';
    yield serializers.serialize(
      object.classSlotId,
      specifiedType: const FullType(String),
    );
    yield r'status';
    yield object.status == null ? null : serializers.serialize(
      object.status,
      specifiedType: const FullType.nullable(JsonObject),
    );
    yield r'attendanceCount';
    yield serializers.serialize(
      object.attendanceCount,
      specifiedType: const FullType(int),
    );
    if (object.noShowCount != null) {
      yield r'noShowCount';
      yield serializers.serialize(
        object.noShowCount,
        specifiedType: const FullType(int),
      );
    }
    if (object.releasedReservationIds != null) {
      yield r'releasedReservationIds';
      yield serializers.serialize(
        object.releasedReservationIds,
        specifiedType: const FullType(BuiltList, [FullType(String)]),
      );
    }
    yield r'ledgerEntryIds';
    yield serializers.serialize(
      object.ledgerEntryIds,
      specifiedType: const FullType(BuiltList, [FullType(String)]),
    );
    yield r'hourLogIds';
    yield serializers.serialize(
      object.hourLogIds,
      specifiedType: const FullType(BuiltList, [FullType(String)]),
    );
    if (object.auditLogId != null) {
      yield r'auditLogId';
      yield serializers.serialize(
        object.auditLogId,
        specifiedType: const FullType(String),
      );
    }
    yield r'outboxEventIds';
    yield serializers.serialize(
      object.outboxEventIds,
      specifiedType: const FullType(BuiltList, [FullType(String)]),
    );
    yield r'completedAt';
    yield serializers.serialize(
      object.completedAt,
      specifiedType: const FullType(DateTime),
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
    CompletionResult object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required CompletionResultBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'classSlotId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.classSlotId = valueDes;
          break;
        case r'status':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(JsonObject),
          ) as JsonObject?;
          if (valueDes == null) continue;
          result.status = valueDes;
          break;
        case r'attendanceCount':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.attendanceCount = valueDes;
          break;
        case r'noShowCount':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.noShowCount = valueDes;
          break;
        case r'releasedReservationIds':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(String)]),
          ) as BuiltList<String>;
          result.releasedReservationIds.replace(valueDes);
          break;
        case r'ledgerEntryIds':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(String)]),
          ) as BuiltList<String>;
          result.ledgerEntryIds.replace(valueDes);
          break;
        case r'hourLogIds':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(String)]),
          ) as BuiltList<String>;
          result.hourLogIds.replace(valueDes);
          break;
        case r'auditLogId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.auditLogId = valueDes;
          break;
        case r'outboxEventIds':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(String)]),
          ) as BuiltList<String>;
          result.outboxEventIds.replace(valueDes);
          break;
        case r'completedAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.completedAt = valueDes;
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
  CompletionResult deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = CompletionResultBuilder();
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

