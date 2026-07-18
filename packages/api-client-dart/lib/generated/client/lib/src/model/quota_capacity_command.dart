//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:openapi/src/model/effective_period.dart';
import 'package:openapi/src/model/date.dart';
import 'package:built_value/json_object.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'quota_capacity_command.g.dart';

/// QuotaCapacityCommand
///
/// Properties:
/// * [effectiveFrom] 
/// * [effectiveUntil] 
/// * [kind] 
/// * [branchId] 
/// * [classTypeId] 
/// * [minimumQuota] 
/// * [defaultCapacity] - Must be greater than or equal to minimumQuota
/// * [reason] 
@BuiltValue()
abstract class QuotaCapacityCommand implements EffectivePeriod, Built<QuotaCapacityCommand, QuotaCapacityCommandBuilder> {
  @BuiltValueField(wireName: r'branchId')
  String get branchId;

  @BuiltValueField(wireName: r'reason')
  String get reason;

  @BuiltValueField(wireName: r'kind')
  JsonObject? get kind;

  /// Must be greater than or equal to minimumQuota
  @BuiltValueField(wireName: r'defaultCapacity')
  int get defaultCapacity;

  @BuiltValueField(wireName: r'minimumQuota')
  int get minimumQuota;

  @BuiltValueField(wireName: r'classTypeId')
  String get classTypeId;

  QuotaCapacityCommand._();

  factory QuotaCapacityCommand([void updates(QuotaCapacityCommandBuilder b)]) = _$QuotaCapacityCommand;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(QuotaCapacityCommandBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<QuotaCapacityCommand> get serializer => _$QuotaCapacityCommandSerializer();
}

class _$QuotaCapacityCommandSerializer implements PrimitiveSerializer<QuotaCapacityCommand> {
  @override
  final Iterable<Type> types = const [QuotaCapacityCommand, _$QuotaCapacityCommand];

  @override
  final String wireName = r'QuotaCapacityCommand';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    QuotaCapacityCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'branchId';
    yield serializers.serialize(
      object.branchId,
      specifiedType: const FullType(String),
    );
    yield r'reason';
    yield serializers.serialize(
      object.reason,
      specifiedType: const FullType(String),
    );
    if (object.effectiveUntil != null) {
      yield r'effectiveUntil';
      yield serializers.serialize(
        object.effectiveUntil,
        specifiedType: const FullType.nullable(Date),
      );
    }
    yield r'kind';
    yield object.kind == null ? null : serializers.serialize(
      object.kind,
      specifiedType: const FullType.nullable(JsonObject),
    );
    yield r'defaultCapacity';
    yield serializers.serialize(
      object.defaultCapacity,
      specifiedType: const FullType(int),
    );
    yield r'minimumQuota';
    yield serializers.serialize(
      object.minimumQuota,
      specifiedType: const FullType(int),
    );
    yield r'effectiveFrom';
    yield serializers.serialize(
      object.effectiveFrom,
      specifiedType: const FullType(Date),
    );
    yield r'classTypeId';
    yield serializers.serialize(
      object.classTypeId,
      specifiedType: const FullType(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    QuotaCapacityCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required QuotaCapacityCommandBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'branchId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.branchId = valueDes;
          break;
        case r'reason':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.reason = valueDes;
          break;
        case r'effectiveUntil':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(Date),
          ) as Date?;
          if (valueDes == null) continue;
          result.effectiveUntil = valueDes;
          break;
        case r'kind':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(JsonObject),
          ) as JsonObject?;
          if (valueDes == null) continue;
          result.kind = valueDes;
          break;
        case r'defaultCapacity':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.defaultCapacity = valueDes;
          break;
        case r'minimumQuota':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.minimumQuota = valueDes;
          break;
        case r'effectiveFrom':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(Date),
          ) as Date;
          result.effectiveFrom = valueDes;
          break;
        case r'classTypeId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.classTypeId = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  QuotaCapacityCommand deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = QuotaCapacityCommandBuilder();
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

