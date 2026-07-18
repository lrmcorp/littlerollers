//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:openapi/src/model/date.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'effective_period.g.dart';

/// EffectivePeriod
///
/// Properties:
/// * [effectiveFrom] 
/// * [effectiveUntil] 
@BuiltValue(instantiable: false)
abstract class EffectivePeriod  {
  @BuiltValueField(wireName: r'effectiveFrom')
  Date get effectiveFrom;

  @BuiltValueField(wireName: r'effectiveUntil')
  Date? get effectiveUntil;

  @BuiltValueSerializer(custom: true)
  static Serializer<EffectivePeriod> get serializer => _$EffectivePeriodSerializer();
}

class _$EffectivePeriodSerializer implements PrimitiveSerializer<EffectivePeriod> {
  @override
  final Iterable<Type> types = const [EffectivePeriod];

  @override
  final String wireName = r'EffectivePeriod';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    EffectivePeriod object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'effectiveFrom';
    yield serializers.serialize(
      object.effectiveFrom,
      specifiedType: const FullType(Date),
    );
    if (object.effectiveUntil != null) {
      yield r'effectiveUntil';
      yield serializers.serialize(
        object.effectiveUntil,
        specifiedType: const FullType.nullable(Date),
      );
    }
  }

  @override
  Object serialize(
    Serializers serializers,
    EffectivePeriod object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  @override
  EffectivePeriod deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return serializers.deserialize(serialized, specifiedType: FullType($EffectivePeriod)) as $EffectivePeriod;
  }
}

/// a concrete implementation of [EffectivePeriod], since [EffectivePeriod] is not instantiable
@BuiltValue(instantiable: true)
abstract class $EffectivePeriod implements EffectivePeriod, Built<$EffectivePeriod, $EffectivePeriodBuilder> {
  $EffectivePeriod._();

  factory $EffectivePeriod([void Function($EffectivePeriodBuilder)? updates]) = _$$EffectivePeriod;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults($EffectivePeriodBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<$EffectivePeriod> get serializer => _$$EffectivePeriodSerializer();
}

class _$$EffectivePeriodSerializer implements PrimitiveSerializer<$EffectivePeriod> {
  @override
  final Iterable<Type> types = const [$EffectivePeriod, _$$EffectivePeriod];

  @override
  final String wireName = r'$EffectivePeriod';

  @override
  Object serialize(
    Serializers serializers,
    $EffectivePeriod object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return serializers.serialize(object, specifiedType: FullType(EffectivePeriod))!;
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required EffectivePeriodBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'effectiveFrom':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(Date),
          ) as Date;
          result.effectiveFrom = valueDes;
          break;
        case r'effectiveUntil':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(Date),
          ) as Date?;
          if (valueDes == null) continue;
          result.effectiveUntil = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  $EffectivePeriod deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = $EffectivePeriodBuilder();
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

