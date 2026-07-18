//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'health_result_dependencies_inner.g.dart';

/// HealthResultDependenciesInner
///
/// Properties:
/// * [name] 
/// * [status] 
/// * [detailCode] 
@BuiltValue()
abstract class HealthResultDependenciesInner implements Built<HealthResultDependenciesInner, HealthResultDependenciesInnerBuilder> {
  @BuiltValueField(wireName: r'name')
  String get name;

  @BuiltValueField(wireName: r'status')
  HealthResultDependenciesInnerStatusEnum get status;
  // enum statusEnum {  READY,  DEGRADED,  NOT_READY,  };

  @BuiltValueField(wireName: r'detailCode')
  String? get detailCode;

  HealthResultDependenciesInner._();

  factory HealthResultDependenciesInner([void updates(HealthResultDependenciesInnerBuilder b)]) = _$HealthResultDependenciesInner;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(HealthResultDependenciesInnerBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<HealthResultDependenciesInner> get serializer => _$HealthResultDependenciesInnerSerializer();
}

class _$HealthResultDependenciesInnerSerializer implements PrimitiveSerializer<HealthResultDependenciesInner> {
  @override
  final Iterable<Type> types = const [HealthResultDependenciesInner, _$HealthResultDependenciesInner];

  @override
  final String wireName = r'HealthResultDependenciesInner';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    HealthResultDependenciesInner object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'name';
    yield serializers.serialize(
      object.name,
      specifiedType: const FullType(String),
    );
    yield r'status';
    yield serializers.serialize(
      object.status,
      specifiedType: const FullType(HealthResultDependenciesInnerStatusEnum),
    );
    if (object.detailCode != null) {
      yield r'detailCode';
      yield serializers.serialize(
        object.detailCode,
        specifiedType: const FullType.nullable(String),
      );
    }
  }

  @override
  Object serialize(
    Serializers serializers,
    HealthResultDependenciesInner object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required HealthResultDependenciesInnerBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'name':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.name = valueDes;
          break;
        case r'status':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(HealthResultDependenciesInnerStatusEnum),
          ) as HealthResultDependenciesInnerStatusEnum;
          result.status = valueDes;
          break;
        case r'detailCode':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.detailCode = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  HealthResultDependenciesInner deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = HealthResultDependenciesInnerBuilder();
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

class HealthResultDependenciesInnerStatusEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'READY')
  static const HealthResultDependenciesInnerStatusEnum READY = _$healthResultDependenciesInnerStatusEnum_READY;
  @BuiltValueEnumConst(wireName: r'DEGRADED')
  static const HealthResultDependenciesInnerStatusEnum DEGRADED = _$healthResultDependenciesInnerStatusEnum_DEGRADED;
  @BuiltValueEnumConst(wireName: r'NOT_READY')
  static const HealthResultDependenciesInnerStatusEnum NOT_READY = _$healthResultDependenciesInnerStatusEnum_NOT_READY;

  static Serializer<HealthResultDependenciesInnerStatusEnum> get serializer => _$healthResultDependenciesInnerStatusEnumSerializer;

  const HealthResultDependenciesInnerStatusEnum._(String name): super(name);

  static BuiltSet<HealthResultDependenciesInnerStatusEnum> get values => _$healthResultDependenciesInnerStatusEnumValues;
  static HealthResultDependenciesInnerStatusEnum valueOf(String name) => _$healthResultDependenciesInnerStatusEnumValueOf(name);
}

