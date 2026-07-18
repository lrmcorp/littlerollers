//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/branch_period.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'close_result.g.dart';

/// CloseResult
///
/// Properties:
/// * [period] 
/// * [snapshotIds] 
/// * [auditLogId] 
/// * [closedAt] 
/// * [idempotentReplay] 
@BuiltValue()
abstract class CloseResult implements Built<CloseResult, CloseResultBuilder> {
  @BuiltValueField(wireName: r'period')
  BranchPeriod get period;

  @BuiltValueField(wireName: r'snapshotIds')
  BuiltList<String> get snapshotIds;

  @BuiltValueField(wireName: r'auditLogId')
  String get auditLogId;

  @BuiltValueField(wireName: r'closedAt')
  DateTime get closedAt;

  @BuiltValueField(wireName: r'idempotentReplay')
  bool get idempotentReplay;

  CloseResult._();

  factory CloseResult([void updates(CloseResultBuilder b)]) = _$CloseResult;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(CloseResultBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<CloseResult> get serializer => _$CloseResultSerializer();
}

class _$CloseResultSerializer implements PrimitiveSerializer<CloseResult> {
  @override
  final Iterable<Type> types = const [CloseResult, _$CloseResult];

  @override
  final String wireName = r'CloseResult';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    CloseResult object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'period';
    yield serializers.serialize(
      object.period,
      specifiedType: const FullType(BranchPeriod),
    );
    yield r'snapshotIds';
    yield serializers.serialize(
      object.snapshotIds,
      specifiedType: const FullType(BuiltList, [FullType(String)]),
    );
    yield r'auditLogId';
    yield serializers.serialize(
      object.auditLogId,
      specifiedType: const FullType(String),
    );
    yield r'closedAt';
    yield serializers.serialize(
      object.closedAt,
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
    CloseResult object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required CloseResultBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'period':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BranchPeriod),
          ) as BranchPeriod;
          result.period.replace(valueDes);
          break;
        case r'snapshotIds':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(String)]),
          ) as BuiltList<String>;
          result.snapshotIds.replace(valueDes);
          break;
        case r'auditLogId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.auditLogId = valueDes;
          break;
        case r'closedAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.closedAt = valueDes;
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
  CloseResult deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = CloseResultBuilder();
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

