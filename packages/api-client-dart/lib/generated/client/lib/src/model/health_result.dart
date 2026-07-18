//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/health_result_dependencies_inner.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'health_result.g.dart';

/// HealthResult
///
/// Properties:
/// * [status] 
/// * [checkedAt] 
/// * [dependencies] 
@BuiltValue()
abstract class HealthResult implements Built<HealthResult, HealthResultBuilder> {
  @BuiltValueField(wireName: r'status')
  HealthResultStatusEnum get status;
  // enum statusEnum {  READY,  DEGRADED,  NOT_READY,  };

  @BuiltValueField(wireName: r'checkedAt')
  DateTime get checkedAt;

  @BuiltValueField(wireName: r'dependencies')
  BuiltList<HealthResultDependenciesInner> get dependencies;

  HealthResult._();

  factory HealthResult([void updates(HealthResultBuilder b)]) = _$HealthResult;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(HealthResultBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<HealthResult> get serializer => _$HealthResultSerializer();
}

class _$HealthResultSerializer implements PrimitiveSerializer<HealthResult> {
  @override
  final Iterable<Type> types = const [HealthResult, _$HealthResult];

  @override
  final String wireName = r'HealthResult';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    HealthResult object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'status';
    yield serializers.serialize(
      object.status,
      specifiedType: const FullType(HealthResultStatusEnum),
    );
    yield r'checkedAt';
    yield serializers.serialize(
      object.checkedAt,
      specifiedType: const FullType(DateTime),
    );
    yield r'dependencies';
    yield serializers.serialize(
      object.dependencies,
      specifiedType: const FullType(BuiltList, [FullType(HealthResultDependenciesInner)]),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    HealthResult object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required HealthResultBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'status':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(HealthResultStatusEnum),
          ) as HealthResultStatusEnum;
          result.status = valueDes;
          break;
        case r'checkedAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.checkedAt = valueDes;
          break;
        case r'dependencies':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(HealthResultDependenciesInner)]),
          ) as BuiltList<HealthResultDependenciesInner>;
          result.dependencies.replace(valueDes);
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  HealthResult deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = HealthResultBuilder();
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

class HealthResultStatusEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'READY')
  static const HealthResultStatusEnum READY = _$healthResultStatusEnum_READY;
  @BuiltValueEnumConst(wireName: r'DEGRADED')
  static const HealthResultStatusEnum DEGRADED = _$healthResultStatusEnum_DEGRADED;
  @BuiltValueEnumConst(wireName: r'NOT_READY')
  static const HealthResultStatusEnum NOT_READY = _$healthResultStatusEnum_NOT_READY;

  static Serializer<HealthResultStatusEnum> get serializer => _$healthResultStatusEnumSerializer;

  const HealthResultStatusEnum._(String name): super(name);

  static BuiltSet<HealthResultStatusEnum> get values => _$healthResultStatusEnumValues;
  static HealthResultStatusEnum valueOf(String name) => _$healthResultStatusEnumValueOf(name);
}

